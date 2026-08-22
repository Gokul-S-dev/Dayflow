import * as dashboardService from "../services/dashboard.service.js";

export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getEmployeeDashboardData(req.user);

    res.status(200).json({
      success: true,
      message: "Employee dashboard data retrieved successfully",
      data
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboardData(req.user);

    res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data
    });
  } catch (err) {
    next(err);
  }
};
