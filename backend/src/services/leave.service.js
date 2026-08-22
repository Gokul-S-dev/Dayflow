import * as leaveRepository from "../repositories/leave.repository.js";
import { User } from "../models/user.model.js";
import { Leave } from "../models/leave.model.js";
import { AppError } from "../middleware/error.middleware.js";

export const getLeaveBalances = async (userId) => {
  const approvedLeaves = await Leave.find({ userId, status: "APPROVED" });

  let sickUsed = 0;
  let casualUsed = 0;
  let annualUsed = 0;

  approvedLeaves.forEach((lv) => {
    const diffTime = Math.abs(new Date(lv.endDate) - new Date(lv.startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (lv.leaveType === "SICK") {
      sickUsed += diffDays;
    } else if (lv.leaveType === "CASUAL") {
      casualUsed += diffDays;
    } else {
      annualUsed += diffDays;
    }
  });

  return {
    paid: { total: 20, used: annualUsed, available: Math.max(0, 20 - annualUsed) },
    sick: { total: 10, used: sickUsed, available: Math.max(0, 10 - sickUsed) },
    unpaid: { total: 15, used: casualUsed, available: Math.max(0, 15 - casualUsed) }
  };
};

export const getLeaveRequests = async (user, statusFilter = "ALL") => {
  const query = {};

  if (user.role === "EMPLOYEE") {
    query.userId = user._id;
  } else {
    const companyId = user.companyId._id || user.companyId;
    const companyUsers = await User.find({ companyId }).select("_id");
    query.userId = { $in: companyUsers.map((u) => u._id) };
  }

  if (statusFilter && statusFilter !== "ALL") {
    query.status = statusFilter.toUpperCase();
  }

  const leaves = await Leave.find(query)
    .populate("userId", "firstName lastName employeeId")
    .sort({ createdAt: -1 });

  return leaves.map((lv) => {
    const diffTime = Math.abs(new Date(lv.endDate) - new Date(lv.startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      id: lv._id,
      employeeId: lv.userId ? lv.userId.employeeId : "—",
      employeeName: lv.userId ? `${lv.userId.firstName} ${lv.userId.lastName}` : "Unknown",
      type: lv.leaveType === "SICK" ? "Sick Leave" : lv.leaveType === "CASUAL" ? "Unpaid Leave" : "Paid Leave",
      startDate: lv.startDate.toISOString().split("T")[0],
      endDate: lv.endDate.toISOString().split("T")[0],
      days: diffDays,
      reason: lv.reason,
      status: lv.status,
      appliedDate: lv.createdAt.toISOString().split("T")[0]
    };
  });
};

export const applyLeave = async (userId, leaveData) => {
  const { type, startDate, endDate, reason } = leaveData;

  let mappedType = "ANNUAL";
  if (type === "Sick Leave" || type === "SICK") {
    mappedType = "SICK";
  } else if (type === "Unpaid Leave" || type === "CASUAL") {
    mappedType = "CASUAL";
  }

  const newLeave = await Leave.create({
    userId,
    leaveType: mappedType,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    status: "PENDING"
  });

  return newLeave;
};

export const approveLeave = async (id) => {
  const lv = await Leave.findById(id);
  if (!lv) {
    throw new AppError("Leave request not found", 404);
  }

  lv.status = "APPROVED";
  await lv.save();

  return { success: true, message: "Leave request approved successfully" };
};

export const rejectLeave = async (id) => {
  const lv = await Leave.findById(id);
  if (!lv) {
    throw new AppError("Leave request not found", 404);
  }

  lv.status = "REJECTED";
  await lv.save();

  return { success: true, message: "Leave request rejected successfully" };
};
