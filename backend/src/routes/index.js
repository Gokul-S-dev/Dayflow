import { Router } from "express";
import authRoutes from "./auth.routes.js";
import employeeRoutes from "./employee.routes.js";
import companyRoutes from "./company.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/companies", companyRoutes);

export default router;
