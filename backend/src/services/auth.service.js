import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import crypto from "crypto";
import { env } from "../config/env.js";
import * as userRepository from "../repositories/user.repository.js";
import { AppError } from "../middleware/error.middleware.js";
import { createCompany } from "./company.service.js";
import { generateEmployeeNameCode, generateAtomicEmployeeId } from "../utils/idGenerator.js";
import { sendVerificationEmail } from "./email.service.js";

/**
 * Generates access and refresh tokens for a user.
 */
export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    employeeId: user.employeeId,
    role: user.role
  };

  const accessToken = jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });

  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });

  return { accessToken, refreshToken };
};

/**
 * Authenticates a user by login credential (email or employeeId) and password.
 */
export const login = async (loginCredential, password) => {
  const user = await userRepository.findByEmailOrEmployeeId(loginCredential);
  if (!user) {
    throw new AppError("Invalid email/login ID or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated. Please contact support.", 403);
  }

  // 1. Password comparison
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email/login ID or password", 401);
  }

  // 2. Email Verification Gate
  if (!user.emailVerified) {
    throw new AppError("Please verify your email before signing in.", 403);
  }

  // 3. Approval Gate
  if (user.accountStatus === "PENDING") {
    throw new AppError("Your account is awaiting HR approval.", 403);
  }
  if (user.accountStatus === "REJECTED") {
    throw new AppError("Your account has not been approved. Please contact HR.", 403);
  }

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user: {
      id: user._id,
      employeeId: user.employeeId,
      loginId: user.loginId || user.employeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    },
    requiresPasswordChange: user.isFirstLogin,
    ...tokens
  };
};

/**
 * Registers / activates an employee account already provisioned in the system.
 */
export const signupEmployee = async (employeeId, email, password, role) => {
  const user = await userRepository.findByEmployeeId(employeeId);
  if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AppError("Employee record with these credentials does not exist in the system", 404);
  }

  // Check if user is already active
  if (user.passwordHash && !user.isFirstLogin && user.emailVerified) {
    throw new AppError("Account already registered. Please login instead.", 400);
  }

  if (user.role !== role.toUpperCase()) {
    throw new AppError("Specified role does not match the registered user role", 400);
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Update user and set to pending approval + unverified email
  const updatedUser = await userRepository.update(user._id, {
    loginId: employeeId,
    passwordHash,
    isFirstLogin: false,
    emailVerified: false,
    accountStatus: "PENDING",
    verificationToken: token,
    verificationTokenExpires: expires
  });

  // Send verification email
  await sendVerificationEmail(updatedUser.email, token);

  return {
    user: {
      id: updatedUser._id,
      employeeId: updatedUser.employeeId,
      email: updatedUser.email,
      role: updatedUser.role
    },
    verificationToken: token
  };
};

/**
 * Registers a new Company and the initial HR/Admin user.
 */
export const signupCompany = async (companyData) => {
  const { companyName, tempFile, firstName, lastName, email, phone, password, role } = companyData;

  // Check if user email already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    if (tempFile && fs.existsSync(tempFile.path)) {
      fs.unlinkSync(tempFile.path);
    }
    throw new AppError("Email is already registered", 409);
  }

  // 1. Create company using company service
  const company = await createCompany(companyName, tempFile);

  // 2. Generate employee ID for the first user
  const nameCode = generateEmployeeNameCode(firstName, lastName);
  const employeeId = await generateAtomicEmployeeId(company.prefix, nameCode, new Date());

  // 3. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 4. Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // 5. Create user
  // (The registrar is the primary admin of the workspace, so they are auto-approved but must still verify email)
  const newUser = await userRepository.create({
    employeeId,
    loginId: employeeId,
    companyId: company._id,
    firstName,
    lastName,
    email,
    phone,
    passwordHash,
    role: role ? role.toUpperCase() : "HR",
    joiningDate: new Date(),
    isActive: true,
    isFirstLogin: false,
    emailVerified: false,
    accountStatus: "APPROVED",
    verificationToken: token,
    verificationTokenExpires: expires
  });

  // Send verification email
  await sendVerificationEmail(newUser.email, token);

  return {
    user: {
      id: newUser._id,
      employeeId: newUser.employeeId,
      companyName: company.name,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role
    },
    verificationToken: token
  };
};

/**
 * Verifies email via secure token lookup.
 */
export const verifyEmail = async (token) => {
  const user = await userRepository.findByVerificationToken(token);
  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  // Update verification status
  const updatedUser = await userRepository.update(user._id, {
    emailVerified: true,
    verificationToken: null,
    verificationTokenExpires: null
  });

  return {
    id: updatedUser._id,
    employeeId: updatedUser.employeeId,
    email: updatedUser.email,
    emailVerified: updatedUser.emailVerified,
    accountStatus: updatedUser.accountStatus
  };
};

/**
 * Changes a user's password.
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Incorrect current password", 401);
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Update password and reset isFirstLogin
  const updatedUser = await userRepository.update(userId, {
    passwordHash,
    isFirstLogin: false
  });

  return {
    id: updatedUser._id,
    employeeId: updatedUser.employeeId,
    email: updatedUser.email,
    isFirstLogin: updatedUser.isFirstLogin
  };
};

/**
 * Refreshes an access token.
 */
export const refreshTokens = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
    const user = await userRepository.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError("User not found or account deactivated", 401);
    }

    const tokens = generateTokens(user);
    return tokens;
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }
};
