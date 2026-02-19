const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");

const commonEditableFields = [
  "name",
  "phone",
  "avatar",
  "bio",
  "location",
];

const freelancerOnlyFields = [
  "skills",
  "hourlyRate",
  "experienceLevel",
  "jobTypePreference",
  "availabilityStatus",
  "languages",
  "portfolio",
];

const hasFreelancerRole = (role = []) => {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes("freelancer");
};

const pickEditableFields = (payload = {}, role = []) => {
  const allowedFields = hasFreelancerRole(role)
    ? [...commonEditableFields, ...freelancerOnlyFields]
    : commonEditableFields;

  return allowedFields.reduce((acc, field) => {
    if (payload[field] !== undefined) {
      acc[field] = payload[field];
    }
    return acc;
  }, {});
};

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
  const updates = pickEditableFields(req.body, req.user.role);

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

const getFreelancers = catchAsync(async (req, res, next) => {
  const freelancers = await User.find({ role: "freelancer" }).select(
    "name email avatar bio location skills hourlyRate experienceLevel jobTypePreference availabilityStatus languages portfolio"
  );

  res.status(200).json({
    status: "success",
    data: freelancers,
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getFreelancers,
};
