const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  getFreelancers,
} = require("../controllers/userController");

router.get("/freelancers", getFreelancers);
router.route("/me").get(protect, getMyProfile).patch(protect, updateMyProfile);

module.exports = router;
