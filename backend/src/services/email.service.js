import nodemailer from "nodemailer";
import { env } from "../config/env.js";

/**
 * Configure Nodemailer transport supporting both Google OAuth2 and Standard SMTP / App Passwords.
 */
const getTransporter = () => {
  // Option A: Google OAuth2 Transport (using Client ID, Client Secret & Refresh Token)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER || "sggokul762@gmail.com",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
      }
    });
  }

  // Option B: Standard SMTP / App Password Transport
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
  console.log("             [EMAIL SERVICE LOG]                        ");
  console.log(`To: ${email}`);
  console.log("Subject: Verify Your Dayflow Account");
  console.log(`Verification URL: ${verifyUrl}`);
  console.log("========================================================\n");

  const transporter = getTransporter();
  if (transporter) {
    try {
      const senderEmail = process.env.GMAIL_USER || process.env.SMTP_USER || "sggokul762@gmail.com";
      await transporter.sendMail({
        from: `"Dayflow HR" <${senderEmail}>`,
        to: email,
        subject: "Verify Your Dayflow Account",
        text: `Please verify your Dayflow account by opening the following link:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 8px;">
            <h2 style="color: #7c3aed;">Welcome to Dayflow HRMS</h2>
            <p>Please verify your email address to activate your workspace account.</p>
            <p style="margin: 25px 0;">
              <a href="${verifyUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </p>
            <p style="color: #64748b; font-size: 12px;">Or copy and paste this link into your browser:<br>${verifyUrl}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px;">This verification link will expire in 24 hours.</p>
          </div>
        `
      });
      console.log(`✅ Verification email successfully delivered to ${email}`);
    } catch (err) {
      console.error("❌ Failed to send verification email:", err.message);
    }
  } else {
    console.log("ℹ️ No email transport configured in .env. Logged URL to console.");
  }
};
