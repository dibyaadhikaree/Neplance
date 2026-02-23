const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const { pickUserFields } = require("../utils/userFields");

const getMyProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const updateMyProfile = catchAsync(async (req, res, next) => {
  const updates = pickUserFields(req.body, req.user.role);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deactivateMyAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "success",
    message: "Account deactivated successfully",
  });
});

const getFreelancers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, skills, search, availabilityStatus } = req.query;

  const query = { role: "freelancer" };
  if (skills) query.skills = { $in: skills.split(",").map(s => s.trim()) };
  if (search) query.$or = [
    { name: new RegExp(search, "i") },
    { bio: new RegExp(search, "i") }
  ];
  if (availabilityStatus) query.availabilityStatus = availabilityStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const selectFields = "name email avatar bio location skills hourlyRate experienceLevel jobTypePreference availabilityStatus languages portfolio";

  const [freelancers, total] = await Promise.all([
    User.find(query).select(selectFields).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    status: "success",
    results: freelancers.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: freelancers,
  });
});

const getFreelancerById = catchAsync(async (req, res, next) => {
  const freelancer = await User.findOne({ _id: req.params.id, role: "freelancer" });

  if (!freelancer) {
    return res.status(404).json({
      status: "fail",
      message: "Freelancer not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: freelancer,
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  deactivateMyAccount,
  getFreelancers,
  getFreelancerById,
};
