import nodemailer from "nodemailer";

const smtpPort = Number(
  process.env.SMTP_PORT ?? 587
);

export const mailTransporter =
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,

    port: smtpPort,

    secure:
      process.env.SMTP_SECURE === "true",

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

export function getMailFrom() {
  const name =
    process.env.SMTP_FROM_NAME ??
    "SDP Machines";

  const email =
    process.env.SMTP_FROM_EMAIL ??
    process.env.SMTP_USER;

  if (!email) {
    throw new Error(
      "SMTP_FROM_EMAIL or SMTP_USER is not configured."
    );
  }

  return `"${name}" <${email}>`;
}

export async function verifyMailConnection() {
  return mailTransporter.verify();
}