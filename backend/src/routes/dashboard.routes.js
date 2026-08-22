import { Router } from "express";
import * as dashboardController from "../controller/dashboard.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/employee", protect, dashboardController.getEmployeeDashboard);
router.get("/admin", protect, restrictTo("ADMIN", "HR"), dashboardController.getAdminDashboard);

export default router;
