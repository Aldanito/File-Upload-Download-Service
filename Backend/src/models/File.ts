import mongoose from "mongoose";

const partSchema = new mongoose.Schema(
  {
    partNumber: Number,
    etag: String,
    size: Number,
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    fileRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "FileRequest", default: null },
    key: { type: String, required: true },
    size: { type: Number, default: 0 },
    contentType: { type: String, default: "application/octet-stream" },
    originalName: { type: String, required: true },
    uploadId: { type: String, default: null },
    parts: [partSchema],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

fileSchema.index({ fileRequestId: 1 });
fileSchema.index({ key: 1 });
fileSchema.index({ uploadId: 1 });

export const FileModel = mongoose.model("File", fileSchema);
