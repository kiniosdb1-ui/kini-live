import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    csrfHash: { type: String, required: true },
    userAgentHash: { type: String, required: true },
    lastSeenAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AdminSession = mongoose.model("AdminSession", adminSessionSchema);
