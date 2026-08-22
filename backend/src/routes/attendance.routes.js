import { Router } from "express";
import * as attendanceController from "../controller/attendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/today", protect, attendanceController.getTodayStatus);
router.post("/check-in", protect, attendanceController.checkIn);
router.post("/check-out", protect, attendanceController.checkOut);
router.get("/logs", protect, attendanceController.getAttendanceLogs);
router.get("/", protect, attendanceController.getAttendanceLogs); // Expose synonym route /attendance

export default router;
