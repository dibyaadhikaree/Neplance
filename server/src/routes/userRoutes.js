const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  deactivateMyAccount,
  getFreelancers,
  getFreelancerById,
} = require("../controllers/userController");

router.get("/freelancers", getFreelancers);
router.get("/freelancers/:id", getFreelancerById);
router.route("/me").get(protect, getMyProfile).patch(protect, updateMyProfile).delete(protect, deactivateMyAccount);

module.exports = router;
