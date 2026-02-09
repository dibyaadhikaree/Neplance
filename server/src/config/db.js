const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        const DbUri = process.env.DB_URL;
        await mongoose.connect(DbUri);
        logger.info("Successfully connected to the Neplance database.");
    } catch (error) {
        logger.error("Failed to connect to the Neplance database.", error);
        process.exit(1);
    }
};

module.exports = connectDB;
