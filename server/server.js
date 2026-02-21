const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const AppError = require("./src/utils/appError");

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const DbUri = process.env.NEPLANCE_MONGODB_URI;
    cached.promise = mongoose.connect(DbUri).then((m) => {
      console.log("DB connected");
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

const frontendUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", frontendUrl],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

const indexRouter = require("./src/routes/indexRoute");
const jobRouter = require("./src/routes/jobRoutes");
const authRouter = require("./src/routes/authRoute");
const proposalRouter = require("./src/routes/proposalRoutes");
const userRouter = require("./src/routes/userRoutes");
const errorController = require("./src/controllers/errorController");

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/proposals", proposalRouter);
app.use("/api/users", userRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState });
});

app.all("*", (req, res, next) => {
  next(new AppError(`No route found for ${req.url}`, 404));
});

app.use(errorController);

const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
