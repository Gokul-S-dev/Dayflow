import { User } from "../models/user.model.js";

export const findByEmailOrEmployeeId = async (login) => {
  if (!login) return null;
  return User.findOne({
    $or: [
      { email: login.toLowerCase() },
      { employeeId: login.toUpperCase() }
    ]
  }).populate("companyId");
};

export const findById = async (id) => {
  return User.findById(id).populate("companyId");
};

export const findByEmail = async (email) => {
  if (!email) return null;
  return User.findOne({ email: email.toLowerCase() });
};

export const findByEmployeeId = async (employeeId) => {
  if (!employeeId) return null;
  return User.findOne({ employeeId: employeeId.toUpperCase() });
};

export const create = async (userData) => {
  const newUser = await User.create(userData);
  return newUser.populate("companyId");
};

export const update = async (id, updateData) => {
  return User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate("companyId");
};

export const findAll = async (query = {}) => {
  return User.find(query).populate("companyId");
};

export const findByVerificationToken = async (token) => {
  if (!token) return null;
  return User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }
  }).populate("companyId");
};
