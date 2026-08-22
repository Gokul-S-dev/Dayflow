import * as attendanceRepository from "../repositories/attendance.repository.js";
import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { AppError } from "../middleware/error.middleware.js";

const getTodayMidnightDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getTodayStatus = async (userId) => {
  const todayDate = getTodayMidnightDate();
  const record = await attendanceRepository.findTodayAttendanceForUser(userId, todayDate);
  if (!record) {
    return {
      isCheckedIn: false,
      checkInTime: null,
      checkOutTime: null,
      status: "NOT_CHECKED_IN"
    };
  }
  return {
    isCheckedIn: record.status === "CHECKED_IN",
    checkInTime: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
    checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
    status: record.status
  };
};

export const checkIn = async (userId) => {
  const todayDate = getTodayMidnightDate();
  const record = await attendanceRepository.findTodayAttendanceForUser(userId, todayDate);
  if (record) {
    throw new AppError("You have already checked in for today.", 400);
  }

  const newRecord = await attendanceRepository.create({
    userId,
    date: todayDate,
    checkInTime: new Date(),
    status: "CHECKED_IN"
  });

  return {
    isCheckedIn: true,
    checkInTime: new Date(newRecord.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    checkOutTime: null,
    status: "CHECKED_IN"
  };
};

export const checkOut = async (userId) => {
  const todayDate = getTodayMidnightDate();
  const record = await attendanceRepository.findTodayAttendanceForUser(userId, todayDate);
  if (!record || record.status !== "CHECKED_IN") {
    throw new AppError("You have not checked in for today.", 400);
  }

  const updatedRecord = await attendanceRepository.update(record._id, {
    checkOutTime: new Date(),
    status: "CHECKED_OUT"
  });

  return {
    isCheckedIn: false,
    checkInTime: new Date(updatedRecord.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    checkOutTime: new Date(updatedRecord.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "CHECKED_OUT"
  };
};

export const getAttendanceLogs = async (user, filters = {}) => {
  const query = {};
  
  if (user.role === "EMPLOYEE") {
    query.userId = user._id;
  } else {
    // Admin/HR can see company wide logs
    const companyId = user.companyId._id || user.companyId;
    const companyUsers = await User.find({ companyId }).select("_id");
    query.userId = { $in: companyUsers.map((u) => u._id) };
  }

  if (filters.employeeId) {
    const targetUser = await User.findOne({ employeeId: filters.employeeId });
    if (targetUser) {
      query.userId = targetUser._id;
    }
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const records = await Attendance.find(query)
    .populate("userId", "firstName lastName employeeId")
    .sort({ checkInTime: -1 });

  return records.map((r) => ({
    id: r._id,
    date: r.date.toISOString().split("T")[0],
    employeeName: r.userId ? `${r.userId.firstName} ${r.userId.lastName}` : "Unknown",
    employeeId: r.userId ? r.userId.employeeId : "—",
    checkIn: r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    checkOut: r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    status: r.status
  }));
};
