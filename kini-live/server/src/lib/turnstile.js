import { config } from "../config.js";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token, remoteIp) {
  if (!token || typeof token !== "string" || token.length > 2048) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: config.turnstileSecret,
        response: token,
        remoteip: remoteIp,
      }),
      signal: controller.signal,
    });
    const result = await response.json();
    return Boolean(result.success);
  } catch(err) {
    console.error("TURNSTILE ERROR:", err);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
