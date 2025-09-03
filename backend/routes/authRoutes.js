const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { registerUser, loginUser, getUserInfo } = require("../controllers/authController");

const router = express.Router();

router.get("/ping", (req, res) => res.json({ ok: true }));

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

// POST /api/v1/auth/upload-image  (form-data key MUST be "image")
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.status(200).json({ imageUrl });
});

// Optional: friendly error for wrong method
router.all("/upload-image", (req, res) =>
  res.status(405).json({ message: "Use POST with form-data (key: image)" })
);

module.exports = router;
