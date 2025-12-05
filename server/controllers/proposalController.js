const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getMyProposals = catchAsync(async (req, res) => {
  const data = await Proposal.find({ freelancer: req.user.id }).populate({
    path: "job",
    populate: { path: "client", select: "name email" },
  });

  if (!data) throw new AppError(400, "No Proposals found ");

  res.status(200).json({
    status: "success",
    data,
  });
});

const createProposal = catchAsync(async (req, res) => {
  const { job, status, amount } = req.body;

  const data = await Proposal.create({
    freelancer: req.user.id,
    job,
    status,
    amount,
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

const getProposalForJob = catchAsync(async (req, res) => {
  //make sure the respective client is seraching for the job

  const jobId = req.params.jobId;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);

  if (job.client.toString() !== req.user.id.toString())
    throw new AppError(
      "You are not authorized to do this. Only creator of Job can get a proposal "
    );

  const data = await Proposal.find({ job: jobId }).populate("freelancer");
});

// PATCH /api/proposals/:id/accept
const acceptProposal = catchAsync(async (req, res, next) => {
  const proposalId = req.params.id;

  // 1) Find proposal
  const proposal = await Proposal.findById(proposalId).populate("job");
  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  const job = proposal.job;
  if (!job) throw new AppError("Job not found", 404);

  const jobId = job._id;

  // Only allow job owner (client) to accept proposals
  if (job.client.toString() !== req.user.id.toString()) {
    throw new AppError("You can't accept proposals for this job", 403);
  }

  if (job.status !== "open") {
    throw new AppError("Job is not open for hiring", 400);
  }

  // 2) Accept this proposal
  proposal.status = "accepted";
  await proposal.save();

  // 3) Reject all other pending proposals for this job
  await Proposal.updateMany(
    { job: jobId, _id: { $ne: proposal._id }, status: "pending" },
    { $set: { status: "rejected" } }
  );

  // 4) Update job status + hired freelancer
  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    {
      status: "in-progress",
      hiredFreelancer: proposal.freelancer,
    },
    { new: true }
  );

  // 5) Response
  res.status(200).json({
    status: "success",
    message: "Proposal accepted and job moved to in-progress",
    acceptedProposal: proposal,
    job: updatedJob,
  });
});

module.exports = {
  createProposal,
  getProposalForJob,
  acceptProposal,
  getMyProposals,
};
