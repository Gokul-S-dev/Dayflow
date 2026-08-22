import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    prefix: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    logo: {
      url: { type: String },
      path: { type: String },
      mimeType: { type: String },
      size: { type: Number }
    }
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model("Company", companySchema);
