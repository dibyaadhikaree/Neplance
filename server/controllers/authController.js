const catchAsync = require("../utils/catchAsync");

const User = require("../models/User");

const AppError = require("../utils/appError");

const jwt = require("jsonwebtoken");
const { cookie } = require("express-validator");

//creating a jwt token for the user with userId

const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

  return token;
};

const register = catchAsync(async (req, res, next) => {
  //registering in a user

  const { name, email, password, passwordConfirm, role } = req.body;
  console.log("In register", req.body);

  const freshUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  freshUser.password = undefined;

  res.status(200).json({
    status: "success",
    data: freshUser,
    token: createToken(freshUser._id),
  });
});

const login = catchAsync(async (req, res, next) => {
  //logging in a user

  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Please enter your email or password", 400);

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    throw new AppError("Please enter an valid password or email", 401);

  user.password = undefined;

  res.status(200).json({
    status: "Login Sucessfull",
    user,
    token: createToken(user._id),
  });
});

const protect = catchAsync(async (req, res, next) => {
  //verify jwt token

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else
    throw new AppError(
      "You are not logged in, Please login to continue (No bearer token in headers)",
      404
    );

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) throw new AppError("The user doesnt exist any more ", 404);

  req.user = currentUser.toObject(); //doing this because currentUser is  a mongoose _doc , it includes its methods and validators and setter , getter
  req.user.id = currentUser._id;

  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(req.user, "in restrict to ", roles);
    if (!req.user) throw new AppError("You are not logged in ");

    if (
      Array.isArray(req.user.role) &&
      !roles.some((el) => req.user.role.includes(el))
    ) {
      throw new AppError("You are not authorized to view this");
    }

    // if (roles.includes(...req.user.role))
    next();
  };

module.exports = { register, login, protect, restrictTo };
