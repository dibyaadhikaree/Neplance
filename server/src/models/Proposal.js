const mongoose = require("mongoose");

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
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  amount: Number, //npr
});

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;
