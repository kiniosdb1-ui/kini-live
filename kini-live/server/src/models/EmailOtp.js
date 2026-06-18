import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0, min: 0, max: 5 },
    lastSentAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    versionKey: false,
  },
);

export const EmailOtp = mongoose.model("EmailOtp", emailOtpSchema);
