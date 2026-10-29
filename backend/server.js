import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import insightRoutes from "./routes/insightRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load to env bars
dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.disable("x-powered-by");

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);  /*route for signup/login*/


app.use("/api", uploadRoutes);  /*route for upload */

app.use("/api/admin", adminRoutes)
app.use("/api", insightRoutes);
app.use("/api", userRoutes);

app.use((_req, res) => res.status(404).json({ message: "API route not found" }));

app.use((error, _req, res, _next) => {
  console.error("Unhandled request error:", error.message);
  res.status(error.status || 500).json({ message: "The server couldn't complete this request." });
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  }
};

startServer();
