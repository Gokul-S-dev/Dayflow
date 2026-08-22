import { AppError } from "../middleware/error.middleware.js";

const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const checkPasswordStrength = (password) => {
  return passwordStrengthRegex.test(password);
};

export const validateLogin = (req, res, next) => {
  const { login, password } = req.body;
  if (!login || typeof login !== "string" || !login.trim()) {
    return next(new AppError("Email or Employee ID is required", 400));
  }
  if (!password || typeof password !== "string" || !password.trim()) {
    return next(new AppError("Password is required", 400));
  }
  next();
};

export const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword) {
    return next(new AppError("Current password is required", 400));
  }
  if (!newPassword || !checkPasswordStrength(newPassword)) {
    return next(
      new AppError(
        "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        400
      )
    );
  }
  if (newPassword !== confirmPassword) {
    return next(new AppError("New password and confirmation password do not match", 400));
  }
  next();
};

export const validateSignup = (req, res, next) => {
  const { employeeId, email, password, role } = req.body;

  if (!employeeId || typeof employeeId !== "string" || !employeeId.trim()) {
    return next(new AppError("Employee ID is required", 400));
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return next(new AppError("A valid email is required", 400));
  }
  if (!password || !checkPasswordStrength(password)) {
    return next(
      new AppError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        400
      )
    );
  }
  if (!role || !["EMPLOYEE", "HR"].includes(role.toUpperCase())) {
    return next(new AppError("Role is required and must be either EMPLOYEE or HR", 400));
  }

  next();
};

export const validateSignupCompany = (req, res, next) => {
  const { companyName, firstName, lastName, email, phone, password, confirmPassword, role } = req.body;

  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    return next(new AppError("Company name is required", 400));
  }
  if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
    return next(new AppError("First name is required", 400));
  }
  if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
    return next(new AppError("Last name is required", 400));
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return next(new AppError("A valid email is required", 400));
  }
  if (!password || !checkPasswordStrength(password)) {
    return next(
      new AppError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        400
      )
    );
  }
  if (password !== confirmPassword) {
    return next(new AppError("Password and confirmation password do not match", 400));
  }
  if (role && !["ADMIN", "HR"].includes(role.toUpperCase())) {
    return next(new AppError("Role must be either ADMIN or HR", 400));
  }

  next();
};
