import crypto from "node:crypto";
import { config } from "../config.js";

export function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOtp(email, otp) {
  return crypto
    .createHmac("sha256", config.otpPepper)
    .update(`${email}:${otp}`)
    .digest("hex");
}

export function matchesOtp(email, otp, expectedHash) {
  const candidate = Buffer.from(hashOtp(email, otp), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}
