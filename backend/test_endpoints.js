import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import app from "./app.js";
import { env } from "./src/config/env.js";
import { User } from "./src/models/user.model.js";
import { Company } from "./src/models/company.model.js";
import { Counter } from "./src/models/counter.model.js";

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
    console.log("Response Body:", JSON.stringify(signupData, null, 2));
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
    const preVerifyLoginData = await preVerifyLoginRes.json();
    console.log("Status:", preVerifyLoginRes.status);
    console.log("Response:", JSON.stringify(preVerifyLoginData, null, 2));
    if (preVerifyLoginRes.status !== 403 || !preVerifyLoginData.message.includes("verify your email")) {
      throw new Error("Login should have failed with 403 due to unverified email");
    }

    // --- TEST 3: Email Verification Via Token ---
    console.log("\n--- TEST 3: Email Verification Via Token ---");
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-email?token=${hrVerificationToken}`);
    const verifyData = await verifyRes.json();
    console.log("Status:", verifyRes.status);
    console.log("Response:", JSON.stringify(verifyData, null, 2));
    if (verifyRes.status !== 200 || !verifyData.data.emailVerified) {
      throw new Error("Email verification failed");
    }

    // --- TEST 4: Login Succeeds After Email Verification ---
    console.log("\n--- TEST 4: Login Succeeds After Email Verification ---");
    const hrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: hrEmployeeId, // test both employeeId login and email login
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
    console.log("Response:", JSON.stringify(empSignupData, null, 2));
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
    // ROLE-BASED ACCESS CONTROL (RBAC) & VALIDATION CHECKS
    // ========================================================

    // --- TEST 10: Employee Tries to List All Employees (Should Fail: 403) ---
    console.log("\n--- TEST 10: Employee Tries to List All Employees (Should Fail: 403) ---");
    const listEmpsRes = await fetch(`${BASE_URL}/employees`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log("Status:", listEmpsRes.status);
    if (listEmpsRes.status !== 403) {
      throw new Error("Listing employees with Employee token should return 403");
    }

    // --- TEST 11: Employee Retrieves Own Profile ---
    console.log("\n--- TEST 11: Employee Retrieves Own Profile ---");
    const profileRes = await fetch(`${BASE_URL}/employees/${empDbId}`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log("Status:", profileRes.status);
    if (profileRes.status !== 200) {
      throw new Error("Employee retrieving own profile failed");
    }

    // --- TEST 12: Employee Updates Allowed Fields (Phone and Address) ---
    console.log("\n--- TEST 12: Employee Updates Allowed Fields (Phone and Address) ---");
    const updateRes = await fetch(`${BASE_URL}/employees/${empDbId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${empToken}`
      },
      body: JSON.stringify({
        phone: "7777777777",
        address: "123 Main St, Bangalore"
      })
    });
    console.log("Status:", updateRes.status);
    if (updateRes.status !== 200) {
      throw new Error("Employee updating allowed fields failed");
    }

    // --- TEST 13: Password Security Rule Validation (Signup Weak Password) ---
    console.log("\n--- TEST 13: Password Security Rule Validation (Signup Weak Password) ---");
    const weakPwRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "DFADMI20260001",
        email: "badpw@example.com",
        password: "weak", // fails min length and character type rules
        role: "EMPLOYEE"
      })
    });
    const weakPwData = await weakPwRes.json();
    console.log("Status:", weakPwRes.status);
    console.log("Response:", JSON.stringify(weakPwData, null, 2));
    if (weakPwRes.status !== 400 || !weakPwData.message.includes("uppercase")) {
      throw new Error("Signup with weak password should return 400 with strength error message");
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
