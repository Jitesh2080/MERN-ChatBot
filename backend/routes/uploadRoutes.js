// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // The destination folder
  },
  filename: function (req, file, cb) {
    // Keep the original filename
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// The POST endpoint for a single file upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // The file has been uploaded successfully
  res.status(200).json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    url: `http://localhost:5001/uploads/${req.file.filename}`, // The URL to access the file
  });
});

module.exports = router;
