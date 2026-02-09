const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const DbUri = process.env.DB_URL;
        await mongoose.connect(DbUri);
        console.log("Sucessfully connected to Neplance Database");
    } catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1);
    }
};

module.exports = connectDB;
