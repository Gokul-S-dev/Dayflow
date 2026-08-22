import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    leaveType: {
      type: String,
      enum: ["CASUAL", "SICK", "MATERNITY", "ANNUAL", "OTHER"],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

export const Leave = mongoose.model("Leave", leaveSchema);
