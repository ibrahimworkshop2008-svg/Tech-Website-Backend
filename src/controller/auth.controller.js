const config = require("../config/config");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const utilsModel = require("../model/OTP.model");
const sendEmail = require("../service/email");
const utils = require("../Utils/utils");
const crypto = require("crypto");

// Register Api 

const register = async (req, res) => {
  try {
    const { name, email, password} = req.body;
    const allowedRole = "user"

    const existingUser = await User.findOne({
      $or: [{ name }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: allowedRole,
    });

    const otp = utils.otpGenerate();
    const html = utils.sendOTPEmail(otp);

    const otpHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    await utilsModel.create({
      email,
      user: user._id,
      otpHash,
    });

    try {
      await sendEmail(email, "OTP Verified", `Your OTP code is ${otp}`, html);
    } catch (emailErr) {
      console.log(
        "Email fail hui, lekin user create ho chuka hai:",
        emailErr.message,
      );
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Verification of email using OTP

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email && !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        
      });
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(String(otp).trim())
      .digest("hex");

    const otpRecord = await utilsModel.findOne({
      $or: [{ email }, { otpHash }],
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const user = await User.findById(otpRecord.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.verified = true;
    await user.save();

    await utilsModel.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
        success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// login Functionality 


const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "User not Found Please Create Account." });
  }

  if (!user.verified) {
    return res
      .status(401)
      .json({ success: false, message: "Please Verify Your Account." });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const isMatch = hashedPassword === user.password;
  console.log("Is Match:", isMatch);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid Credentials" });
  }

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );

  return res.status(200).json({
    success: true,
    message: "Login Successful",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
    },
  });
};

// admin create 

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ name }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      verified: true,
    });

    return res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.log("CREATE ADMIN ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// logout functionality 


const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      // DB se us user ka refreshTokenHash saaf kar dein jiska ye hash match kare
      await User.findOneAndUpdate(
        { refreshTokenHash },
        { refreshTokenHash: null },
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("LOGOUT ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// refreshtoken functionality

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    // Step 1: JWT verify karein (signature + expiry check)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token." });
    }

    // Step 2: DB mein us user ka saved hash nikal kar match karein
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findById(decoded.id).select("+refreshTokenHash");

    if (!user || user.refreshTokenHash !== refreshTokenHash) {
      return res
        .status(403)
        .json({ message: "Refresh token revoked. Please login again." });
    }

    // Step 3: Sab theek — naya access token bana kar bhej dein
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log("REFRESH TOKEN ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// getProfile functionality 


const getProfile = async (req, res) => {
  try {
    // req.user verifyToken middleware se aata hai (decoded JWT: { id, role })
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("GET PROFILE ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports = {
  register,
  verifyEmail,
  login,
  createAdmin,
  logout,
  refreshAccessToken,
  getProfile

};
