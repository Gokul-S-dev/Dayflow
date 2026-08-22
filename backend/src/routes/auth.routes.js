import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validateLogin,
  validateChangePassword,
  validateSignup,
  validateSignupCompany
} from "../validators/auth.validator.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/login", validateLogin, authController.login);
router.post("/signup", validateSignup, authController.signup);
router.post("/signup-company", upload.single("logo"), validateSignupCompany, authController.signupCompany);
router.get("/verify-email", authController.verifyEmail);
router.post("/refresh", authController.refresh);
router.post("/logout", protect, authController.logout);
router.post("/change-password", protect, validateChangePassword, authController.changePassword);

export default router;
