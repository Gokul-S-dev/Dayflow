import * as employeeService from "../services/employee.service.js";
import { AppError } from "../middleware/error.middleware.js";

// Helper to safely get the company ID string from req.user
const getCompanyIdString = (user) => {
  if (!user || !user.companyId) return null;
  return user.companyId._id ? user.companyId._id.toString() : user.companyId.toString();
};

export const createEmployee = async (req, res, next) => {
  try {
    const result = await employeeService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        employee: result.employee,
        temporaryPassword: result.temporaryPassword // returned exactly once upon creation
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const companyId = getCompanyIdString(req.user);
    const employees = await employeeService.getEmployees(companyId, req.query);

    res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: employees
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const { role, _id } = req.user;
    const companyIdStr = getCompanyIdString(req.user);

    // Enforce profile access restriction: Employees can only access their own profile
    if (role === "EMPLOYEE" && targetId !== _id.toString()) {
      return next(new AppError("You are not authorized to view this employee profile", 403));
    }

    const employee = await employeeService.getEmployeeById(targetId);

    // Enforce company boundary for Admin/HR
    if ((role === "ADMIN" || role === "HR") && employee.companyId && employee.companyId.toString() !== companyIdStr) {
      return next(new AppError("You are not authorized to view this employee profile", 403));
    }

    res.status(200).json({
      success: true,
      message: "Employee profile retrieved successfully",
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    // The fields allowed for update are filtered and validated by the validateUpdateEmployee middleware
    const updatedEmployee = await employeeService.updateEmployee(targetId, req.body);

    res.status(200).json({
      success: true,
      message: "Employee profile updated successfully",
      data: updatedEmployee
    });
  } catch (err) {
    next(err);
  }
};
