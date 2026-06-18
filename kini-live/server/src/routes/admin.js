import crypto from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import mongoose from "mongoose";
import { z } from "zod";
import { config } from "../config.js";
import {
  clearAdminSession,
  createAdminSession,
  requireAdmin,
  requireAllowedAdminOrigin,
  requireCsrf,
  hashAdminPassword,
  verifyAdminPassword,
} from "../lib/adminSecurity.js";
import { sendAdminPasswordReset } from "../lib/mailer.js";
import { AdminCredential } from "../models/AdminCredential.js";
import { AdminPasswordReset } from "../models/AdminPasswordReset.js";
import { AdminSession } from "../models/AdminSession.js";
import { Consultation, serviceNames } from "../models/Consultation.js";

const router = Router();

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store, max-age=0");
  res.set("Pragma", "no-cache");
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please wait before trying again." },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many password reset attempts. Please wait before trying again." },
});

const loginSchema = z.object({
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(256),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128)
      .regex(/[A-Za-z]/, "Password must include a letter.")
      .regex(/\d/, "Password must include a number."),
    confirmPassword: z.string().max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["all", "new", "contacted", "in_progress", "completed"]).default("all"),
  service: z.enum(["all", ...serviceNames]).default("all"),
  search: z.string().trim().max(80).default(""),
});

const updateSchema = z
  .object({
    status: z.enum(["new", "contacted", "in_progress", "completed"]).optional(),
    adminNotes: z.string().trim().max(2000).optional(),
  })
  .refine((value) => value.status !== undefined || value.adminNotes !== undefined, {
    message: "No changes provided.",
  });

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/login", loginLimiter, requireAllowedAdminOrigin, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    const credential = await AdminCredential.findOne({ key: "primary" }).lean();
    const passwordHash = credential?.passwordHash || config.adminPasswordHash;
    if (
      !parsed.success ||
      parsed.data.email !== config.adminEmail ||
      !verifyAdminPassword(parsed.data.password, passwordHash)
    ) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    await AdminSession.deleteMany({ expiresAt: mongoose.trusted({ $lte: new Date() }) });
    await clearAdminSession(req, res);
    await createAdminSession(req, res);
    return res.json({ authenticated: true, email: config.adminEmail });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/forgot-password",
  passwordResetLimiter,
  requireAllowedAdminOrigin,
  async (req, res, next) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      const response = {
        message: "If that admin email is valid, a password reset link has been sent.",
      };
      if (!parsed.success || parsed.data.email !== config.adminEmail) {
        return res.json(response);
      }

      const token = crypto.randomBytes(32).toString("base64url");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await AdminPasswordReset.deleteMany({ email: config.adminEmail });
      await AdminPasswordReset.create({ email: config.adminEmail, tokenHash, expiresAt });

      const resetUrl = new URL(config.adminResetUrl);
      resetUrl.searchParams.set("resetToken", token);
      try {
        await sendAdminPasswordReset(config.adminEmail, resetUrl.toString());
      } catch (mailError) {
        await AdminPasswordReset.deleteOne({ tokenHash });
        throw mailError;
      }

      return res.json({
        ...response,
        ...(config.enableDevAdminReset ? { devResetToken: token } : {}),
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  requireAllowedAdminOrigin,
  async (req, res, next) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.issues[0]?.message || "Invalid password reset request.",
        });
      }

      const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
      const reset = await AdminPasswordReset.findOne({
        tokenHash,
        expiresAt: mongoose.trusted({ $gt: new Date() }),
      });
      if (!reset) {
        return res.status(400).json({ message: "Reset link is invalid or has expired." });
      }

      await AdminCredential.findOneAndUpdate(
        { key: "primary" },
        {
          key: "primary",
          passwordHash: hashAdminPassword(parsed.data.password),
          passwordChangedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      await Promise.all([
        AdminPasswordReset.deleteMany({ email: config.adminEmail }),
        AdminSession.deleteMany({}),
      ]);
      return res.json({ success: true, message: "Password reset successfully. Please sign in." });
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/me", requireAdmin, (_req, res) => {
  res.json({ authenticated: true, email: config.adminEmail });
});

router.post(
  "/logout",
  requireAdmin,
  requireAllowedAdminOrigin,
  requireCsrf,
  async (req, res, next) => {
    try {
      await clearAdminSession(req, res);
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/stats", requireAdmin, async (_req, res, next) => {
  try {
    const [totals] = await Consultation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          contacted: { $sum: { $cond: [{ $eq: ["$status", "contacted"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
    ]);
    const recent = await Consultation.countDocuments({
      createdAt: mongoose.trusted({ $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }),
    });
    return res.json({
      total: totals?.total || 0,
      new: totals?.new || 0,
      contacted: totals?.contacted || 0,
      inProgress: totals?.inProgress || 0,
      completed: totals?.completed || 0,
      recent,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/consultations", requireAdmin, async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ message: "Invalid filters." });

    const { page, limit, status, service, search } = parsed.data;
    const filter = {};
    if (status !== "all") filter.status = status;
    if (service !== "all") filter.service = service;
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { name: pattern },
        { email: pattern },
        { phone: pattern },
        { service: pattern },
      ];
    }

    const [items, total] = await Promise.all([
      Consultation.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Consultation.countDocuments(filter),
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/consultations/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid consultation id." });
    }
    const consultation = await Consultation.findById(req.params.id).lean();
    if (!consultation) return res.status(404).json({ message: "Consultation not found." });
    return res.json(consultation);
  } catch (error) {
    return next(error);
  }
});

router.patch(
  "/consultations/:id",
  requireAdmin,
  requireAllowedAdminOrigin,
  requireCsrf,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid consultation id." });
      }
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid changes." });
      }
      const consultation = await Consultation.findByIdAndUpdate(
        req.params.id,
        { $set: parsed.data },
        { new: true, runValidators: true },
      ).lean();
      if (!consultation) return res.status(404).json({ message: "Consultation not found." });
      return res.json(consultation);
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
