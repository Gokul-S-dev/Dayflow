import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./error.middleware.js";
import * as userRepository from "../repositories/user.repository.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to get access.", 401));
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtAccessSecret);

    // Check if user still exists
    const currentUser = await userRepository.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError("User account has been deactivated.", 403));
    }

    // Grant access
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};
