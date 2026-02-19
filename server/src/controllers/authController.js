const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

const profileFields = [
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

const pickProfileFields = (payload = {}, role = []) => {
  const allowedFields = hasFreelancerRole(role)
    ? [...profileFields, ...freelancerOnlyFields]
    : profileFields;

  return allowedFields.reduce((acc, field) => {
    if (payload[field] !== undefined) {
      acc[field] = payload[field];
    }
    return acc;
  }, {});
};

// Create JWT token for user
const createToken = (userId) => {
  const jwtOptions = {
    expiresIn: process.env.AUTH_JWT_EXPIRATION || "24h",
  };
  return jwt.sign({ id: userId }, process.env.AUTH_JWT_SECRET, jwtOptions);
};

const createSendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieExpirationDays =
    Number(process.env.AUTH_JWT_COOKIE_EXPIRATION_DAYS) || 1;
  const cookieOptions = {
    expires: new Date(
      Date.now() + cookieExpirationDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const profilePayload = pickProfileFields(req.body, role);

  const freshUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
    ...profilePayload,
  });

  createSendToken(freshUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Please enter your email or password", 400);

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    throw new AppError("Invalid email or password", 401);

  createSendToken(user, 200, res);
});

const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  getUser,
};
