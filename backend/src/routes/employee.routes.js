import { Router } from "express";
import * as employeeController from "../controller/employee.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateCreateEmployee, validateUpdateEmployee } from "../validators/employee.validator.js";

const router = Router();

// All employee endpoints require authentication
router.use(protect);

router.post("/", restrictTo("ADMIN", "HR"), validateCreateEmployee, employeeController.createEmployee);
router.get("/", restrictTo("ADMIN", "HR"), employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.patch("/:id", validateUpdateEmployee, employeeController.updateEmployee);

export default router;
