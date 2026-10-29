import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectDB() {
  const dbURI = process.env.MONGO_URI || process.env.MONGODB_URL;

  if (!dbURI) {
    throw new Error("MongoDB URI not found. Set MONGO_URI in the backend environment.");
  }

  await mongoose.connect(dbURI);
  console.log("Connected to MongoDB");
}
