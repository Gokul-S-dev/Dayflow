import { Leave } from "../models/leave.model.js";
import { User } from "../models/user.model.js";

export const findLeaveSummaryForUser = async (userId) => {
  const [pending, approved, rejected] = await Promise.all([
    Leave.countDocuments({ userId, status: "PENDING" }),
    Leave.countDocuments({ userId, status: "APPROVED" }),
    Leave.countDocuments({ userId, status: "REJECTED" })
  ]);
  return { pending, approved, rejected };
};

export const findRecentLeavesForUser = async (userId, limit = 5) => {
  return Leave.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

export const findPendingLeavesForCompany = async (companyId) => {
  const companyUsers = await User.find({ companyId }).select("_id");
  const userIds = companyUsers.map((u) => u._id);

  return Leave.find({
    userId: { $in: userIds },
    status: "PENDING"
  }).populate("userId", "firstName lastName email employeeId role");
};

export const findOnLeaveCountTodayForCompany = async (companyId, todayDate) => {
  const companyUsers = await User.find({ companyId }).select("_id");
  const userIds = companyUsers.map((u) => u._id);

  return Leave.countDocuments({
    userId: { $in: userIds },
    status: "APPROVED",
    startDate: { $lte: todayDate },
    endDate: { $gte: todayDate }
  });
};

export const create = async (leaveData) => {
  return Leave.create(leaveData);
};

export const update = async (id, updateData) => {
  return Leave.findByIdAndUpdate(id, updateData, { new: true });
};
