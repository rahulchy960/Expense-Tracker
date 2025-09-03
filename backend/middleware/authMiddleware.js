const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    // 1) Read token safely (case-insensitive "Bearer")
    const auth = req.headers.authorization || "";
    const parts = auth.split(" ");
    const hasBearer = parts[0]?.toLowerCase() === "bearer";
    const token = hasBearer ? parts[1] : null;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // 2) Verify token (sync verify is fine)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }

    // 3) Make sure DB is actually connected before we await
    // (If not connected, await may hang)
    if (
      !req.app.locals.mongoose ||
      (req.app.locals.mongoose.connection &&
        req.app.locals.mongoose.connection.readyState !== 1)
    ) {
      // Optional: only if you store mongoose on app.locals; otherwise skip this block
      return res.status(503).json({ message: "Database not connected" });
    }

    // 4) Fetch user with a safety timeout to detect hangs
    const userPromise = User.findById(decoded.id).select("-password").lean();
    const user = await Promise.race([
      userPromise,
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("User query timeout after 5s")), 5000)
      ),
    ]);

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // 5) Attach a minimal user object (avoid passing Mongoose doc around)
    req.user = { id: String(user._id), email: user.email, role: user.role };

    return next(); // <-- always return after sending next()
  } catch (err) {
    // If anything unexpected happens, ensure we respond (or pass to error handler)
    return res.status(500).json({ message: "Auth middleware error" });
  }
};
