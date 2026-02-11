const express = require("express");
const router = express.Router();

const {
  login,
  register,
  logout,
  getMe,
  getUser,
} = require("../controllers/authController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/register").post(register);
router.route("/me").get(protect, getMe, getUser);

module.exports = router;
