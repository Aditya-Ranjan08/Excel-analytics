import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { uploadExcel, deleteUpload,} from "../controllers/uploadController.js";
import { getUploadHistory } from "../controllers/uploadHistoryController.js";
import { protect } from "../middleware/authMiddleware.js";




const router = express.Router();
const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (/\.xlsx?$/i.test(file.originalname)) return callback(null, true);
    callback(new Error("Only .xlsx and .xls files are supported"));
  },
});

const receiveExcel = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (!error) return next();
    const status = error instanceof multer.MulterError ? 400 : 415;
    return res.status(status).json({
      message: error.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 20 MB."
        : error.message,
    });
  });
};

router.post("/upload", protect, receiveExcel, uploadExcel);
router.get("/upload/history", protect, getUploadHistory);

router.delete("/upload/:id", protect, deleteUpload);

export default router;
