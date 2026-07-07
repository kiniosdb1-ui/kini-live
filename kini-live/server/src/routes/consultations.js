import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import mongoose from "mongoose";
import { z } from "zod";
import { config } from "../config.js";
import { notifyConsultant, sendOtpEmail } from "../lib/mailer.js";
import { createOtp, hashOtp, matchesOtp } from "../lib/security.js";
import { verifyTurnstile } from "../lib/turnstile.js";
import { Consultation, serviceNames } from "../models/Consultation.js";
import { EmailOtp } from "../models/EmailOtp.js";

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many verification requests. Please try again later." },
});

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

const requestOtpSchema = z.object({
  email: normalizedEmail,
  captchaToken: z.string().min(1).max(2048),
  companyWebsite: z.string().max(200).optional().default(""),
});

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
  otp: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code."),
  consent: z.literal(true),
  companyWebsite: z.string().max(200).optional().default(""),
});

function invalidRequest(res, error) {
  const message = error?.issues?.[0]?.message || "Invalid request.";
  return res.status(400).json({ message });
}

router.post("/request-otp", otpLimiter, async (req, res, next) => {
  try {
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success) return invalidRequest(res, parsed.error);

    if (parsed.data.companyWebsite) {
      return res.status(202).json({ message: "If the address is valid, a code will be sent." });
    }

    const captchaValid =
      config.enableDevCaptchaBypass && parsed.data.captchaToken === "postman-test"
        ? true
        : await verifyTurnstile(parsed.data.captchaToken, req.ip);
    if (!captchaValid) {
      return res.status(400).json({ message: "Human verification failed. Please retry." });
    }

    const existing = await EmailOtp.findOne({ email: parsed.data.email }).lean();
    if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < 60_000) {
      return res.status(429).json({ message: "Please wait one minute before requesting another code." });
    }

    const otp = createOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailOtp.findOneAndUpdate(
      { email: parsed.data.email },
      {
        email: parsed.data.email,
        otpHash: hashOtp(parsed.data.email, otp),
        attempts: 0,
        lastSentAt: new Date(),
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    try {
      await sendOtpEmail(parsed.data.email, otp);
    } catch (mailError) {
      await EmailOtp.deleteOne({ email: parsed.data.email });
      throw mailError;
    }

    return res.json({
      message: "Verification code sent.",
      ...(config.enableDevOtp ? { devOtp: otp } : {}),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/submit", submitLimiter, async (req, res, next) => {
  try {
    const parsed = consultationSchema.safeParse(req.body);
    if (!parsed.success) return invalidRequest(res, parsed.error);

    if (parsed.data.companyWebsite) {
      return res.status(202).json({ success: true });
    }

    const record = await EmailOtp.findOne({ email: parsed.data.email });
    if (!record || record.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({ message: "Verification code expired. Request a new code." });
    }

    if (record.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: record._id });
      return res.status(429).json({ message: "Too many incorrect attempts. Request a new code." });
    }

    if (!matchesOtp(parsed.data.email, parsed.data.otp, record.otpHash)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect verification code." });
    }

    const recentDuplicate = await Consultation.exists({
      email: parsed.data.email,
      createdAt: mongoose.trusted({ $gte: new Date(Date.now() - 5 * 60 * 1000) }),
    });
    if (recentDuplicate) {
      await EmailOtp.deleteOne({ _id: record._id });
      return res.status(409).json({ message: "A request was already submitted recently." });
    }

    const consultation = await Consultation.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      service: parsed.data.service,
      message: parsed.data.message,
    });
    await EmailOtp.deleteOne({ _id: record._id });

    notifyConsultant(consultation.toObject()).catch((error) => {
      console.error("Consultant notification failed:", error.message);
    });

    return res.status(201).json({ success: true, id: consultation._id });
  } catch (error) {
    return next(error);
  }
});

export default router;
