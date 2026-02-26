const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { getJobOrThrow, ensureCreator, ensureStatus } = require("../utils/jobAccess");
const { JOB_STATUS, PROPOSAL_STATUS } = require("../constants/statuses");

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
  const { job: jobId, status, amount, coverLetter, deliveryDays, revisionsIncluded, attachments } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.creatorAddress.toString() === req.user.id.toString()) {
    throw new AppError("You cannot submit a proposal on your own job", 400);
  }

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
  ensureStatus(job, JOB_STATUS.OPEN, "Contract is not open for hiring. Please publish your job first.");

  // 2) Accept this proposal
  proposal.status = PROPOSAL_STATUS.ACCEPTED;
  await proposal.save();

  // 3) Reject all other pending proposals for this job
  await Proposal.updateMany(
    { job: jobId, _id: { $ne: proposal._id }, status: PROPOSAL_STATUS.PENDING },
    { $set: { status: PROPOSAL_STATUS.REJECTED } }
  );

  // 4) Update job status + add contractor party
  const contractorAddress = proposal.freelancer.toString();
  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    {
      status: JOB_STATUS.IN_PROGRESS,
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
  ensureStatus(job, [JOB_STATUS.OPEN, JOB_STATUS.IN_PROGRESS], "Job is not open for rejection");

  if (proposal.status === PROPOSAL_STATUS.ACCEPTED) {
    return next(new AppError("Accepted proposals cannot be rejected", 400));
  }

  if (proposal.status === PROPOSAL_STATUS.WITHDRAWN) {
    return next(new AppError("Withdrawn proposals cannot be rejected", 400));
  }

  if (proposal.status === PROPOSAL_STATUS.REJECTED) {
    return next(new AppError("Proposal is already rejected", 400));
  }

  proposal.status = PROPOSAL_STATUS.REJECTED;
  proposal.rejectionReason = typeof reason === "string" ? reason.trim() : undefined;
  proposal.rejectedAt = Date.now();
  proposal.updatedAt = Date.now();
  await proposal.save();

  res.status(200).json({
    status: "success",
    message: "Proposal rejected",
    data: proposal,
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

  if (proposal.status !== PROPOSAL_STATUS.PENDING) {
    return next(new AppError("You can only withdraw pending proposals", 400));
  }

  proposal.status = PROPOSAL_STATUS.WITHDRAWN;
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
  rejectProposal,
  getMyProposals,
  getProposalById,
  withdrawProposal,
};
