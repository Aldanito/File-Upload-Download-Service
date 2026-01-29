import mongoose from "mongoose";

const fileRequestSchema = new mongoose.Schema(
  {
    passwordHash: { type: String, required: true },
    downloadPasswordHash: { type: String, required: false },
    name: { type: String, default: "" },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const FileRequestModel = mongoose.model("FileRequest", fileRequestSchema);
