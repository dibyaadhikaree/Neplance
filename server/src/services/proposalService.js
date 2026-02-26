const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const { JOB_STATUS, PROPOSAL_STATUS } = require("../constants/statuses");
const {
  assertProposalCanAccept,
  assertProposalCanReject,
  assertProposalCanWithdraw,
  assertProposalCanCreate,
} = require("./statusTransitions");

const createProposal = async (job) => {
  assertProposalCanCreate(job);
};

const acceptProposal = async (proposal, job) => {
  assertProposalCanAccept(job);

  const acceptedProposal = await Proposal.findOneAndUpdate(
    { _id: proposal._id, status: PROPOSAL_STATUS.PENDING },
    { $set: { status: PROPOSAL_STATUS.ACCEPTED } },
    { new: true }
  );

  if (!acceptedProposal) {
    throw new AppError("Proposal is no longer pending", 409);
  }

  const contractorAddress = proposal.freelancer.toString();
  const updatedJob = await Job.findOneAndUpdate(
    {
      _id: job._id,
      status: JOB_STATUS.OPEN,
      $or: [{ hiredFreelancer: { $exists: false } }, { hiredFreelancer: null }],
    },
    {
      status: JOB_STATUS.IN_PROGRESS,
      hiredFreelancer: proposal.freelancer,
      updatedAt: new Date(),
      $addToSet: {
        parties: {
          address: contractorAddress,
          role: "CONTRACTOR",
        },
      },
    },
    { new: true }
  );

  if (!updatedJob) {
    const currentJob = await Job.findById(job._id).select(
      "status hiredFreelancer"
    );
    if (currentJob && currentJob.status !== JOB_STATUS.OPEN) {
      await Proposal.findByIdAndUpdate(acceptedProposal._id, {
        $set: { status: PROPOSAL_STATUS.REJECTED },
      });
      throw new AppError("Job is no longer open for hiring", 409);
    }

    await Proposal.findByIdAndUpdate(acceptedProposal._id, {
      $set: { status: PROPOSAL_STATUS.PENDING },
    });
    throw new AppError("Failed to accept proposal", 409);
  }

  await Proposal.updateMany(
    { job: job._id, _id: { $ne: proposal._id }, status: PROPOSAL_STATUS.PENDING },
    { $set: { status: PROPOSAL_STATUS.REJECTED } }
  );

  return { proposal: acceptedProposal, job: updatedJob };
};

const rejectProposal = async (proposal, job, reason) => {
  assertProposalCanReject(job, proposal);

  proposal.status = PROPOSAL_STATUS.REJECTED;
  proposal.rejectionReason = typeof reason === "string" ? reason.trim() : undefined;
  proposal.rejectedAt = new Date();
  proposal.updatedAt = new Date();
  await proposal.save();
  return proposal;
};

const withdrawProposal = async (proposal) => {
  assertProposalCanWithdraw(proposal);
  proposal.status = PROPOSAL_STATUS.WITHDRAWN;
  proposal.withdrawnAt = new Date();
  await proposal.save();
  return proposal;
};

module.exports = {
  createProposal,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
};
