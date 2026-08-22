import * as leaveService from "../services/leave.service.js";

export const getLeaveBalances = async (req, res, next) => {
  try {
    const balances = await leaveService.getLeaveBalances(req.user._id);
    res.status(200).json({
      success: true,
      data: balances
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaveRequests = async (req, res, next) => {
  try {
    const requests = await leaveService.getLeaveRequests(req.user, req.query.status);
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

export const applyLeave = async (req, res, next) => {
  try {
    const newLeave = await leaveService.applyLeave(req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: "Leave applied successfully",
      data: newLeave
    });
  } catch (err) {
    next(err);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const data = await leaveService.approveLeave(req.params.id);
    res.status(200).json({
      success: true,
      message: "Leave request approved",
      data
    });
  } catch (err) {
    next(err);
  }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const data = await leaveService.rejectLeave(req.params.id);
    res.status(200).json({
      success: true,
      message: "Leave request rejected",
      data
    });
  } catch (err) {
    next(err);
  }
};
