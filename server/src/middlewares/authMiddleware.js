const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const protect = catchAsync(async (req, res, next) => {
  //verify jwt token

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.AUTH_JWT_SECRET).catch(
    (err) => {
      throw new AppError("Invalid token or session expired. Please log in again.", 401);
    }
  );

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) throw new AppError("The user doesnt exist any more ", 404);

  req.user = currentUser.toObject(); //doing this because currentUser is  a mongoose _doc , it includes its methods and validators and setter , getter
  req.user.id = currentUser._id;

  next();
});

const restrictTo =
  (...roles) =>
    (req, res, next) => {
      if (!req.user) throw new AppError("You are not logged in ", 401);

      // Check if user's role(s) match any of the allowed roles
      const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
      const hasPermission = userRoles.some((role) => roles.includes(role));

      if (!hasPermission) {
        throw new AppError("You are not authorized to view this", 403);
      }

      next();
    };

module.exports = {
  protect,
  restrictTo,
};
