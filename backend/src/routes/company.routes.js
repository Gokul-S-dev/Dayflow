import { Router } from "express";
import * as companyController from "../controller/company.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Protect all company routes
router.use(protect);

// Only ADMIN and HR roles can create companies
router.post("/", restrictTo("ADMIN", "HR"), upload.single("logo"), companyController.createCompany);

export default router;
