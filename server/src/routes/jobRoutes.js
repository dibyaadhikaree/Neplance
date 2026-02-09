const express = require("express");

const router = express.Router();

const {
  createJob,
  findJobs,
  markCompleted,
  approveCompletion,
  submitMilestone,
  approveMilestone,
  findMyJobs,
} = require("../controllers/jobController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(restrictTo("freelancer"), findJobs)
  .post(restrictTo("client"), createJob); //restrict create job to only Clients and find jobs to only Freelancers

router.route("/myJobs").get(restrictTo("client"), findMyJobs);

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
