import nodemailer from "nodemailer";
import { config } from "../config.js";

const hasSmtp = !config.disableDevSmtp && Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
    })
  : null;

export async function notifyConsultant(consultation) {
  if (!transporter) return;

  const safe = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.consultantEmails,
    replyTo: consultation.email,
    subject: `New consultation: ${consultation.service}`,
    text: [
      `Name: ${consultation.name}`,
      `Email: ${consultation.email}`,
      `Phone: ${consultation.phone}`,
      `Service: ${consultation.service}`,
      "",
      consultation.message,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:28px;color:#171714">
        <h2>New verified consultation request</h2>
        <p><strong>Name:</strong> ${safe(consultation.name)}</p>
        <p><strong>Email:</strong> ${safe(consultation.email)}</p>
        <p><strong>Phone:</strong> ${safe(consultation.phone)}</p>
        <p><strong>Service:</strong> ${safe(consultation.service)}</p>
        <p><strong>Message:</strong></p>
        <p>${safe(consultation.message)}</p>
      </div>
    `,
  });
}

export async function sendAdminPasswordReset(email, resetUrl) {
  if (!transporter) {
    if (config.isProduction) throw new Error("SMTP is not configured");
    console.info(`[development] Admin password reset link for ${email}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Reset your KINi admin password",
    text: `Use this secure link to reset your KINi admin password: ${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#171714">
        <h2 style="margin-bottom:10px">Reset your admin password</h2>
        <p>Use the secure link below to set a new KINi admin password.</p>
        <p><a href="${resetUrl}" style="display:inline-block;margin:18px 0;padding:12px 18px;background:#171714;color:#fff;text-decoration:none;border-radius:6px">Reset password</a></p>
        <p>This link expires in 15 minutes. If you did not request this, ignore this email.</p>
        <p style="color:#666">KINi Outsourcing Services</p>
      </div>
    `,
  });
}
