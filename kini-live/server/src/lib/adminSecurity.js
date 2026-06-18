import crypto from "node:crypto";
import mongoose from "mongoose";
import { config } from "../config.js";
import { AdminSession } from "../models/AdminSession.js";

const SESSION_HOURS = 8;

export const sessionCookieName = config.isProduction
  ? "__Host-kini_admin_session"
  : "kini_admin_session";
export const csrfCookieName = config.isProduction
  ? "__Host-kini_admin_csrf"
  : "kini_admin_csrf";

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function metadataHash(value) {
  return crypto
    .createHmac("sha256", config.adminSessionSecret)
    .update(value || "")
    .digest("hex");
}

function secureEqual(first, second) {
  if (typeof first !== "string" || typeof second !== "string") return false;
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        return [
          decodeURIComponent(separator >= 0 ? part.slice(0, separator) : part),
          decodeURIComponent(separator >= 0 ? part.slice(separator + 1) : ""),
        ];
      }),
  );
}

function cookieOptions(httpOnly) {
  return {
    httpOnly,
    secure: config.isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  };
}

export function hashAdminPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${passwordHash}`;
}

export function verifyAdminPassword(password, storedHash = config.adminPasswordHash) {
  if (!storedHash || typeof password !== "string") return false;
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export async function createAdminSession(req, res) {
  const sessionToken = crypto.randomBytes(32).toString("base64url");
  const csrfToken = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);

  await AdminSession.create({
    tokenHash: hash(sessionToken),
    csrfHash: hash(csrfToken),
    userAgentHash: metadataHash(req.get("user-agent")),
    lastSeenAt: new Date(),
    expiresAt,
  });

  res.cookie(sessionCookieName, sessionToken, cookieOptions(true));
  res.cookie(csrfCookieName, csrfToken, cookieOptions(false));
}

export async function clearAdminSession(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[sessionCookieName];
  if (token) await AdminSession.deleteOne({ tokenHash: hash(token) });
  res.clearCookie(sessionCookieName, { ...cookieOptions(true), maxAge: undefined });
  res.clearCookie(csrfCookieName, { ...cookieOptions(false), maxAge: undefined });
}

export async function requireAdmin(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[sessionCookieName];
    if (!token) return res.status(401).json({ message: "Admin authentication required." });

    const session = await AdminSession.findOne({
      tokenHash: hash(token),
      expiresAt: mongoose.trusted({ $gt: new Date() }),
    });
    if (!session || !secureEqual(session.userAgentHash, metadataHash(req.get("user-agent")))) {
      if (session) await AdminSession.deleteOne({ _id: session._id });
      return res.status(401).json({ message: "Admin session expired." });
    }

    session.lastSeenAt = new Date();
    await session.save();
    req.adminSession = session;
    req.adminCookies = cookies;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAllowedAdminOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin || !config.clientOrigins.includes(origin)) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }
  return next();
}

export function requireCsrf(req, res, next) {
  const headerToken = req.get("x-csrf-token");
  const cookieToken = req.adminCookies?.[csrfCookieName];
  if (
    !headerToken ||
    !cookieToken ||
    !secureEqual(headerToken, cookieToken) ||
    !secureEqual(hash(headerToken), req.adminSession.csrfHash)
  ) {
    return res.status(403).json({ message: "Security token validation failed." });
  }
  return next();
}
