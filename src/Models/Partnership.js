// models/Partnership.js
import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema(
  {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "blocked"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one partnership record per dealer-company pair
partnershipSchema.index({ dealer: 1, company: 1 }, { unique: true });

const Partnership =
  mongoose.models.Partnership || mongoose.model("Partnership", partnershipSchema);

export default Partnership;