import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Optional SMTP Transporter configuration
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

/**
 * Sends a verification link to a newly registered user's email.
 */
export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `http://localhost:5173/verify-email?token=${token}`;

  console.log("\n========================================================");
  console.log("             [MOCK EMAIL SERVICE]                       ");
  console.log(`To: ${email}`);
  console.log("Subject: Verify Your Dayflow Account");
  console.log(`Verification URL: ${verifyUrl}`);
  console.log("========================================================\n");

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Dayflow HR" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your Dayflow Account",
        text: `Please verify your Dayflow account by opening the following link:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.`,
        html: `<p>Please verify your Dayflow account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link will expire in 24 hours.</p>`
      });
      console.log(`Real verification email successfully sent to ${email}`);
    } catch (err) {
      console.error("Failed to send real SMTP verification email:", err.message);
    }
  }
};
