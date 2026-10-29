import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import Upload from "../models/Upload.js";

export const uploadExcel = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path || path.resolve("uploads", req.file.filename);

    // Prevent duplicate uploads by filename for the same user
    try {
      const duplicate = await Upload.findOne({
        user: req.user?.id || null,
        filename: req.file.originalname,
      });
      if (duplicate) {
        // Remove the temp file saved by multer
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(409).json({ message: "File already exists" });
      }
    } catch (checkErr) {
      console.error("Duplicate check failed:", checkErr.message);
      // continue to attempt upload
    }

    // Read Excel and convert to JSON
    const workbook = xlsx.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return res.status(400).json({ message: "The Excel file has no worksheets" });
    }
    const sheet = workbook.Sheets[firstSheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    if (jsonData.length === 0) {
      return res.status(400).json({ message: "The first worksheet has no data rows. Add a header row and at least one data row, then try again." });
    }

    
    // Save to database with status = success
    const savedUpload = await Upload.create({
      user: req.user?.id || null,
      filename: req.file.originalname,
      parsedData: jsonData,
      status: "success",
    });

    return res.status(200).json({ 
      msg: "File uploaded and data parsed successfully",
      uploadId: savedUpload._id,
      data: jsonData,
    });

  } catch (err) {
    console.error("❌ Upload Error:", err.message);

    try {
      await Upload.create({
        user: req.user?.id,
        filename: req.file?.originalname || "unknown",
        parsedData: [],
        status: "fail", // Save as failed
      });
    } catch (dbErr) {
      console.error("❌ Failed to log upload failure:", dbErr.message);
    }

    return res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  } finally {
    const tempFilePath = req.file?.path;
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
};

// delete controller
export const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Upload.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: "Upload not found" });
    }

    res.status(200).json({ message: "Upload deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error.message);
    res.status(500).json({ message: "Failed to delete upload" });
  }
};

export const getUploadHistory = async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (err) {
    console.error("❌ Failed to get upload history:", err.message);
    res.status(500).json({ message: "Error fetching uploads" });
  }
};


