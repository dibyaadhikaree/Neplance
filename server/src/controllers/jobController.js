const Job = require("../models/Job");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

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

  if (!data) throw new AppError(400, "No Job found ");

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

  if (!data) throw new AppError(400, "No Job found ");

  res.status(200).json({
    status: "success",
    data,
  });
});

// PATCH /api/jobs/:id/mark-completed
const markCompleted = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError("Contract not found", 404));
  }

  const isContractor = (job.parties || []).some(
    (party) =>
      party.role === "CONTRACTOR" &&
      party.address.toString() === req.user.id.toString()
  );

  if (!isContractor) {
    return next(
      new AppError("Only the contractor can mark completion", 403)
    );
  }

  if (job.status !== "ACTIVE") {
    return next(
      new AppError("Contract is not active, cannot mark as completed", 400)
    );
  }

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

  const job = await Job.findById(jobId);
  if (!job)
    throw new AppError(
      "The contract was not found or you are not authorized",
      404
    );

  const creatorId = job.creatorAddress?._id || job.creatorAddress;
  if (creatorId.toString() !== req.user.id.toString()) {
    throw new AppError(
      "You are not authorized to approve completion for this contract",
      403
    );
  }

  if (job.status !== "COMPLETED") {
    throw new AppError(
      "The contract is not marked completed yet",
      400
    );
  }

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

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError("Contract not found", 404));
  }

  const isContractor = (job.parties || []).some(
    (party) =>
      party.role === "CONTRACTOR" &&
      party.address.toString() === req.user.id.toString()
  );

  if (!isContractor) {
    return next(new AppError("Only the contractor can submit milestones", 403));
  }

  if (job.status !== "ACTIVE") {
    return next(
      new AppError("Contract is not active, cannot submit milestones", 400)
    );
  }

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

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError("Contract not found", 404));
  }

  const creatorId = job.creatorAddress?._id || job.creatorAddress;
  if (creatorId.toString() !== req.user.id.toString()) {
    return next(
      new AppError("Only the creator can approve milestones", 403)
    );
  }

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
