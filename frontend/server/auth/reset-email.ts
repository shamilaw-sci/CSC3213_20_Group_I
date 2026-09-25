import "server-only";
import nodemailer from "nodemailer";

export function createPasswordResetMailer() {
  const production = process.env.NODE_ENV === "production";
  const mode = process.env.MAIL_TRANSPORT ?? (production ? "smtp" : "console");
  const base = new URL(process.env.APP_URL ?? "http://localhost:3000");
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password ||
      (production && (base.protocol !== "https:" || !process.env.APP_URL))) {
    throw new Error("APP_URL must be a valid application URL (HTTPS in production).");
  }

  const resetUrl = (token: string) => {
    const url = new URL("/reset-password", base);
    url.searchParams.set("token", token);
    return url.toString();
  };

  if (mode === "console" && !production) {
    return async (_email: string, token: string) => {
      console.info(`TryVora development password-reset link: ${resetUrl(token)}`);
    };
  }
  if (mode !== "smtp") throw new Error("Production reset delivery requires MAIL_TRANSPORT=smtp.");

  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secureValue = process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false");
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM ||
      !Number.isInteger(port) || port < 1 || port > 65535 || !["true", "false"].includes(secureValue)) {
    throw new Error("SMTP settings are missing or invalid.");
  }
  const secure = secureValue === "true";
  const transport = nodemailer.createTransport({
    host: SMTP_HOST, port, secure, requireTLS: !secure,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  return async (email: string, token: string) => {
    const result = await transport.sendMail({
      from: SMTP_FROM, to: email, subject: "Reset your TryVora password",
      text: `Use this link to reset your password:\n\n${resetUrl(token)}\n\nThis link expires in one hour and can be used once. If you did not request it, ignore this email.`,
    });
    if (result.accepted.length === 0) throw new Error("Reset email was not accepted for delivery.");
  };
}
