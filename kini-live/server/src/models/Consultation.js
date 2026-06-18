import mongoose from "mongoose";

export const serviceNames = [
  "Accounting",
  "Income Tax Returns",
  "GST Returns",
  "TDS Filing",
  "Company Incorporation",
  "Labour Law Compliances",
  "Licensing",
  "Tax Consultancy",
  "General Enquiry",
];

const consultationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 160, index: true },
    phone: { type: String, required: true, trim: true, maxlength: 18 },
    service: { type: String, required: true, enum: serviceNames, index: true },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    source: { type: String, enum: ["website"], default: "website" },
    status: { type: String, enum: ["new", "contacted", "in_progress", "completed"], default: "new", index: true },
    adminNotes: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

consultationSchema.index({ createdAt: -1 });

export const Consultation = mongoose.model("Consultation", consultationSchema);
