import { Router } from "express";
import * as leaveController from "../controller/leave.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/balances", protect, leaveController.getLeaveBalances);
router.get("/requests", protect, leaveController.getLeaveRequests);
router.get("/", protect, leaveController.getLeaveRequests); // Expose synonym route /leaves
router.post("/apply", protect, leaveController.applyLeave);
router.patch("/requests/:id/approve", protect, restrictTo("ADMIN", "HR"), leaveController.approveLeave);
router.patch("/requests/:id/reject", protect, restrictTo("ADMIN", "HR"), leaveController.rejectLeave);

export default router;
