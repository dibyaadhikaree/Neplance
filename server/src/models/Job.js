const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  client: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "true",
  }, // user reference here , which is restricted to Clients only
  budget: Number, //Npr
  // hiredFreelancer: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "User",
  // },
  hiredFreelancer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["open", "in-progress", "completed-request", "completed", "closed"],
    default: "open",
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
