import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/user.repository.js";
import * as companyRepository from "../repositories/company.repository.js";
import { User } from "../models/user.model.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  generateCompanyPrefix,
  generateEmployeeNameCode,
  generateAtomicEmployeeId,
  generateTemporaryPassword
} from "../utils/idGenerator.js";

/**
 * Creates a new employee account.
 */
export const createEmployee = async (employeeData) => {
  const { companyName, firstName, lastName, email, phone, joiningDate, role } = employeeData;

  // Check if email already registered
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  // Resolve company
  let company = await companyRepository.findByName(companyName);
  if (!company) {
    const prefix = generateCompanyPrefix(companyName);
    company = await companyRepository.create({
      name: companyName,
      prefix
    });
  }

  // Generate ID prefix and employee code
  const nameCode = generateEmployeeNameCode(firstName, lastName);

  // Atomically generate unique sequential Employee ID
  const employeeId = await generateAtomicEmployeeId(company.prefix, nameCode, joiningDate);

  // Verify uniqueness
  const existingId = await userRepository.findByEmployeeId(employeeId);
  if (existingId) {
    throw new AppError("Generated Employee ID already exists (concurrency conflict). Please retry.", 409);
  }

  // Generate temporary password
  const tempPassword = generateTemporaryPassword();

  // Hash temporary password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(tempPassword, salt);

  // Save employee
  const newUser = await userRepository.create({
    employeeId,
    companyId: company._id,
    firstName,
    lastName,
    email,
    phone,
    passwordHash,
    role: role.toUpperCase(),
    joiningDate: new Date(joiningDate),
    isActive: true,
    isFirstLogin: true
  });

  return {
    employee: {
      id: newUser._id,
      employeeId: newUser.employeeId,
      company: {
        id: company._id,
        name: company.name,
        prefix: company.prefix
      },
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      joiningDate: newUser.joiningDate,
      isActive: newUser.isActive,
      isFirstLogin: newUser.isFirstLogin,
      createdAt: newUser.createdAt
    },
    temporaryPassword: tempPassword
  };
};

/**
 * Retrieves all employees with filters and pagination.
 */
export const getEmployees = async (companyId, filter = {}) => {
  const query = { companyId, role: "EMPLOYEE" };

  if (filter.search) {
    const searchRegex = new RegExp(filter.search, "i");
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex }
    ];
  }

  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .populate("companyId")
    .skip(skip)
    .limit(limit);

  return users.map((u) => ({
    id: u._id,
    employeeId: u.employeeId,
    companyId: u.companyId ? u.companyId._id : null,
    companyName: u.companyId ? u.companyId.name : null,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    joiningDate: u.joiningDate,
    isActive: u.isActive,
    isFirstLogin: u.isFirstLogin,
    address: u.address,
    profilePicture: u.profilePicture,
    createdAt: u.createdAt
  }));
};

/**
 * Retrieves a single employee by ID.
 */
export const getEmployeeById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Employee not found", 404);
  }

  return {
    id: user._id,
    employeeId: user.employeeId,
    companyId: user.companyId ? user.companyId._id : null,
    companyName: user.companyId ? user.companyId.name : null,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    joiningDate: user.joiningDate,
    isActive: user.isActive,
    isFirstLogin: user.isFirstLogin,
    address: user.address,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt
  };
};

/**
 * Updates employee information.
 */
export const updateEmployee = async (id, updateData) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Employee not found", 404);
  }

  const updatedUser = await userRepository.update(id, updateData);

  return {
    id: updatedUser._id,
    employeeId: updatedUser.employeeId,
    companyName: updatedUser.companyId ? updatedUser.companyId.name : null,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: updatedUser.role,
    joiningDate: updatedUser.joiningDate,
    isActive: updatedUser.isActive,
    isFirstLogin: updatedUser.isFirstLogin,
    address: updatedUser.address,
    profilePicture: updatedUser.profilePicture,
    updatedAt: updatedUser.updatedAt
  };
};
