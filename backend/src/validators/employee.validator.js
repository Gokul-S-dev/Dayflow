import { AppError } from "../middleware/error.middleware.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateEmployee = (req, res, next) => {
  const { companyName, firstName, lastName, email, phone, joiningDate, role } = req.body;

  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    return next(new AppError("Company name is required", 400));
  }
  if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
    return next(new AppError("First name is required", 400));
  }
  if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
    return next(new AppError("Last name is required", 400));
  }
  if (!email || !emailRegex.test(email)) {
    return next(new AppError("A valid email is required", 400));
  }
  if (phone && typeof phone !== "string") {
    return next(new AppError("Phone must be a string", 400));
  }
  if (!joiningDate || isNaN(Date.parse(joiningDate))) {
    return next(new AppError("A valid joining date is required", 400));
  }
  if (!role || !["ADMIN", "HR", "EMPLOYEE"].includes(role.toUpperCase())) {
    return next(new AppError("Role must be one of ADMIN, HR, or EMPLOYEE", 400));
  }

  next();
};

export const validateUpdateEmployee = (req, res, next) => {
  const userRole = req.user.role;
  const targetId = req.params.id;
  const currentUserId = req.user._id.toString();

  // If normal employee, enforce permissions:
  if (userRole === "EMPLOYEE") {
    // Employee can only update their own profile
    if (targetId !== currentUserId) {
      return next(new AppError("You are not authorized to update this employee profile", 403));
    }

    // Employee can only update phone, address, profilePicture
    const allowedKeys = ["phone", "address", "profilePicture"];
    const inputKeys = Object.keys(req.body);
    const forbiddenKeys = inputKeys.filter(key => !allowedKeys.includes(key));

    if (forbiddenKeys.length > 0) {
      return next(
        new AppError(
          `Employees are not allowed to update fields: ${forbiddenKeys.join(", ")}`,
          403
        )
      );
    }
  } else {
    // Admin/HR can update fields, but prevent updates to employeeId, companyId, passwordHash
    const forbiddenKeys = ["employeeId", "companyId", "passwordHash"];
    const inputKeys = Object.keys(req.body);
    const violatingKeys = inputKeys.filter(key => forbiddenKeys.includes(key));

    if (violatingKeys.length > 0) {
      return next(
        new AppError(
          `Modifying protected fields: ${violatingKeys.join(", ")} is not allowed`,
          400
        )
      );
    }
  }

  // Validate phone format if present
  if (req.body.phone && typeof req.body.phone !== "string") {
    return next(new AppError("Phone must be a string", 400));
  }

  // Validate email format if present
  if (req.body.email && !emailRegex.test(req.body.email)) {
    return next(new AppError("A valid email is required", 400));
  }

  // Validate role if present
  if (req.body.role && !["ADMIN", "HR", "EMPLOYEE"].includes(req.body.role.toUpperCase())) {
    return next(new AppError("Role must be one of ADMIN, HR, or EMPLOYEE", 400));
  }

  // Validate accountStatus if present
  if (req.body.accountStatus && !["PENDING", "APPROVED", "REJECTED"].includes(req.body.accountStatus.toUpperCase())) {
    return next(new AppError("accountStatus must be one of PENDING, APPROVED, or REJECTED", 400));
  }

  next();
};
