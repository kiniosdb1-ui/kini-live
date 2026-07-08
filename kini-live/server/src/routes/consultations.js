import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import mongoose from "mongoose";
import { z } from "zod";
import { config } from "../config.js";
import { notifyConsultant } from "../lib/mailer.js";
import { verifyTurnstile } from "../lib/turnstile.js";
import { Consultation, serviceNames } from "../models/Consultation.js";

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many consultation attempts. Please try again later." },
});

const normalizedEmail = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(160)
  .transform((value) => value.toLowerCase());

const consultationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: normalizedEmail,
  phone: z
    .string()
    .trim()
    .min(8)
    .max(18)
    .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number."),
  service: z.enum(serviceNames),
  message: z.string().trim().min(20).max(1500),
  captchaToken: z.string().min(1).max(2048),
  consent: z.literal(true),
  companyWebsite: z.string().max(200).optional().default(""),
});

function invalidRequest(res, error) {
  const message = error?.issues?.[0]?.message || "Invalid request.";
  return res.status(400).json({ message });
}

router.post("/submit", submitLimiter, async (req, res, next) => {
  try {
    const parsed = consultationSchema.safeParse(req.body);
    if (!parsed.success) return invalidRequest(res, parsed.error);

    if (parsed.data.companyWebsite) {
      return res.status(202).json({ success: true });
    }

    const captchaValid =
      config.enableDevCaptchaBypass && parsed.data.captchaToken === "postman-test"
        ? true
        : await verifyTurnstile(parsed.data.captchaToken, req.ip);
    if (!captchaValid) {
      return res.status(400).json({ message: "Human verification failed. Please retry." });
    }

    const recentDuplicate = await Consultation.exists({
      email: parsed.data.email,
      createdAt: mongoose.trusted({ $gte: new Date(Date.now() - 5 * 60 * 1000) }),
    });
    if (recentDuplicate) {
      return res.status(409).json({ message: "A request was already submitted recently." });
    }

    const consultation = await Consultation.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      service: parsed.data.service,
      message: parsed.data.message,
    });

    notifyConsultant(consultation.toObject()).catch((error) => {
      console.error("Consultant notification failed:", error.message);
    });

    return res.status(201).json({ success: true, id: consultation._id });
  } catch (error) {
    return next(error);
  }
});

export default router;
