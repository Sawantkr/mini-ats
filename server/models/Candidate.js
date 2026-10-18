
const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    stage: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Selected", "Rejected"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

candidateSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Candidate", candidateSchema);
