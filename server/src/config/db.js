import mongoose from "mongoose";
import config from "./config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo_uri);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};


