import User from "../models/User.js";
import Upload from "../models/Upload.js";
import jwt from "jsonwebtoken";

// GET /api/user/me
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role createdAt lastLogin");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/user  (name, email, password?)
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Name and email are required." });
    }
    if (name.trim().length > 100) return res.status(400).json({ message: "Name must be 100 characters or less." });
    if (password && (typeof password !== "string" || password.length < 8)) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (normalizedEmail !== user.email) {
      const exists = await User.findOne({ email: normalizedEmail });
      if (exists && String(exists._id) !== String(user._id)) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = normalizedEmail;
    }
    if (name) user.name = name;
    if (password) {
      user.password = password; // will be hashed by pre-save hook
    }

    await user.save();
    const updatedUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(updatedUser, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Profile updated", user: updatedUser, token });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/user
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await Upload.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account and data deleted" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
