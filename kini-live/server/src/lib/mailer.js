import nodemailer from "nodemailer";
import { config } from "../config.js";

const hasSmtp = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
  console.log("SMTP CONFIG:", {
  host: config.smtp.host,
  user: config.smtp.user,
  hasPass: !!config.smtp.pass,
});
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

export async function sendOtpEmail(email, otp) {
  console.log("sendOtpEmail called:", email);
  if (!transporter) {
    if (config.isProduction) throw new Error("SMTP is not configured");
    console.info(`[development] OTP for ${email}: ${otp}`);
    return;
  }
  console.log("Sending email...");

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Your KINi consultation verification code",
    text: `Your KINi Outsourcing Services verification code is ${otp}. It expires in 10 minutes. Do not share this code.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#171714">
        <h2 style="margin-bottom:10px">Verify your consultation request</h2>
        <p>Your one-time verification code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${otp}</p>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
        <p style="color:#666">KINi Outsourcing Services</p>
      </div>
    `,
  });
  console.log("Email sent successfully");
}

export async function sendAdminPasswordReset(email, resetUrl) {
  if (!transporter) {
    if (config.isProduction) throw new Error("SMTP is not configured");
    console.info(`[development] Admin password reset link: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Reset your KINi admin password",
    text: `Use this link to reset your KINi admin password: ${resetUrl}\n\nThis link expires in 15 minutes and can be used only once. If you did not request it, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#171714">
        <h2>Reset your admin password</h2>
        <p>A password reset was requested for your KINi admin account.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#b78b47;color:#fff;text-decoration:none;border-radius:4px">Reset password</a>
        </p>
        <p>This link expires in 15 minutes and can be used only once.</p>
        <p>If you did not request this change, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function notifyConsultant(consultation) {
  if (!transporter) return;

  const safe = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.consultantEmail,
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
