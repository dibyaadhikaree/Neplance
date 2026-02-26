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
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  coverLetter: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 5000,
  },
  deliveryDays: {
    type: Number,
    required: true,
    min: 1,
  },
  revisionsIncluded: {
    type: Number,
    default: 0,
    min: 0,
  },
  attachments: {
    type: [String],
    validate: {
      validator: (values) =>
        (values || []).every((value) => /^https?:\/\//i.test(value)),
      message: "Attachments must be valid URLs",
    },
  },
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
