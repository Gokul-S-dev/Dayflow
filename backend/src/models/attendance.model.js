import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true // Store as YYYY-MM-DD date representation
    },
    status: {
      type: String,
      enum: ["CHECKED_IN", "CHECKED_OUT", "NOT_CHECKED_IN"],
      default: "NOT_CHECKED_IN"
    },
    checkInTime: {
      type: Date
    },
    checkOutTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for fast lookups per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
