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
  markCompleted,
  approveCompletion,
  submitMilestone,
  approveMilestone,
  getJobCategories,
  incrementProposalCount,
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
  .route("/:id/markCompleted")
  .patch(restrictTo("freelancer"), markCompleted);
router
  .route("/:id/approveCompletion")
  .patch(restrictTo("client"), approveCompletion);

router
  .route("/:id/milestones/:index/submit")
  .patch(restrictTo("freelancer"), submitMilestone);

router
  .route("/:id/milestones/:index/approve")
  .patch(restrictTo("client"), approveMilestone);

module.exports = router;
