const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.Buffer,
    title: String,
    description: String,
    value: Number,
    dueDate: Number,
    status: {
      type: String,
      enum: ["ACTIVE", "SUBMITTED", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },
    createdAt: {
      type: Number,
      default: () => Date.now(),
    },
    completedAt: Number,
    evidence: String,
    approvedBy: [String],
  },
  { _id: false }
);

const partySchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["CONTRACTOR", "ARBITRATOR", "CREATOR"],
      required: true,
    },
    publicKey: mongoose.Schema.Types.Buffer,
    signature: mongoose.Schema.Types.Buffer,
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Number,
    default: () => Date.now(),
  },
  status: {
    type: String,
    enum: ["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"],
    default: "DRAFT",
  },
  milestones: [milestoneSchema],
  parties: [partySchema],
  terms: mongoose.Schema.Types.Buffer,
  creatorAddress: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  attachments: [mongoose.Schema.Types.Buffer],
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
