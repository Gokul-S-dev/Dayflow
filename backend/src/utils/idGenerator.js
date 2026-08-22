import crypto from "crypto";
import { Counter } from "../models/counter.model.js";

/**
 * Extracts a 2-character prefix from a company name.
 * e.g., "Odoo India" -> "OI", "Odoo" -> "OD"
 */
export const generateCompanyPrefix = (companyName) => {
  if (!companyName) return "XX";
  const words = companyName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return companyName.trim().slice(0, 2).padEnd(2, "X").toUpperCase();
};

/**
 * Extracts a 4-character code from first name and last name.
 * e.g., John Doe -> "JODO"
 */
export const generateEmployeeNameCode = (firstName, lastName) => {
  const first = (firstName || "").trim().slice(0, 2).padEnd(2, "X").toUpperCase();
  const last = (lastName || "").trim().slice(0, 2).padEnd(2, "X").toUpperCase();
  return first + last;
};

/**
 * Atomically generates the unique sequential Employee ID for the given company and joining year.
 * e.g., "OI" + "JODO" + "2026" + "0001" -> "OIJODO20260001"
 */
export const generateAtomicEmployeeId = async (companyPrefix, nameCode, joiningDate) => {
  const year = new Date(joiningDate).getFullYear().toString();
  const counterId = `employee_id_${companyPrefix}_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const serial = counter.seq.toString().padStart(4, "0");
  return `${companyPrefix}${nameCode}${year}${serial}`;
};

/**
 * Generates a secure, random temporary password.
 */
export const generateTemporaryPassword = () => {
  // Generates a 12-character secure alphanumeric string
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
};
