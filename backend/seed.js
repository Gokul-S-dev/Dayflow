import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./src/config/env.js";
import { Company } from "./src/models/company.model.js";
import { User } from "./src/models/user.model.js";
import { Attendance } from "./src/models/attendance.model.js";
import { Leave } from "./src/models/leave.model.js";
import { Counter } from "./src/models/counter.model.js";

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri);
    console.log("Connected. Clearing old seed data...");

    // Clear existing data
    await User.deleteMany({ email: { $in: ["hr@odoo.com", "employee@odoo.com"] } });
    await Company.deleteMany({ name: "Odoo India" });
    await Counter.deleteMany({ _id: { $regex: "employee_id_OI" } });

    console.log("Creating Company 'Odoo India'...");
    const company = await Company.create({
      name: "Odoo India",
      prefix: "OI",
      address: "Odoo India Headquarters, Gandhinagar, Gujarat",
      phone: "079-40008000"
    });

    console.log("Hashing password 'Password123!'...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Password123!", salt);

    console.log("Creating HR Manager user 'hr@odoo.com' (OIHR0001)...");
    const hrUser = await User.create({
      employeeId: "OIHR0001",
      companyId: company._id,
      firstName: "Marcus",
      lastName: "Chen",
      email: "hr@odoo.com",
      phone: "+91 98765 43210",
      passwordHash,
      role: "HR",
      joiningDate: new Date("2025-01-01"),
      isActive: true,
      isFirstLogin: false,
      emailVerified: true
    });

    console.log("Creating Employee user 'employee@odoo.com' (OIEM0002)...");
    const empUser = await User.create({
      employeeId: "OIEM0002",
      companyId: company._id,
      firstName: "Sarah",
      lastName: "Jenkins",
      email: "employee@odoo.com",
      phone: "+91 99887 76655",
      passwordHash,
      role: "EMPLOYEE",
      joiningDate: new Date("2025-06-01"),
      isActive: true,
      isFirstLogin: false,
      emailVerified: true
    });

    console.log("Seeding Attendance records for Sarah...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    dayBefore.setHours(0, 0, 0, 0);

    // Checked in today
    await Attendance.create({
      userId: empUser._id,
      date: today,
      checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 5 * 60 * 1000), // 09:05 AM
      status: "CHECKED_IN"
    });

    // Checked out yesterday
    await Attendance.create({
      userId: empUser._id,
      date: yesterday,
      checkInTime: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000 + 55 * 60 * 1000), // 08:55 AM
      checkOutTime: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000 + 5 * 60 * 1000), // 06:05 PM
      status: "CHECKED_OUT"
    });

    // Checked out day before yesterday
    await Attendance.create({
      userId: empUser._id,
      date: dayBefore,
      checkInTime: new Date(dayBefore.getTime() + 9 * 60 * 60 * 1000), // 09:00 AM
      checkOutTime: new Date(dayBefore.getTime() + 17 * 60 * 60 * 1000 + 30 * 60 * 1000), // 05:30 PM
      status: "CHECKED_OUT"
    });

    console.log("Seeding Leave Requests for Sarah...");
    // Approved leave request (last week)
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 6);

    await Leave.create({
      userId: empUser._id,
      leaveType: "ANNUAL",
      startDate: lastWeekStart,
      endDate: lastWeekEnd,
      reason: "Personal family event",
      status: "APPROVED"
    });

    // Pending leave request (next week)
    const nextWeekStart = new Date();
    nextWeekStart.setDate(nextWeekStart.getDate() + 5);
    const nextWeekEnd = new Date();
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    await Leave.create({
      userId: empUser._id,
      leaveType: "SICK",
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      reason: "Medical surgery recover",
      status: "PENDING"
    });

    console.log("\n=================================");
    console.log("  DATABASE SEEDED SUCCESSFULLY!  ");
    console.log("=================================");
    console.log("HR Account:");
    console.log("  Login (Email or ID): hr@odoo.com or OIHR0001");
    console.log("  Password: Password123!");
    console.log("\nEmployee Account:");
    console.log("  Login (Email or ID): employee@odoo.com or OIEM0002");
    console.log("  Password: Password123!");
    console.log("=================================\n");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

seed();
