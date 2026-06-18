import mongoose from "mongoose";

const adminPasswordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AdminPasswordReset = mongoose.model(
  "AdminPasswordReset",
  adminPasswordResetSchema,
);
