import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();

    // Send OTP Email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ OTP email sent successfully to:", email);
      res.status(201).json({ message: "OTP sent to your email", email });
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError.message);
      // Delete the user since email failed
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({ 
        message: "Failed to send verification email. Please check your email address or try again later." 
      });
    }

  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in verifyEmail controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const { name, email, picture } = response.data;

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        fullName: name,
        email,
        password: hashedPassword,
        profilePic: picture, // Save Google profile picture
        isVerified: true,
      });
      await user.save();
    } else {
      // Update existing user's profile picture if they don't have one
      if (!user.profilePic && picture) {
        user.profilePic = picture;
        await user.save();
      }
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in googleLogin controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (!user.isVerified) {
       // Resend OTP if not verified
       const otp = Math.floor(100000 + Math.random() * 900000).toString();
       user.otp = otp;
       user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
       await user.save();

       try {
         const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify your email",
          text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        };
    
        await transporter.sendMail(mailOptions);
        console.log("✅ OTP email resent successfully to:", email);
        return res.status(400).json({ message: "Email not verified. OTP resent.", isVerified: false, email });
       } catch (emailError) {
         console.error("❌ Error sending email:", emailError.message);
         return res.status(500).json({ 
           message: "Failed to send verification email. Please try again later." 
         });
       }
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    // Allow empty string to remove profile picture
    if (profilePic === "") {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: "" },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    }

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
