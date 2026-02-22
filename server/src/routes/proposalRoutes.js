const express = require("express");
const {
  createProposal,
  getProposalForJob,
  acceptProposal,
  getMyProposals,
  getProposalById,
} = require("../controllers/proposalController");
const { restrictTo, protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

//restrict to freelancers only
router.route("/").post(restrictTo("freelancer"), createProposal);

//find my  proposals
router.route("/myProposals").get(restrictTo("freelancer"), getMyProposals);

//find proposal for a job
//restrict to the respective JobId owner/Client
router.route("/job/:jobId").get(restrictTo("client"), getProposalForJob);

router.route("/:id/accept").patch(restrictTo("client"), acceptProposal);

router.route("/:id").get(getProposalById);

module.exports = router;
