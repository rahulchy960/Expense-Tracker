const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Always use a consistent folder: "uploads" at the project root
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Create the folder if it doesn't exist
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
console.log("Saving uploads to:", UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Safer filename (unique + keep extension)
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  cb(allowed.includes(file.mimetype) ? null : new Error("Only JPEG/JPG/PNG/WEBP allowed"), allowed.includes(file.mimetype));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
