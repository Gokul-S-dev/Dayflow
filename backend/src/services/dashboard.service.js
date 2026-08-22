import * as attendanceRepository from "../repositories/attendance.repository.js";
import * as leaveRepository from "../repositories/leave.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { User } from "../models/user.model.js";
import { AppError } from "../middleware/error.middleware.js";

// Helper to safely get the company ID string from req.user
const getCompanyIdString = (user) => {
  if (!user || !user.companyId) return null;
  return user.companyId._id ? user.companyId._id.toString() : user.companyId.toString();
};

// Helper to get local midnight date (for matching date field in DB)
const getTodayMidnightDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Compiles personal dashboard statistics for the logged-in employee/user.
 */
export const getEmployeeDashboardData = async (user) => {
  if (!user) {
    throw new AppError("User profile not found", 404);
  }

  const userId = user._id;
  const todayDate = getTodayMidnightDate();

  // 1. Get today's attendance status
  const todayAttendance = await attendanceRepository.findTodayAttendanceForUser(userId, todayDate);
  let attendanceStatus = "NOT_CHECKED_IN";
  let checkInTime = null;
  let checkOutTime = null;

  if (todayAttendance) {
    attendanceStatus = todayAttendance.status;
    checkInTime = todayAttendance.checkInTime;
    checkOutTime = todayAttendance.checkOutTime;
  }

  // 2. Get leave summaries
  const leaveSummary = await leaveRepository.findLeaveSummaryForUser(userId);

  // 3. Compile recent activities (combine recent attendance checks and leaves)
  const [recentAttendance, recentLeaves] = await Promise.all([
    attendanceRepository.findRecentAttendanceForUser(userId, 5),
    leaveRepository.findRecentLeavesForUser(userId, 5)
  ]);

  const activities = [];

  recentAttendance.forEach((att) => {
    if (att.checkInTime) {
      activities.push({
        type: "ATTENDANCE",
        message: "Checked in",
        date: att.checkInTime
      });
    }
    if (att.checkOutTime) {
      activities.push({
        type: "ATTENDANCE",
        message: "Checked out",
        date: att.checkOutTime
      });
    }
  });

  recentLeaves.forEach((lv) => {
    let msg = `Leave request (${lv.leaveType}) submitted`;
    if (lv.status === "APPROVED") {
      msg = `Leave request (${lv.leaveType}) approved`;
    } else if (lv.status === "REJECTED") {
      msg = `Leave request (${lv.leaveType}) rejected`;
    }
    activities.push({
      type: "LEAVE",
      message: msg,
      date: lv.createdAt
    });
  });

  // Sort combined activities by date descending and take top 5
  const recentActivity = activities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    profile: {
      id: user.employeeId,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      avatar: user.profilePicture || null,
      company: user.companyId ? user.companyId.name : null,
      joiningDate: user.joiningDate
    },
    attendance: {
      status: attendanceStatus,
      checkInTime,
      checkOutTime
    },
    leave: leaveSummary,
    recentActivity,
    alerts: []
  };
};

/**
 * Aggregates organization dashboard data for ADMIN / HR.
 */
export const getAdminDashboardData = async (adminUser) => {
  const companyId = getCompanyIdString(adminUser);
  if (!companyId) {
    throw new AppError("User is not associated with any company", 400);
  }

  const todayDate = getTodayMidnightDate();

  // 1. Fetch counts & lists in parallel
  const [
    totalEmployees,
    todayAttendanceList,
    onLeaveCount,
    pendingLeaves
  ] = await Promise.all([
    User.countDocuments({ companyId, role: "EMPLOYEE", isActive: true }),
    attendanceRepository.findTodayAttendanceForCompany(companyId, todayDate),
    leaveRepository.findOnLeaveCountTodayForCompany(companyId, todayDate),
    leaveRepository.findPendingLeavesForCompany(companyId)
  ]);

  const presentToday = todayAttendanceList.length;
  const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveCount);

  // 2. Fetch all active employees in this company to attach their attendance status
  const employeesList = await User.find({ companyId, role: "EMPLOYEE", isActive: true })
    .select("firstName lastName email employeeId role profilePicture address");

  const attendanceMap = new Map();
  todayAttendanceList.forEach((att) => {
    if (att.userId) {
      attendanceMap.set(att.userId._id.toString(), att.status);
    }
  });

  const employees = employeesList.map((emp) => {
    const status = attendanceMap.get(emp._id.toString()) || "NOT_CHECKED_IN";
    return {
      id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      avatar: emp.profilePicture || null,
      attendanceStatus: status
    };
  });

  const pendingLeavesFormatted = pendingLeaves.map((lv) => ({
    id: lv._id,
    employee: {
      id: lv.userId ? lv.userId._id : null,
      name: lv.userId ? `${lv.userId.firstName} ${lv.userId.lastName}` : "Unknown"
    },
    leaveType: lv.leaveType,
    startDate: lv.startDate,
    endDate: lv.endDate,
    status: lv.status
  }));

  const recentAttendance = todayAttendanceList.map((att) => ({
    id: att._id,
    employee: {
      id: att.userId ? att.userId._id : null,
      name: att.userId ? `${att.userId.firstName} ${att.userId.lastName}` : "Unknown"
    },
    checkInTime: att.checkInTime,
    checkOutTime: att.checkOutTime,
    status: att.status
  }));

  return {
    summary: {
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday: onLeaveCount,
      pendingLeaveRequests: pendingLeavesFormatted.length
    },
    employees,
    pendingLeaves: pendingLeavesFormatted,
    recentAttendance
  };
};
