const mongoose = require("mongoose");

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
    cached.promise = mongoose.connect(DbUri).then((mongoose) => {
      console.log("DB connected");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
