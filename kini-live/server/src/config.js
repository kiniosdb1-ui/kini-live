import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

function requireProductionValue(name, value) {
  if (isProduction && !value) {
    throw new Error(`${name} is required in production`);
  }
  return value;
}

function requireProductionSecret(name, value, minimumLength = 32) {
  const resolved = requireProductionValue(name, value);
  if (isProduction && resolved.length < minimumLength) {
    throw new Error(`${name} must be at least ${minimumLength} characters in production`);
  }
  return resolved;
}

function assertProduction(condition, message) {
  if (isProduction && !condition) {
    throw new Error(message);
  }
}

const clientOriginValue =
  requireProductionValue("CLIENT_ORIGINS", process.env.CLIENT_ORIGINS) ||
  "http://localhost:5173,http://127.0.0.1:5173";

const clientOrigins = clientOriginValue
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const mongoUri =
  requireProductionValue("MONGODB_URI", process.env.MONGODB_URI) ||
  "mongodb://127.0.0.1:27017/kini_outsourcing";

const turnstileSecret =
  requireProductionValue("TURNSTILE_SECRET_KEY", process.env.TURNSTILE_SECRET_KEY) ||
  "1x0000000000000000000000000000000AA";

const adminSessionSecret =
  requireProductionSecret(
    "ADMIN_SESSION_SECRET",
    process.env.ADMIN_SESSION_SECRET || "local-development-only-admin-session-secret",
  );

const adminResetUrl =
  requireProductionValue("ADMIN_RESET_URL", process.env.ADMIN_RESET_URL) ||
  "http://localhost:5173/admin";

assertProduction(clientOrigins.every((origin) => origin.startsWith("https://")), "CLIENT_ORIGINS must use HTTPS in production");
assertProduction(!mongoUri.includes("127.0.0.1") && !mongoUri.includes("localhost"), "MONGODB_URI cannot point to localhost in production");
assertProduction(!turnstileSecret.startsWith("1x000000"), "TURNSTILE_SECRET_KEY must be a live Cloudflare Turnstile secret in production");
assertProduction(adminResetUrl.startsWith("https://"), "ADMIN_RESET_URL must use HTTPS in production");
assertProduction(process.env.ENABLE_DEV_CAPTCHA_BYPASS !== "true", "ENABLE_DEV_CAPTCHA_BYPASS must not be true in production");
assertProduction(process.env.DISABLE_DEV_SMTP !== "true", "DISABLE_DEV_SMTP must not be true in production");
assertProduction(process.env.ENABLE_DEV_ADMIN_RESET !== "true", "ENABLE_DEV_ADMIN_RESET must not be true in production");

export const config = {
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri,
  clientOrigins,
  trustProxy: process.env.TRUST_PROXY === "true",
  turnstileSecret,
  adminEmail:
    requireProductionValue("ADMIN_EMAIL", process.env.ADMIN_EMAIL)?.trim().toLowerCase() ||
    "admin@localhost.invalid",
  adminPasswordHash:
    requireProductionValue("ADMIN_PASSWORD_HASH", process.env.ADMIN_PASSWORD_HASH) || "",
  adminSessionSecret,
  adminResetUrl,
  enableDevAdminReset:
    !isProduction && process.env.ENABLE_DEV_ADMIN_RESET === "true",
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
