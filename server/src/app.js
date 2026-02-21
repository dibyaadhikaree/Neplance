var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const frontendUrl = process.env.FRONTEND_BASE_URL || process.env.VERCEL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

var app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", frontendUrl],
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

//Setting Up the Routers
const indexRouter = require("./routes/indexRoute");
const jobRouter = require("./routes/jobRoutes");
const authRouter = require("./routes/authRoute");
const proposalRouter = require("./routes/proposalRoutes");
const userRouter = require("./routes/userRoutes");
const errorController = require("./controllers/errorController");

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/proposals", proposalRouter);
app.use("/api/users", userRouter);

//for catching all the errors
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `No route found for ${req.url}`,
  });
});

app.use(errorController);

module.exports = app;
