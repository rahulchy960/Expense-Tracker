const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "6h"});
}

exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;
    
    // Validation: check for missing fields
    if( !fullName || !email || !password ) {
        return res.status(400).json({ message: "All fields are required"});
    } 

    try {
        // check if email already exists
        const existingUser = await User.findOne({ email });
        if( existingUser ) {
            return res.status(400).json({ message: "Email already in Use" });
        }

        // create new User
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });
        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error registering user", error: err.message });
    }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    // If you ever set select:false on password later, this line still works.
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // bcrypt.compare returns a Promise → await it
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // Always send a safe POJO (avoid sending the mongoose doc directly)
    const safeUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      user: safeUser,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("loginUser error:", err);
    return res
      .status(500)
      .json({ message: "Error: Something went wrong", error: err.message });
  }
};

exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user) {
            return res.status(404).json({ message: "User not found"});
        }

        res.status(200).json(user);
    } catch (err) {
        return res
          .status(500)
          .json({ message: "Error: Something went wrong", error: err.message });
    }

};
