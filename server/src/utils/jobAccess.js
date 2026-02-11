const AppError = require("./appError");
const Job = require("../models/Job");

const getCreatorId = (job) => job.creatorAddress?._id || job.creatorAddress;

const getJobOrThrow = async (jobId, message = "Contract not found") => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError(message, 404);
  }
  return job;
};

const ensureCreator = (job, userId, message) => {
  const creatorId = getCreatorId(job);
  if (!creatorId || creatorId.toString() !== userId.toString()) {
    throw new AppError(
      message || "You are not authorized to perform this action",
      403
    );
  }
};

const ensureContractor = (job, userId, message) => {
  const isContractor = (job.parties || []).some(
    (party) =>
      party.role === "CONTRACTOR" &&
      party.address.toString() === userId.toString()
  );

  if (!isContractor) {
    throw new AppError(
      message || "Only the contractor can perform this action",
      403
    );
  }
};

const ensureStatus = (job, allowedStatuses, message) => {
  const allowed = Array.isArray(allowedStatuses)
    ? allowedStatuses
    : [allowedStatuses];

  if (!allowed.includes(job.status)) {
    throw new AppError(message || "Invalid contract status", 400);
  }
};

module.exports = {
  getCreatorId,
  getJobOrThrow,
  ensureCreator,
  ensureContractor,
  ensureStatus,
};
