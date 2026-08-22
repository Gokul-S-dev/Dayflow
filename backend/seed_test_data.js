import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/user.model.js";
import { Company } from "./src/models/company.model.js";
import { Attendance } from "./src/models/attendance.model.js";
import { Leave } from "./src/models/leave.model.js";
import { Counter } from "./src/models/counter.model.js";
import { env } from "./src/config/env.js";

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri);
    console.log("Connected.");

    // Clean old seed users, company, logs
    await User.deleteMany({ email: { $in: ["hr@odoo.com", "employee@odoo.com", "eleanor@odoo.com", "marcus@odoo.com", "amina@odoo.com", "alexandra@odoo.com"] } });
    await Company.deleteMany({ name: "Odoo India" });
    await Counter.deleteMany({ _id: { $regex: "employee_id_" } });
    await Attendance.deleteMany({});
    await Leave.deleteMany({});

    // Create Company
    const company = await Company.create({
      name: "Odoo India",
      domain: "odoo.com",
      prefix: "ODO"
    });
    console.log("Company seeded:", company._id);

    const passwordHash = await bcrypt.hash("Password123!", 10);

    // Create HR User
    const hr = await User.create({
      employeeId: "HR-1001",
      companyId: company._id,
      firstName: "Hr",
      lastName: "Manager",
      email: "hr@odoo.com",
      phone: "9876543210",
      passwordHash,
      role: "HR",
      joiningDate: new Date(),
      isActive: true,
      isFirstLogin: false,
      loginId: "HR-1001",
      emailVerified: true,
      accountStatus: "APPROVED",
      department: "Human Resources",
      designation: "HR Lead"
    });
    console.log("HR seeded:", hr.email);

    // Create Employees
    const emp1 = await User.create({
      employeeId: "EMP-1001",
      companyId: company._id,
      firstName: "Employee",
      lastName: "User",
      email: "employee@odoo.com",
      phone: "9876543211",
      passwordHash,
      role: "EMPLOYEE",
      joiningDate: new Date(),
      isActive: true,
      isFirstLogin: false,
      loginId: "EMP-1001",
      emailVerified: true,
      accountStatus: "APPROVED",
      department: "Engineering",
      designation: "Frontend Engineer"
    });

    const emp2 = await User.create({
      employeeId: "EMP-1002",
      companyId: company._id,
      firstName: "Eleanor",
      lastName: "Morgan",
      email: "eleanor@odoo.com",
      phone: "9876543212",
      passwordHash,
      role: "EMPLOYEE",
      joiningDate: new Date(),
      isActive: true,
      isFirstLogin: false,
      loginId: "EMP-1002",
      emailVerified: true,
      accountStatus: "APPROVED",
      department: "Engineering",
      designation: "Senior Frontend Architect"
    });

    const emp3 = await User.create({
      employeeId: "EMP-1003",
      companyId: company._id,
      firstName: "Marcus",
      lastName: "Chen",
      email: "marcus@odoo.com",
      phone: "9876543213",
      passwordHash,
      role: "EMPLOYEE",
      joiningDate: new Date(),
      isActive: true,
      isFirstLogin: false,
      loginId: "EMP-1003",
      emailVerified: true,
      accountStatus: "APPROVED",
      department: "Operations",
      designation: "Devops Engineer"
    });

    const emp4 = await User.create({
      employeeId: "EMP-1004",
      companyId: company._id,
      firstName: "Amina",
      lastName: "Larsson",
      email: "amina@odoo.com",
      phone: "9876543214",
      passwordHash,
      role: "EMPLOYEE",
      joiningDate: new Date(),
      isActive: true,
      isFirstLogin: false,
      loginId: "EMP-1004",
      emailVerified: true,
      accountStatus: "APPROVED",
      department: "Finance",
      designation: "Financial Analyst"
    });

    const emp5 = await User.create({
      employeeId: "EMP-1005",
      companyId: company._id,
      firstName: "Alexandra",
      lastName: "Vance",
      email: "alexandra@odoo.com",
      phone: "9876543215",
      passwordHash,
      role: "HR",
      joiningDate: new Date(),
      isActive: true,
      isFirstLogin: false,
      loginId: "EMP-1005",
      emailVerified: true,
      accountStatus: "APPROVED",
      department: "Human Resources",
      designation: "Talent Acquisition Lead"
    });

    console.log("Employees seeded successfully.");

    // Seed Attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // emp1 checked-in today (GREEN)
    await Attendance.create({
      userId: emp1._id,
      date: today,
      checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 12 * 60 * 1000), // 09:12 AM
      status: "CHECKED_IN"
    });

    // emp2 checked-out today (GREEN)
    await Attendance.create({
      userId: emp2._id,
      date: today,
      checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 09:00 AM
      checkOutTime: new Date(today.getTime() + 18 * 60 * 60 * 1000), // 06:00 PM
      status: "CHECKED_OUT"
    });

    // Seed Leave request for emp3 today (approved -> BLUE)
    await Leave.create({
      userId: emp3._id,
      leaveType: "CASUAL",
      startDate: today,
      endDate: today,
      reason: "Family event",
      status: "APPROVED",
      duration: 1
    });

    // Seed some general historical check-ins
    await Attendance.create({
      userId: emp1._id,
      date: yesterday,
      checkInTime: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000 + 5 * 60 * 1000), // 09:05 AM
      checkOutTime: new Date(yesterday.getTime() + 17 * 65 * 60 * 1000), // 05:05 PM
      status: "CHECKED_OUT"
    });

    await Attendance.create({
      userId: emp2._id,
      date: yesterday,
      checkInTime: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000 + 55 * 60 * 1000), // 08:55 AM
      checkOutTime: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000), // 06:00 PM
      status: "CHECKED_OUT"
    });

    // Seed pending leave requests for HR review
    await Leave.create({
      userId: emp4._id,
      leaveType: "SICK",
      startDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      reason: "Feeling unwell",
      status: "PENDING",
      duration: 1
    });

    console.log("Attendance and Leave records seeded successfully.");

  } catch (err) {
    console.error("Error seeding:", err);
  } finally {
    mongoose.connection.close();
    console.log("Disconnected.");
  }
};

seed();
