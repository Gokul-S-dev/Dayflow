import * as attendanceService from "../services/attendance.service.js";

export const getTodayStatus = async (req, res, next) => {
  try {
    const data = await attendanceService.getTodayStatus(req.user._id);
    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const data = await attendanceService.checkIn(req.user._id);
    res.status(200).json({
      success: true,
      message: "Checked in successfully",
      data
    });
  } catch (err) {
    next(err);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const data = await attendanceService.checkOut(req.user._id);
    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceLogs = async (req, res, next) => {
  try {
    const logs = await attendanceService.getAttendanceLogs(req.user, req.query);
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};
