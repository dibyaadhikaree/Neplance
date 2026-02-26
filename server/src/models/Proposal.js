const mongoose = require("mongoose");
const { PROPOSAL_STATUS } = require("../constants/statuses");

const proposalSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "true",
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: "Job",
  },
  status: {
    type: String,
    enum: Object.values(PROPOSAL_STATUS),
    default: PROPOSAL_STATUS.PENDING,
  },
  amount: Number,
  coverLetter: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  deliveryDays: {
    type: Number,
    required: true,
  },
  revisionsIncluded: {
    type: Number,
    default: 0,
  },
  attachments: [String],
  isRead: {
    type: Boolean,
    default: false,
  },
  withdrawnAt: Date,
  rejectedAt: Date,
  rejectionReason: {
    type: String,
    maxlength: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;
