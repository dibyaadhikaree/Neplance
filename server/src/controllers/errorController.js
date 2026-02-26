const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode === 401) {
    logger.warn("Request rejected with 401.", err);
  } else {
    logger.error("Error encountered while processing request.", err);
  }

  let resolvedStatusCode = statusCode;
  let status = err.status || "error";
  let message = err.message || "Something went wrong";

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    resolvedStatusCode = 400;
    status = "fail";
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different ${field}.`;
  }

  if (err.name === "ValidationError") {
    resolvedStatusCode = 400;
    status = "fail";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.name === "CastError") {
    resolvedStatusCode = 400;
    status = "fail";
    message = `Invalid ${err.path}: ${err.value}`;
    err.errorCode = "INVALID_ID";
  }

  const response = {
    status,
    message: message,
  };

  if (err.errorCode) {
    response.errorCode = err.errorCode;
  }

  res.status(resolvedStatusCode).send(response);
};
