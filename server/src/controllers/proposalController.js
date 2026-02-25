const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { getJobOrThrow, ensureCreator, ensureStatus } = require("../utils/jobAccess");

const getMyProposals = catchAsync(async (req, res) => {
  const data = await Proposal.find({ freelancer: req.user.id }).populate({
    path: "job",
    populate: { path: "creatorAddress", select: "name email" },
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

const createProposal = catchAsync(async (req, res) => {
  const { job, status, amount, coverLetter, deliveryDays, revisionsIncluded, attachments } = req.body;

  const data = await Proposal.create({
    freelancer: req.user.id,
    job,
    status,
    amount,
    coverLetter,
    deliveryDays,
    revisionsIncluded,
    attachments,
  });

  res.status(201).json({
    status: "success",
    data,
  });
});

const getProposalForJob = catchAsync(async (req, res) => {
  //make sure the respective client is seraching for the job

  const jobId = req.params.jobId;

  const job = await getJobOrThrow(jobId, "Job not found");
  ensureCreator(
    job,
    req.user.id,
    "You are not authorized to do this. Only creator of Job can get a proposal"
  );

  const data = await Proposal.find({ job: jobId }).populate("freelancer");

  res.status(200).json({
    status: "success",
    data,
  });
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

  // Only allow job owner (creator) to accept proposals
  ensureCreator(job, req.user.id, "You can't accept proposals for this job");
  ensureStatus(job, "OPEN", "Contract is not open for hiring. Please publish your job first.");

  // 2) Accept this proposal
  proposal.status = "accepted";
  await proposal.save();

  // 3) Reject all other pending proposals for this job
  await Proposal.updateMany(
    { job: jobId, _id: { $ne: proposal._id }, status: "pending" },
    { $set: { status: "rejected" } }
  );

  // 4) Update job status + add contractor party
  const contractorAddress = proposal.freelancer.toString();
  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    {
      status: "IN_PROGRESS",
      updatedAt: Date.now(),
      $addToSet: {
        parties: {
          address: contractorAddress,
          role: "CONTRACTOR",
        },
      },
    },
    { new: true }
  );

  // 5) Response
  res.status(200).json({
    status: "success",
    message: "Proposal accepted and contract activated",
    acceptedProposal: proposal,
    job: updatedJob,
  });
});

const getProposalById = catchAsync(async (req, res, next) => {
  const proposalId = req.params.id;
  const userId = String(req.user.id);

  const proposal = await Proposal.findById(proposalId);

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  const isFreelancer = String(proposal.freelancer) === userId;

  if (isFreelancer) {
    const populatedProposal = await Proposal.findById(proposalId).populate("freelancer", "name email");
    return res.status(200).json({ status: "success", data: populatedProposal });
  }

  const job = await Job.findById(proposal.job);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  const isJobOwner = String(job.creatorAddress) === userId ||
    job.parties?.some(p => p.role === "CREATOR" && p.address === userId);

  if (!isJobOwner) {
    return next(new AppError("You are not authorized to view this proposal", 403));
  }

  const populatedProposal = await Proposal.findById(proposalId).populate("freelancer", "name email");
  res.status(200).json({ status: "success", data: populatedProposal });
});

const withdrawProposal = catchAsync(async (req, res, next) => {
  const proposalId = req.params.id;

  const proposal = await Proposal.findById(proposalId);

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  if (proposal.freelancer.toString() !== req.user.id.toString()) {
    return next(new AppError("You can only withdraw your own proposals", 403));
  }

  if (proposal.status !== "pending") {
    return next(new AppError("You can only withdraw pending proposals", 400));
  }

  proposal.status = "withdrawn";
  proposal.withdrawnAt = Date.now();
  await proposal.save();

  res.status(200).json({
    status: "success",
    message: "Proposal withdrawn successfully",
    data: proposal,
  });
});

module.exports = {
  createProposal,
  getProposalForJob,
  acceptProposal,
  getMyProposals,
  getProposalById,
  withdrawProposal,
};
