const mongoose = require("mongoose");
const logger = require("../utils/logger");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const DbUri = process.env.NEPLANCE_MONGODB_URI;
    if (!DbUri) {
      throw new Error("NEPLANCE_MONGODB_URI is not defined");
    }
    logger.info("Connecting to database...");
    cached.promise = mongoose.connect(DbUri).then((mongoose) => {
      logger.info("Database connected successfully");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
