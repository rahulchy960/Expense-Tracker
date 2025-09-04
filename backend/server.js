require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON body
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/income", incomeRoutes);

app.use("/api/v1/expense", expenseRoutes);

// Multer/file-type errors as JSON
app.use((err, req, res, next) => {
  if (err?.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }
  if (err?.message && /Only .* allowed/i.test(err.message)) {
    return res.status(400).json({ message: err.message });
  }
  return next(err);
});

// Fallback JSON error handler (prevents hanging on thrown errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err?.status || 500;
  const message = err?.message || "Server Error";
  return res.status(status).json({ message });
});

(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 8000; // ← default to 8000 per your setup
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (e) {
    console.error("DB connection failed:", e);
    process.exit(1);
  }
})();
