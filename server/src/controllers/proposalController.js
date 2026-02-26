const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { getJobOrThrow, ensureCreator } = require("../utils/jobAccess");
const { PROPOSAL_STATUS } = require("../constants/statuses");
const {
  createProposal: createProposalService,
  acceptProposal: acceptProposalService,
  rejectProposal: rejectProposalService,
  withdrawProposal: withdrawProposalService,
} = require("../services/proposalService");

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
  const {
    job: jobId,
    amount,
    coverLetter,
    deliveryDays,
    revisionsIncluded,
    attachments,
    status,
  } = req.body;
  if (status !== undefined) {
    throw new AppError("Status cannot be set on proposal creation", 400);
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.creatorAddress.toString() === req.user.id.toString()) {
    throw new AppError("You cannot submit a proposal on your own job", 400);
  }

  createProposalService(job);

  const existingProposal = await Proposal.findOne({
    freelancer: req.user.id,
    job: jobId,
    status: { $nin: [PROPOSAL_STATUS.WITHDRAWN, PROPOSAL_STATUS.REJECTED] },
  });

  if (existingProposal) {
    throw new AppError("You have already submitted a proposal for this job", 400);
  }

  const data = await Proposal.create({
    freelancer: req.user.id,
    job: jobId,
    status: PROPOSAL_STATUS.PENDING,
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
  const { proposal: acceptedProposal, job: updatedJob } =
    await acceptProposalService(proposal, job);

  // 5) Response
  res.status(200).json({
    status: "success",
    message: "Proposal accepted and contract activated",
    acceptedProposal,
    job: updatedJob,
  });
});

const rejectProposal = catchAsync(async (req, res, next) => {
  const proposalId = req.params.id;
  const { reason } = req.body;

  const proposal = await Proposal.findById(proposalId).populate("job");
  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  const job = proposal.job;
  if (!job) throw new AppError("Job not found", 404);

  ensureCreator(job, req.user.id, "You can't reject proposals for this job");
  const updatedProposal = await rejectProposalService(proposal, job, reason);

  res.status(200).json({
    status: "success",
    message: "Proposal rejected",
    data: updatedProposal,
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
    const populatedProposal = await Proposal.findById(proposalId)
      .populate("freelancer", "name email")
      .populate({ path: "job", populate: { path: "creatorAddress", select: "name email" } });
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

  const populatedProposal = await Proposal.findById(proposalId)
    .populate("freelancer", "name email")
    .populate({ path: "job", populate: { path: "creatorAddress", select: "name email" } });
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

  const updatedProposal = await withdrawProposalService(proposal);

  res.status(200).json({
    status: "success",
    message: "Proposal withdrawn successfully",
    data: updatedProposal,
  });
});

module.exports = {
  createProposal,
  getProposalForJob,
  acceptProposal,
  rejectProposal,
  getMyProposals,
  getProposalById,
  withdrawProposal,
};
