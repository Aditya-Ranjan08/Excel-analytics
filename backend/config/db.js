import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectDB() {
  const dbURI = (process.env.MONGO_URI || process.env.MONGODB_URL || "").trim();

  if (!dbURI) {
    throw new Error("MongoDB URI not found. Set MONGO_URI in the backend environment.");
  }
  if (!/^mongodb(?:\+srv)?:\/\//i.test(dbURI)) {
    throw new Error("Invalid MongoDB URI. MONGO_URI must be the full Atlas connection string starting with mongodb+srv:// (or mongodb:// for a standard server).");
  }

  await mongoose.connect(dbURI);
  console.log("Connected to MongoDB");
}
