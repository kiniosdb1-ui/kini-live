import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

function requireProductionValue(name, value) {
  if (isProduction && !value) {
    throw new Error(`${name} is required in production`);
  }
  return value;
}

const clientOriginValue =
  requireProductionValue("CLIENT_ORIGINS", process.env.CLIENT_ORIGINS) ||
  "http://localhost:5173,http://127.0.0.1:5173";

export const config = {
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: requireProductionValue("MONGODB_URI", process.env.MONGODB_URI) || "mongodb://127.0.0.1:27017/kini_outsourcing",
  clientOrigins: clientOriginValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  trustProxy: process.env.TRUST_PROXY === "true",
  turnstileSecret:
    requireProductionValue("TURNSTILE_SECRET_KEY", process.env.TURNSTILE_SECRET_KEY) ||
    "1x0000000000000000000000000000000AA",
  otpPepper:
    requireProductionValue("OTP_PEPPER", process.env.OTP_PEPPER) ||
    "local-development-only-otp-pepper",
  adminEmail:
    requireProductionValue("ADMIN_EMAIL", process.env.ADMIN_EMAIL)?.trim().toLowerCase() ||
    "admin@localhost.invalid",
  adminPasswordHash:
    requireProductionValue("ADMIN_PASSWORD_HASH", process.env.ADMIN_PASSWORD_HASH) || "",
  adminSessionSecret:
    requireProductionValue("ADMIN_SESSION_SECRET", process.env.ADMIN_SESSION_SECRET) ||
    "local-development-only-admin-session-secret",
  adminResetUrl:
    process.env.ADMIN_RESET_URL || "http://localhost:5173/admin",
  enableDevAdminReset:
    !isProduction && process.env.ENABLE_DEV_ADMIN_RESET === "true",
  enableDevOtp: !isProduction && process.env.ENABLE_DEV_OTP !== "false",
  enableDevCaptchaBypass:
    !isProduction && process.env.ENABLE_DEV_CAPTCHA_BYPASS === "true",
  disableDevSmtp: !isProduction && process.env.DISABLE_DEV_SMTP === "true",
  smtp: {
    host: requireProductionValue("SMTP_HOST", process.env.SMTP_HOST) || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: requireProductionValue("SMTP_USER", process.env.SMTP_USER) || "",
    pass: requireProductionValue("SMTP_PASS", process.env.SMTP_PASS) || "",
    from:
      requireProductionValue("MAIL_FROM", process.env.MAIL_FROM) ||
      "KINi Outsourcing Services <no-reply@example.com>",
  },
  consultantEmail: process.env.CONSULTANT_EMAIL || "kinioutsourcingservices@gmail.com",
};
