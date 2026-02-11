const Job = require("../models/Job");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  getJobOrThrow,
  ensureCreator,
  ensureContractor,
  ensureStatus,
} = require("../utils/jobAccess");

const createJob = catchAsync(async (req, res) => {
  const {
    title,
    description,
    milestones = [],
    terms,
    attachments = [],
    parties = [],
  } = req.body;

  const creatorAddress = req.user.id.toString();
  const normalizedParties = [
    { address: creatorAddress, role: "CREATOR" },
    ...parties
      .filter(
        (party) =>
          party &&
          party.address &&
          party.role &&
          party.address.toString() !== creatorAddress
      )
      .map((party) => ({
        address: party.address,
        role: party.role,
        publicKey: party.publicKey,
        signature: party.signature,
      })),
  ];

  const data = await Job.create({
    title,
    description,
    creatorAddress,
    status: "DRAFT",
    milestones,
    parties: normalizedParties,
    terms,
    attachments,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

const findJobs = catchAsync(async (req, res) => {
  const data = await Job.find({}).populate("creatorAddress", "name email");

  if (!data) throw new AppError("No Job found", 400);

  res.status(200).json({
    status: "success",
    data,
  });
});
const findMyJobs = catchAsync(async (req, res) => {
  const data = await Job.find({ creatorAddress: req.user.id.toString() }).populate(
    "creatorAddress",
    "name email"
  );

  if (!data) throw new AppError("No Job found", 400);

  res.status(200).json({
    status: "success",
    data,
  });
});

// PATCH /api/jobs/:id/mark-completed
const markCompleted = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;

  const job = await getJobOrThrow(jobId);
  ensureContractor(job, req.user.id, "Only the contractor can mark completion");
  ensureStatus(job, "ACTIVE", "Contract is not active, cannot mark as completed");

  job.status = "COMPLETED";
  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    message: "Contract marked as completed.",
    job,
  });
});

const approveCompletion = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;

  const job = await getJobOrThrow(
    jobId,
    "The contract was not found or you are not authorized"
  );
  ensureCreator(
    job,
    req.user.id,
    "You are not authorized to approve completion for this contract"
  );
  ensureStatus(job, "COMPLETED", "The contract is not marked completed yet");

  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    job,
    message: "Successfully approved contract completion",
  });
});

// PATCH /api/jobs/:id/milestones/:index/submit
const submitMilestone = catchAsync(async (req, res, next) => {
  const { id: jobId, index } = req.params;
  const { evidence } = req.body;

  const job = await getJobOrThrow(jobId);
  ensureContractor(job, req.user.id, "Only the contractor can submit milestones");
  ensureStatus(job, "ACTIVE", "Contract is not active, cannot submit milestones");

  const milestoneIndex = Number(index);
  if (Number.isNaN(milestoneIndex) || milestoneIndex < 0) {
    return next(new AppError("Invalid milestone index", 400));
  }

  const milestone = job.milestones?.[milestoneIndex];
  if (!milestone) {
    return next(new AppError("Milestone not found", 404));
  }

  if (milestone.status !== "ACTIVE") {
    return next(
      new AppError("Milestone is not active, cannot submit", 400)
    );
  }

  milestone.status = "SUBMITTED";
  if (typeof evidence === "string" && evidence.trim().length > 0) {
    milestone.evidence = evidence.trim();
  }
  milestone.completedAt = Date.now();
  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    message: "Milestone submitted for approval.",
    job,
  });
});

// PATCH /api/jobs/:id/milestones/:index/approve
const approveMilestone = catchAsync(async (req, res, next) => {
  const { id: jobId, index } = req.params;

  const job = await getJobOrThrow(jobId);
  ensureCreator(job, req.user.id, "Only the creator can approve milestones");

  const milestoneIndex = Number(index);
  if (Number.isNaN(milestoneIndex) || milestoneIndex < 0) {
    return next(new AppError("Invalid milestone index", 400));
  }

  const milestone = job.milestones?.[milestoneIndex];
  if (!milestone) {
    return next(new AppError("Milestone not found", 404));
  }

  if (milestone.status !== "SUBMITTED") {
    return next(
      new AppError("Milestone has not been submitted", 400)
    );
  }

  milestone.status = "COMPLETED";
  milestone.approvedBy = Array.from(
    new Set([...(milestone.approvedBy || []), req.user.id.toString()])
  );

  const allCompleted = (job.milestones || []).every(
    (item) => item.status === "COMPLETED"
  );

  if (allCompleted) {
    job.status = "COMPLETED";
  }

  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    message: allCompleted
      ? "Milestone approved and contract completed."
      : "Milestone approved.",
    job,
  });
});

module.exports = {
  createJob,
  findJobs,
  markCompleted,
  approveCompletion,
  submitMilestone,
  approveMilestone,
  findMyJobs,
};
