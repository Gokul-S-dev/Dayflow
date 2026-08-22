import { env } from "../config/env.js";

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (env.nodeEnv === "development") {
    response.stack = err.stack;
    response.error = err;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    err.statusCode = 409;
    response.message = "Duplicate value entered for a unique field";
    if (err.keyValue) {
      const keys = Object.keys(err.keyValue).join(", ");
      response.message = `Duplicate value for field(s): ${keys}. Please use another value.`;
    }
  }

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    err.statusCode = 400;
    response.message = Object.values(err.errors)
      .map((el) => el.message)
      .join(". ");
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    response.message = "Invalid token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    response.message = "Your token has expired. Please log in again.";
  }

  // Handle Multer errors
  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
    err.statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      response.message = "File is too large. Maximum size allowed is 2 MB.";
    } else {
      response.message = `File upload error: ${err.message}`;
    }
  }

  res.status(err.statusCode).json(response);
};
