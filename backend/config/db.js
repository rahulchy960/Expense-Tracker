const mongoose = require("mongoose");

const connctDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {});
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("Error connecting to mongodb", err);
        process.exit(1);
    }
};

module.exports = connctDB;