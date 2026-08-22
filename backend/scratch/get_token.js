import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { env } from "../src/config/env.js";

const run = async () => {
  await mongoose.connect(env.mongoUri);
  const user = await User.findOne({ email: "hr.browser@signup.com" });
  if (user) {
    console.log("TOKEN:" + user.verificationToken);
    console.log("EMPLOYEE_ID:" + user.employeeId);
  } else {
    console.log("User not found");
  }
  await mongoose.connection.close();
};

run();
