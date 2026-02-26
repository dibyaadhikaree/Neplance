const Job = require("../models/Job");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  getJobOrThrow,
  ensureCreator,
  ensureContractor,
  ensureStatus,
} = require("../utils/jobAccess");
const {
  JOB_STATUS,
  CANCELLATION_STATUS,
  MILESTONE_STATUS,
} = require("../constants/statuses");

const createJob = catchAsync(async (req, res) => {
  const {
    title,
    description,
    jobType = "digital",
    category,
    subcategory,
    tags = [],
    requiredSkills = [],
    experienceLevel,
    budgetType = "fixed",
    budget,
    deadline,
    isUrgent = false,
    location,
    isPublic = true,
    milestones = [],
    terms,
    attachments = [],
    parties = [],
    status = JOB_STATUS.DRAFT,
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

  const jobStatus = [JOB_STATUS.DRAFT, JOB_STATUS.OPEN].includes(status)
    ? status
    : JOB_STATUS.DRAFT;

  const data = await Job.create({
    title,
    description,
    creatorAddress,
    status: jobStatus,
    jobType,
    category,
    subcategory,
    tags,
    requiredSkills,
    experienceLevel,
    budgetType,
    budget,
    deadline,
    isUrgent,
    location,
    isPublic,
    milestones,
    parties: normalizedParties,
    terms,
    attachments,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  res.status(201).json({
    status: "success",
    data,
  });
});

const findJobs = catchAsync(async (req, res) => {
  const {
    category,
    jobType,
    experienceLevel,
    budgetType,
    minBudget,
    maxBudget,
    city,
    district,
    province,
    isRemote,
    tags,
    skills,
    search,
    isUrgent,
    isFeatured,
    sort = "-createdAt",
    page = 1,
    limit = 20,
  } = req.query;

  const query = { isPublic: true, status: JOB_STATUS.OPEN };

  if (category) query.category = category;
  if (jobType) query.jobType = jobType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (budgetType) query.budgetType = budgetType;
  if (isUrgent === "true") query.isUrgent = true;
  if (isFeatured === "true") query.isFeatured = true;

  if (minBudget || maxBudget) {
    query["budget.min"] = {};
    if (minBudget) query["budget.min"].$gte = Number(minBudget);
    if (maxBudget) query["budget.max"] = { $lte: Number(maxBudget) };
  }

  if (city) query["location.city"] = new RegExp(city, "i");
  if (district) query["location.district"] = new RegExp(district, "i");
  if (province) query["location.province"] = province;
  if (isRemote === "true") query["location.isRemote"] = true;

  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim());
    query.tags = { $in: tagArray };
  }

  if (skills) {
    const skillArray = skills.split(",").map((s) => s.trim());
    query.requiredSkills = { $in: skillArray };
  }

  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { tags: new RegExp(search, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    Job.find(query)
      .populate("creatorAddress", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Job.countDocuments(query),
  ]);

  res.status(200).json({
    status: "success",
    results: data.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data,
  });
});

const findMyJobs = catchAsync(async (req, res) => {
  const { status, sort = "-createdAt", page = 1, limit = 20 } = req.query;

  const query = { creatorAddress: req.user.id.toString() };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    Job.find(query)
      .populate("creatorAddress", "name email")
      .populate("hiredFreelancer", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Job.countDocuments(query),
  ]);

  res.status(200).json({
    status: "success",
    results: data.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data,
  });
});

const getJob = catchAsync(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("creatorAddress", "name email")
    .populate("hiredFreelancer", "name email");

  if (!job) throw new AppError("Job not found", 404);

  if (job.isPublic) {
    job.viewCount += 1;
    await job.save();
  }

  res.status(200).json({
    status: "success",
    data: job,
  });
});

const updateJob = catchAsync(async (req, res) => {
  const jobId = req.params.id;
  const job = await getJobOrThrow(jobId);
  ensureCreator(job, req.user.id, "You can only update your own jobs");
  ensureStatus(job, [JOB_STATUS.DRAFT, JOB_STATUS.OPEN], "Can only update draft or open jobs");

  const allowedUpdates = [
    "title", "description", "jobType", "category", "subcategory",
    "tags", "requiredSkills", "experienceLevel", "budgetType", "budget",
    "deadline", "isUrgent", "location", "isPublic", "milestones",
    "terms", "attachments",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  updates.updatedAt = Date.now();

  const updatedJob = await Job.findByIdAndUpdate(jobId, updates, {
    new: true,
    runValidators: true,
  }).populate("creatorAddress", "name email");

  res.status(200).json({
    status: "success",
    data: updatedJob,
  });
});

const publishJob = catchAsync(async (req, res) => {
  const jobId = req.params.id;
  const job = await getJobOrThrow(jobId);
  ensureCreator(job, req.user.id, "You can only publish your own jobs");

  if (job.status !== JOB_STATUS.DRAFT) {
    throw new AppError("Only draft jobs can be published", 400);
  }

  if (!job.category || !job.budget?.min) {
    throw new AppError("Job must have category and budget to be published", 400);
  }

  job.status = JOB_STATUS.OPEN;
  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    message: "Job published successfully",
    data: job,
  });
});

const deleteJob = catchAsync(async (req, res) => {
  const jobId = req.params.id;
  const job = await getJobOrThrow(jobId);
  ensureCreator(job, req.user.id, "You can only delete your own jobs");

  if (![JOB_STATUS.DRAFT, JOB_STATUS.OPEN].includes(job.status)) {
    throw new AppError("Can only delete draft or open jobs", 400);
  }

  await Job.findByIdAndDelete(jobId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const markCompleted = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;

  const job = await getJobOrThrow(jobId);
  ensureContractor(job, req.user.id, "Only the contractor can mark completion");
  ensureStatus(job, JOB_STATUS.IN_PROGRESS, "Contract is not active, cannot mark as completed");

  job.status = JOB_STATUS.COMPLETED;
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
  ensureStatus(job, JOB_STATUS.COMPLETED, "The contract is not marked completed yet");

  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    job,
    message: "Successfully approved contract completion",
  });
});

const submitMilestone = catchAsync(async (req, res, next) => {
  const { id: jobId, index } = req.params;
  const { evidence } = req.body;

  const job = await getJobOrThrow(jobId);
  ensureContractor(job, req.user.id, "Only the contractor can submit milestones");
  ensureStatus(job, JOB_STATUS.IN_PROGRESS, "Contract is not active, cannot submit milestones");

  const milestoneIndex = Number(index);
  if (Number.isNaN(milestoneIndex) || milestoneIndex < 0) {
    return next(new AppError("Invalid milestone index", 400));
  }

  const milestone = job.milestones?.[milestoneIndex];
  if (!milestone) {
    return next(new AppError("Milestone not found", 404));
  }

  if (milestone.status !== MILESTONE_STATUS.ACTIVE) {
    return next(
      new AppError("Milestone is not active, cannot submit", 400)
    );
  }

  milestone.status = MILESTONE_STATUS.SUBMITTED;
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

  if (milestone.status !== MILESTONE_STATUS.SUBMITTED) {
    return next(
      new AppError("Milestone has not been submitted", 400)
    );
  }

  milestone.status = MILESTONE_STATUS.COMPLETED;
  milestone.approvedBy = Array.from(
    new Set([...(milestone.approvedBy || []), req.user.id.toString()])
  );

  const allCompleted = (job.milestones || []).every(
    (item) => item.status === MILESTONE_STATUS.COMPLETED
  );

  if (allCompleted) {
    job.status = JOB_STATUS.COMPLETED;
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

const requestCancellation = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const { reason } = req.body;

  const job = await getJobOrThrow(jobId);
  ensureStatus(job, JOB_STATUS.IN_PROGRESS, "Only active jobs can be canceled");

  const userId = req.user.id.toString();
  const isCreator = job.creatorAddress?.toString() === userId;
  const isContractor = (job.parties || []).some(
    (party) =>
      party.role === "CONTRACTOR" && party.address.toString() === userId
  );

  if (!isCreator && !isContractor) {
    return next(new AppError("You are not authorized to cancel this job", 403));
  }

  if (job.cancellation?.status === CANCELLATION_STATUS.PENDING) {
    return next(new AppError("Cancellation already requested", 400));
  }

  job.cancellation = {
    status: CANCELLATION_STATUS.PENDING,
    initiatedBy: req.user.id,
    initiatedRole: isCreator ? "CREATOR" : "CONTRACTOR",
    reason: typeof reason === "string" ? reason.trim() : undefined,
    requestedAt: Date.now(),
  };
  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    message: "Cancellation requested",
    data: job,
  });
});

const respondCancellation = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const { action } = req.body;

  const job = await getJobOrThrow(jobId);
  ensureStatus(job, JOB_STATUS.IN_PROGRESS, "Only active jobs can be canceled");

  if (!job.cancellation || job.cancellation.status !== CANCELLATION_STATUS.PENDING) {
    return next(new AppError("No pending cancellation request", 400));
  }

  const userId = req.user.id.toString();
  const isCreator = job.creatorAddress?.toString() === userId;
  const isContractor = (job.parties || []).some(
    (party) =>
      party.role === "CONTRACTOR" && party.address.toString() === userId
  );

  if (!isCreator && !isContractor) {
    return next(new AppError("You are not authorized to respond", 403));
  }

  if (job.cancellation.initiatedBy?.toString() === userId) {
    return next(
      new AppError("Initiator cannot respond to cancellation", 400)
    );
  }

  if (action !== "accept" && action !== "reject") {
    return next(new AppError("Action must be accept or reject", 400));
  }

  const accepted = action === "accept";

  job.cancellation.status = accepted
    ? CANCELLATION_STATUS.ACCEPTED
    : CANCELLATION_STATUS.REJECTED;
  job.cancellation.respondedBy = req.user.id;
  job.cancellation.respondedAt = Date.now();
  if (accepted) {
    job.status = JOB_STATUS.CANCELLED;
  }
  job.updatedAt = Date.now();
  await job.save();

  res.status(200).json({
    status: "success",
    message: accepted
      ? "Cancellation accepted and job cancelled"
      : "Cancellation rejected",
    data: job,
  });
});

const getJobCategories = catchAsync(async (req, res) => {
  const categories = await Job.distinct("category");
  res.status(200).json({
    status: "success",
    data: categories,
  });
});

const incrementProposalCount = catchAsync(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { $inc: { proposalCount: 1 } },
    { new: true }
  );

  if (!job) throw new AppError("Job not found", 404);

  res.status(200).json({
    status: "success",
    proposalCount: job.proposalCount,
  });
});

module.exports = {
  createJob,
  findJobs,
  findMyJobs,
  getJob,
  updateJob,
  publishJob,
  deleteJob,
  markCompleted,
  approveCompletion,
  submitMilestone,
  approveMilestone,
  getJobCategories,
  incrementProposalCount,
  requestCancellation,
  respondCancellation,
};
