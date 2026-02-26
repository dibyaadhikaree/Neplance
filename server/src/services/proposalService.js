const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const { JOB_STATUS, PROPOSAL_STATUS } = require("../constants/statuses");
const {
  assertProposalCanAccept,
  assertProposalCanReject,
  assertProposalCanWithdraw,
} = require("./statusTransitions");

const acceptProposal = async (proposal, job) => {
  assertProposalCanAccept(job);

  proposal.status = PROPOSAL_STATUS.ACCEPTED;
  await proposal.save();

  await Proposal.updateMany(
    { job: job._id, _id: { $ne: proposal._id }, status: PROPOSAL_STATUS.PENDING },
    { $set: { status: PROPOSAL_STATUS.REJECTED } }
  );

  const contractorAddress = proposal.freelancer.toString();
  const updatedJob = await Job.findByIdAndUpdate(
    job._id,
    {
      status: JOB_STATUS.IN_PROGRESS,
      hiredFreelancer: proposal.freelancer,
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

  return { proposal, job: updatedJob };
};

const rejectProposal = async (proposal, job, reason) => {
  assertProposalCanReject(job, proposal);

  proposal.status = PROPOSAL_STATUS.REJECTED;
  proposal.rejectionReason = typeof reason === "string" ? reason.trim() : undefined;
  proposal.rejectedAt = Date.now();
  proposal.updatedAt = Date.now();
  await proposal.save();
  return proposal;
};

const withdrawProposal = async (proposal) => {
  assertProposalCanWithdraw(proposal);
  proposal.status = PROPOSAL_STATUS.WITHDRAWN;
  proposal.withdrawnAt = Date.now();
  await proposal.save();
  return proposal;
};

module.exports = {
  acceptProposal,
  rejectProposal,
  withdrawProposal,
};
