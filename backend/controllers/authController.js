import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sgMail from "@sendgrid/mail";
import crypto from "crypto";


// signup 
export const signup = async (req, res) => {
  
  try {
    const { name, email, password, role  } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const trimmedEmail = email.trim().toLowerCase(); 
    const existing = await User.findOne({ email: trimmedEmail });

    if (existing) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: trimmedEmail,
      password,
      role,
    });


   //  Generate token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );


    return res.status(201).json({
      msg: 'User registered successfully',
      token,
      data: {
      role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// login 
export const login = async (req, res) => {
  try {
    const { email, password} = req.body;
   const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email/password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
      //  console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email/password' });
    }

     user.lastLogin = new Date(); // ⏱️ save login time
      // console.log("Saving lastLogin for user:", user.email); 
     await user.save();


     //  Generate token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Enter the email address for your account." });

    const frontendUrl = (process.env.CLIENT_URL || process.env.FRONTEND_URL || "").replace(/\/$/, "");
    if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL || !frontendUrl) {
      return res.status(503).json({ message: "Password reset email is not configured. Please contact support." });
    }

    const user = await User.findOne({ email });
    // Always return the same response so callers cannot discover registered email addresses.
    if (!user) {
      return res.status(200).json({ message: "If an account exists for that email, a reset link will arrive shortly." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const resetURL = `${frontendUrl}/reset-password/${token}`;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: "Password Reset Request",
      text: `Use this link to reset your password. The link expires in 15 minutes: ${resetURL}`,
      html: `<p>We received a request to reset your password.</p><p><a href="${resetURL}">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>`,
    };

    await sgMail.send(msg);
    return res.status(200).json({ message: "If an account exists for that email, a reset link will arrive shortly." });
  } catch (err) {
    console.error("Password reset email failed:", err.message);
    return res.status(502).json({ message: "We couldn't send the reset email. Please try again shortly." });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const tokenHash = crypto.createHash("sha256").update(req.params.token || "").digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired." });
    return res.status(200).json({ message: "Reset link is valid." });
  } catch (err) {
    console.error("Reset token validation failed:", err.message);
    return res.status(500).json({ message: "We couldn't verify this reset link." });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    const tokenHash = crypto.createHash("sha256").update(token || "").digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

   
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ message: "Password updated. You can now log in with your new password." });
  } catch (err) {
    console.error("Password reset failed:", err.message);
    return res.status(500).json({ message: "We couldn't update your password. Please try again." });
  }
};
