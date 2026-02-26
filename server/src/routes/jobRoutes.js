const express = require("express");

const router = express.Router();

const {
  createJob,
  findJobs,
  findMyJobs,
  getJob,
  updateJob,
  publishJob,
  deleteJob,
  submitMilestone,
  approveMilestone,
  getJobCategories,
  incrementProposalCount,
  requestCancellation,
  respondCancellation,
} = require("../controllers/jobController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/categories", getJobCategories);
router.get("/myJobs", restrictTo("client"), findMyJobs);

router
  .route("/")
  .get(restrictTo("freelancer"), findJobs)
  .post(restrictTo("client"), createJob);

router
  .route("/:id")
  .get(getJob)
  .patch(restrictTo("client"), updateJob)
  .delete(restrictTo("client"), deleteJob);

router.patch("/:id/publish", restrictTo("client"), publishJob);
router.patch("/:id/increment-proposals", incrementProposalCount);

router
  .route("/:id/milestones/:index/submit")
  .patch(restrictTo("freelancer"), submitMilestone);

router
  .route("/:id/milestones/:index/approve")
  .patch(restrictTo("client"), approveMilestone);

router.patch("/:id/cancel", requestCancellation);
router.patch("/:id/cancel/respond", respondCancellation);

module.exports = router;
