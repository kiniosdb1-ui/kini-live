import mongoose from "mongoose";

const adminCredentialSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "primary" },
    passwordHash: { type: String, required: true },
    passwordChangedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AdminCredential = mongoose.model("AdminCredential", adminCredentialSchema);
