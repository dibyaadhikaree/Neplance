const AppError = require("../utils/appError");
const Proposal = require("../models/Proposal");
const {
  JOB_STATUS,
  CANCELLATION_STATUS,
  MILESTONE_STATUS,
} = require("../constants/statuses");
const {
  normalizeJobCreateStatus,
  assertJobCanUpdate,
  assertJobCanPublish,
  assertJobCanDelete,
  assertJobCanSubmitMilestone,
  assertJobCanApproveMilestone,
  assertJobCanRequestCancellation,
  assertJobCanRespondCancellation,
} = require("./statusTransitions");

const getCreateStatus = (status) => normalizeJobCreateStatus(status);

const normalizeJobCreateDefaults = ({
  jobType,
  budgetType,
  isPublic,
  isUrgent,
  tags,
  requiredSkills,
  milestones,
  attachments,
  parties,
  status,
}) => {
  return {
    jobType: jobType || "digital",
    budgetType: budgetType || "fixed",
    isPublic: isPublic !== undefined ? isPublic : true,
    isUrgent: isUrgent !== undefined ? isUrgent : false,
    tags: Array.isArray(tags) ? tags : [],
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    milestones: Array.isArray(milestones) ? milestones : [],
    attachments: Array.isArray(attachments) ? attachments : [],
    parties: Array.isArray(parties) ? parties : [],
    status: normalizeJobCreateStatus(status),
  };
};

const validateJobUpdate = (job) => {
  assertJobCanUpdate(job);
};

const publishJob = async (job) => {
  assertJobCanPublish(job);

  if (!job.category || !job.budget?.min) {
    throw new AppError("Job must have category and budget to be published", 400);
  }

  job.status = JOB_STATUS.OPEN;
  job.updatedAt = new Date();
  await job.save();
  return job;
};

const deleteJob = async (job, deleteFn) => {
  assertJobCanDelete(job);
  await Proposal.deleteMany({ job: job._id });
  await deleteFn(job._id);
};


const submitMilestone = async (job, milestoneIndex, evidence) => {
  if (Number.isNaN(milestoneIndex) || milestoneIndex < 0) {
    throw new AppError("Invalid milestone index", 400);
  }

  const milestone = job.milestones?.[milestoneIndex];
  if (!milestone) {
    throw new AppError("Milestone not found", 404);
  }

  assertJobCanSubmitMilestone(job, milestone);

  milestone.status = MILESTONE_STATUS.SUBMITTED;
  if (typeof evidence === "string" && evidence.trim().length > 0) {
    milestone.evidence = evidence.trim();
  }
  milestone.completedAt = new Date();
  job.updatedAt = new Date();
  await job.save();
  return job;
};

const approveMilestone = async (job, milestoneIndex, approverId) => {
  if (Number.isNaN(milestoneIndex) || milestoneIndex < 0) {
    throw new AppError("Invalid milestone index", 400);
  }

  const milestone = job.milestones?.[milestoneIndex];
  if (!milestone) {
    throw new AppError("Milestone not found", 404);
  }

  assertJobCanApproveMilestone(milestone);

  milestone.status = MILESTONE_STATUS.COMPLETED;
  milestone.approvedBy = Array.from(
    new Set([...(milestone.approvedBy || []), approverId.toString()])
  );

  const allCompleted = (job.milestones || []).every(
    (item) => item.status === MILESTONE_STATUS.COMPLETED
  );

  if (allCompleted) {
    job.status = JOB_STATUS.COMPLETED;
  }

  job.updatedAt = new Date();
  await job.save();
  return { job, allCompleted };
};

const requestCancellation = async (job, userId, reason) => {
  assertJobCanRequestCancellation(job);

  const isCreator = job.creatorAddress?.toString() === userId;
  const isContractor = (job.parties || []).some(
    (party) => party.role === "CONTRACTOR" && party.address.toString() === userId
  );

  if (!isCreator && !isContractor) {
    throw new AppError("You are not authorized to cancel this job", 403);
  }

  job.cancellation = {
    status: CANCELLATION_STATUS.PENDING,
    initiatedBy: userId,
    initiatedRole: isCreator ? "CREATOR" : "CONTRACTOR",
    reason: typeof reason === "string" ? reason.trim() : undefined,
    requestedAt: new Date(),
  };
  job.updatedAt = new Date();
  await job.save();
  return job;
};

const respondCancellation = async (job, userId, action) => {
  assertJobCanRespondCancellation(job, action, userId);

  const isCreator = job.creatorAddress?.toString() === userId;
  const isContractor = (job.parties || []).some(
    (party) => party.role === "CONTRACTOR" && party.address.toString() === userId
  );

  if (!isCreator && !isContractor) {
    throw new AppError("You are not authorized to respond", 403);
  }

  const accepted = action === "accept";
  job.cancellation.status = accepted
    ? CANCELLATION_STATUS.ACCEPTED
    : CANCELLATION_STATUS.REJECTED;
  job.cancellation.respondedBy = userId;
  job.cancellation.respondedAt = new Date();
  if (accepted) {
    job.status = JOB_STATUS.CANCELLED;
  }
  job.updatedAt = new Date();
  await job.save();
  return { job, accepted };
};

module.exports = {
  getCreateStatus,
  normalizeJobCreateDefaults,
  validateJobUpdate,
  publishJob,
  deleteJob,
  submitMilestone,
  approveMilestone,
  requestCancellation,
  respondCancellation,
};
