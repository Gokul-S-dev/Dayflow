import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import app from "./app.js";
import { env } from "./src/config/env.js";
import { User } from "./src/models/user.model.js";
import { Company } from "./src/models/company.model.js";
import { Counter } from "./src/models/counter.model.js";
import { Attendance } from "./src/models/attendance.model.js";
import { Leave } from "./src/models/leave.model.js";

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
const STATIC_URL = `http://localhost:${PORT}`;

const runTests = async () => {
  let server;
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri);
    console.log("Database connected successfully.");

    // Clean up test data
    await User.deleteMany({ email: { $in: ["admin@dayflow.com", "john.doe@example.com", "hr@signup.com", "badpw@example.com"] } });
    await Company.deleteMany({ name: { $in: ["Dayflow Corp", "Odoo India", "Odoo India Signup Test", "Odoo India Logo Test PNG", "Odoo India Logo Test JPG", "Odoo India Logo Test WebP", "Odoo India Duplicate Test"] } });
    await Counter.deleteMany({ _id: { $regex: "employee_id_" } });
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    
    // Clean up local media test directories
    const mediaDir = path.join(process.cwd(), "media", "companies");
    if (fs.existsSync(mediaDir)) {
      const dirs = fs.readdirSync(mediaDir);
      for (const dir of dirs) {
        if (dir !== ".gitkeep") {
          const dirPath = path.join(mediaDir, dir);
          try {
            fs.rmSync(dirPath, { recursive: true, force: true });
          } catch (e) {}
        }
      }
    }
    console.log("Database and local media cleaned up for test.");

    // Start Express server
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });

    // ========================================================
    // PHASE 3: COMPANY SIGNUP & EMAIL VERIFICATION
    // ========================================================

    // --- TEST 1: Company Signup (Creates Company + HR User) ---
    console.log("\n--- TEST 1: Company Signup (Creates Company + HR User) ---");
    const signupForm = new FormData();
    signupForm.append("companyName", "Odoo India Signup Test");
    signupForm.append("firstName", "Hr");
    signupForm.append("lastName", "User");
    signupForm.append("email", "hr@signup.com");
    signupForm.append("phone", "9998887776");
    signupForm.append("password", "HRSecurePass123!");
    signupForm.append("confirmPassword", "HRSecurePass123!");
    signupForm.append("role", "HR");
    
    const logoBlob = new Blob(["fake company logo"], { type: "image/png" });
    signupForm.append("logo", logoBlob, "logo.png");

    const signupRes = await fetch(`${BASE_URL}/auth/signup-company`, {
      method: "POST",
      body: signupForm
    });
    const signupData = await signupRes.json();
    console.log("Status:", signupRes.status);
    if (signupRes.status !== 201 || !signupData.success) {
      throw new Error("Company + HR Signup failed");
    }
    const hrVerificationToken = signupData.data.verificationToken;
    const hrEmployeeId = signupData.data.user.employeeId;

    // --- TEST 2: Login Fails Before Email Verification ---
    console.log("\n--- TEST 2: Login Fails Before Email Verification ---");
    const preVerifyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: "hr@signup.com",
        password: "HRSecurePass123!"
      })
    });
    console.log("Status:", preVerifyLoginRes.status);
    if (preVerifyLoginRes.status !== 403) {
      throw new Error("Login should have failed with 403 due to unverified email");
    }

    // --- TEST 3: Email Verification Via Token ---
    console.log("\n--- TEST 3: Email Verification Via Token ---");
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-email?token=${hrVerificationToken}`);
    const verifyData = await verifyRes.json();
    console.log("Status:", verifyRes.status);
    if (verifyRes.status !== 200 || !verifyData.data.emailVerified) {
      throw new Error("Email verification failed");
    }

    // --- TEST 4: Login Succeeds After Email Verification ---
    console.log("\n--- TEST 4: Login Succeeds After Email Verification ---");
    const hrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: hrEmployeeId,
        password: "HRSecurePass123!"
      })
    });
    const hrLoginData = await hrLoginRes.json();
    console.log("Status:", hrLoginRes.status);
    if (hrLoginRes.status !== 200 || !hrLoginData.success) {
      throw new Error("HR login failed after email verification");
    }
    const hrToken = hrLoginData.data.accessToken;
    console.log("HR user login succeeded.");


    // ========================================================
    // EMPLOYEE PROVISIONING & SIGNUP FLOW
    // ========================================================

    // --- TEST 5: HR User Creates Employee Record ---
    console.log("\n--- TEST 5: HR User Creates Employee Record ---");
    const createEmpRes = await fetch(`${BASE_URL}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hrToken}`
      },
      body: JSON.stringify({
        companyName: "Odoo India Signup Test",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "9876543210",
        joiningDate: "2026-08-22",
        role: "EMPLOYEE"
      })
    });
    const createEmpData = await createEmpRes.json();
    console.log("Status:", createEmpRes.status);
    if (createEmpRes.status !== 201) {
      throw new Error("Employee provisioning failed");
    }
    const empEmployeeId = createEmpData.data.employee.employeeId;
    const empDbId = createEmpData.data.employee.id;
    console.log("Employee provisioned with ID:", empEmployeeId);

    // --- TEST 6: Employee Signs Up (Registers Account) ---
    console.log("\n--- TEST 6: Employee Signs Up (Registers Account) ---");
    const empSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: empEmployeeId,
        email: "john.doe@example.com",
        password: "EmpPassword123!",
        role: "EMPLOYEE"
      })
    });
    const empSignupData = await empSignupRes.json();
    console.log("Status:", empSignupRes.status);
    if (empSignupRes.status !== 200 || !empSignupData.success) {
      throw new Error("Employee account activation/registration failed");
    }
    const empVerificationToken = empSignupData.data.verificationToken;

    // --- TEST 7: Employee Login Fails Before Verification ---
    console.log("\n--- TEST 7: Employee Login Fails Before Verification ---");
    const empLoginFailRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: "john.doe@example.com",
        password: "EmpPassword123!"
      })
    });
    console.log("Status:", empLoginFailRes.status);
    if (empLoginFailRes.status !== 403) {
      throw new Error("Employee login should have returned 403 Forbidden");
    }

    // --- TEST 8: Verify Employee Email ---
    console.log("\n--- TEST 8: Verify Employee Email ---");
    const empVerifyRes = await fetch(`${BASE_URL}/auth/verify-email?token=${empVerificationToken}`);
    console.log("Status:", empVerifyRes.status);
    if (empVerifyRes.status !== 200) {
      throw new Error("Employee email verification failed");
    }

    // --- TEST 9: Employee Login Succeeds After Verification ---
    console.log("\n--- TEST 9: Employee Login Succeeds After Verification ---");
    const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: empEmployeeId,
        password: "EmpPassword123!"
      })
    });
    const empLoginData = await empLoginRes.json();
    console.log("Status:", empLoginRes.status);
    if (empLoginRes.status !== 200 || !empLoginData.success) {
      throw new Error("Employee login failed after email verification");
    }
    const empToken = empLoginData.data.accessToken;


    // ========================================================
    // PHASE 4: DASHBOARD ENDPOINTS & SECURITY CHECKS
    // ========================================================

    // --- TEST 10: Get Dashboard Without JWT (Should Fail: 401) ---
    console.log("\n--- TEST 10: Get Dashboard Without JWT (Should Fail: 401) ---");
    const dashNoTokenRes = await fetch(`${BASE_URL}/dashboard/employee`);
    console.log("Status:", dashNoTokenRes.status);
    if (dashNoTokenRes.status !== 401) {
      throw new Error("Employee dashboard without token should fail with 401");
    }

    // --- TEST 11: Employee Tries to Get Admin Dashboard (Should Fail: 403) ---
    console.log("\n--- TEST 11: Employee Tries to Get Admin Dashboard (Should Fail: 403) ---");
    const adminDashEmpTokenRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log("Status:", adminDashEmpTokenRes.status);
    if (adminDashEmpTokenRes.status !== 403) {
      throw new Error("Employee accessing admin dashboard should fail with 403");
    }

    // --- TEST 12: Employee Dashboard Empty State ---
    console.log("\n--- TEST 12: Employee Dashboard Empty State ---");
    const empDashEmptyRes = await fetch(`${BASE_URL}/dashboard/employee`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const empDashEmptyData = await empDashEmptyRes.json();
    console.log("Status:", empDashEmptyRes.status);
    console.log("Empty State Attendance:", JSON.stringify(empDashEmptyData.data.attendance));
    console.log("Empty State Leave:", JSON.stringify(empDashEmptyData.data.leave));
    if (empDashEmptyData.data.attendance.status !== "NOT_CHECKED_IN") {
      throw new Error("Should show NOT_CHECKED_IN for empty state");
    }

    // --- TEST 13: Seed Attendance and Leave Records Directly in DB ---
    console.log("\n--- TEST 13: Seed Attendance and Leave Records Directly in DB ---");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    // Create Today Attendance
    await Attendance.create({
      userId: empDbId,
      date: today,
      checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 12 * 60 * 1000), // 09:12:00
      status: "CHECKED_IN"
    });

    // Create Yesterday Attendance
    await Attendance.create({
      userId: empDbId,
      date: yesterday,
      checkInTime: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000), // 09:00:00
      checkOutTime: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000), // 18:00:00
      status: "CHECKED_OUT"
    });

    // Create Pending Leave for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await Leave.create({
      userId: empDbId,
      leaveType: "SICK",
      startDate: tomorrow,
      endDate: tomorrow,
      reason: "Flu symptoms",
      status: "PENDING"
    });

    // Create Approved Leave for last week
    await Leave.create({
      userId: empDbId,
      leaveType: "CASUAL",
      startDate: lastWeek,
      endDate: lastWeek,
      reason: "Family gathering",
      status: "APPROVED"
    });
    console.log("Successfully seeded 2 attendance records and 2 leave requests.");

    // --- TEST 14: Employee Dashboard Populated State ---
    console.log("\n--- TEST 14: Employee Dashboard Populated State ---");
    const empDashPopRes = await fetch(`${BASE_URL}/dashboard/employee`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const empDashPopData = await empDashPopRes.json();
    console.log("Status:", empDashPopRes.status);
    console.log("Attendance Status:", empDashPopData.data.attendance.status);
    console.log("Leave Summary Counts:", JSON.stringify(empDashPopData.data.leave));
    console.log("Recent Activity Items:", empDashPopData.data.recentActivity.length);
    if (empDashPopData.data.attendance.status !== "CHECKED_IN") {
      throw new Error("Attendance status should be CHECKED_IN");
    }
    if (empDashPopData.data.leave.pending !== 1 || empDashPopData.data.leave.approved !== 1) {
      throw new Error("Leave summary count mismatch");
    }
    if (empDashPopData.data.recentActivity.length !== 5) {
      throw new Error("Should show exactly 5 activities");
    }

    // --- TEST 15: Admin/HR Dashboard Aggregated Metrics ---
    console.log("\n--- TEST 15: Admin/HR Dashboard Aggregated Metrics ---");
    const adminDashRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    const adminDashData = await adminDashRes.json();
    console.log("Status:", adminDashRes.status);
    console.log("Summary Metrics:", JSON.stringify(adminDashData.data.summary, null, 2));
    console.log("Total Employees Listed:", adminDashData.data.employees.length);
    console.log("Pending Leaves Count:", adminDashData.data.pendingLeaves.length);
    console.log("Recent Check-ins Count:", adminDashData.data.recentAttendance.length);

    if (adminDashData.data.summary.totalEmployees !== 1) {
      throw new Error("Total employees count mismatch");
    }
    if (adminDashData.data.summary.presentToday !== 1) {
      throw new Error("Present today count mismatch");
    }
    if (adminDashData.data.summary.pendingLeaveRequests !== 1) {
      throw new Error("Pending leaves count mismatch");
    }

    // --- TEST 16: Admin/HR Switch Employee (Employee Details Endpoint) ---
    console.log("\n--- TEST 16: Admin/HR Switch Employee (Employee Details Endpoint) ---");
    const getEmpDetailsRes = await fetch(`${BASE_URL}/employees/${empDbId}`, {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    const getEmpDetailsData = await getEmpDetailsRes.json();
    console.log("Status:", getEmpDetailsRes.status);
    console.log("Fetched Employee Details:", JSON.stringify(getEmpDetailsData.data, null, 2));
    if (getEmpDetailsRes.status !== 200 || getEmpDetailsData.data.employeeId !== empEmployeeId) {
      throw new Error("HR switching/fetching employee details failed");
    }

    console.log("\n==============================");
    console.log("  ALL INTEGRATION TESTS PASSED  ");
    console.log("==============================");
  } catch (error) {
    console.error("\nTEST FAILED:", error);
    process.exit(1);
  } finally {
    if (server) {
      server.close(() => {
        console.log("Test server stopped.");
      });
    }
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

runTests();
