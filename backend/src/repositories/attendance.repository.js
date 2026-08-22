import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";

export const findTodayAttendanceForUser = async (userId, todayDate) => {
  return Attendance.findOne({ userId, date: todayDate });
};

export const findRecentAttendanceForUser = async (userId, limit = 5) => {
  return Attendance.find({ userId }).sort({ checkInTime: -1 }).limit(limit);
};

export const findTodayAttendanceForCompany = async (companyId, todayDate) => {
  const companyUsers = await User.find({ companyId }).select("_id");
  const userIds = companyUsers.map((u) => u._id);

  return Attendance.find({
    userId: { $in: userIds },
    date: todayDate
  }).populate("userId", "firstName lastName email employeeId role");
};

export const create = async (attendanceData) => {
  return Attendance.create(attendanceData);
};

export const update = async (id, updateData) => {
  return Attendance.findByIdAndUpdate(id, updateData, { new: true });
};
