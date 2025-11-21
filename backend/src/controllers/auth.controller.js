import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { addPendingSignup, getPendingSignup, removePendingSignup, hasPendingSignup, canResendOTP } from "../lib/pendingSignups.js";

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

    // Check if user already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // Check if there's already a pending signup for this email
    if (hasPendingSignup(email)) {
      return res.status(400).json({ message: "Signup already in progress. Please check your email for OTP or wait before trying again." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in pending signups (NOT in database yet)
    addPendingSignup(email, {
      fullName,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

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
      // Remove from pending signups since email failed
      removePendingSignup(email);
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
    // Check pending signups first
    const pendingUser = getPendingSignup(email);
    
    if (!pendingUser) {
      return res.status(400).json({ message: "No pending signup found for this email" });
    }

    if (pendingUser.otp !== otp || pendingUser.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create user in database NOW (after verification)
    const newUser = new User({
      fullName: pendingUser.fullName,
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true, // User is verified from the start
    });

    await newUser.save();
    
    // Remove from pending signups
    removePendingSignup(email);

    generateToken(newUser._id, res);

    res.status(200).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
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

    // Users in database are always verified now, so no need to check

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
    const { profilePic, fullName } = req.body;
    const userId = req.user._id;

    const updateData = {};

    // Handle fullName update
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({ message: "Full name cannot be empty" });
      }
      updateData.fullName = fullName.trim();
    }

    // Handle profile picture update
    if (profilePic !== undefined) {
      // Allow empty string to remove profile picture
      if (profilePic === "") {
        // Delete old Cloudinary image if exists
        try {
          const user = await User.findById(userId);
          if (user.profilePic && user.profilePic.includes('cloudinary.com')) {
            const urlParts = user.profilePic.split('/');
            const publicIdWithExtension = urlParts.slice(-2).join('/');
            const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
            await cloudinary.uploader.destroy(publicId);
            console.log('✅ Old profile picture deleted from Cloudinary');
          }
        } catch (deleteError) {
          console.error('⚠️ Error deleting old image:', deleteError.message);
          // Continue even if deletion fails
        }
        
        updateData.profilePic = "";
      } else {
        // Validate image type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const mimeMatch = profilePic.match(/^data:(image\/[a-z]+);base64,/);
        
        if (!mimeMatch) {
          return res.status(400).json({ 
            message: "Invalid image format. Please upload a valid image file." 
          });
        }

        const mimeType = mimeMatch[1];
        if (!validTypes.includes(mimeType)) {
          return res.status(400).json({ 
            message: "Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)" 
          });
        }

        // Validate file size (base64 size estimation)
        const base64Data = profilePic.split(',')[1];
        if (!base64Data) {
          return res.status(400).json({ message: "Invalid image data" });
        }

        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 5) {
          return res.status(400).json({ 
            message: `File too large (${sizeInMB.toFixed(2)}MB). Maximum size is 5MB` 
          });
        }

        try {
          // Delete old Cloudinary image before uploading new one
          const user = await User.findById(userId);
          if (user.profilePic && user.profilePic.includes('cloudinary.com')) {
            try {
              const urlParts = user.profilePic.split('/');
              const publicIdWithExtension = urlParts.slice(-2).join('/');
              const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
              await cloudinary.uploader.destroy(publicId);
              console.log('✅ Old profile picture deleted from Cloudinary');
            } catch (deleteError) {
              console.error('⚠️ Error deleting old image:', deleteError.message);
              // Continue with upload even if deletion fails
            }
          }

          // Upload with optimization
          const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: "ripple_profiles",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto:best" },
              { fetch_format: "auto" }
            ],
            resource_type: "image",
            allowed_formats: ['jpg', 'png', 'webp', 'gif']
          });
          
          updateData.profilePic = uploadResponse.secure_url;
          console.log('✅ Profile picture uploaded to Cloudinary successfully');
        } catch (uploadError) {
          console.error("❌ Cloudinary upload error:", uploadError);
          
          // Provide specific error messages
          if (uploadError.http_code === 413) {
            return res.status(400).json({ 
              message: "Image file is too large. Please use a smaller image." 
            });
          }
          
          if (uploadError.message?.includes('timeout')) {
            return res.status(408).json({ 
              message: "Upload timed out. Please check your connection and try again." 
            });
          }
          
          return res.status(500).json({ 
            message: `Failed to upload image: ${uploadError.message || 'Unknown error'}` 
          });
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("❌ Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check rate limiting
    const rateLimitCheck = canResendOTP(email);
    if (!rateLimitCheck.canResend) {
      return res.status(429).json({ 
        message: rateLimitCheck.reason,
        remainingSeconds: rateLimitCheck.remainingSeconds 
      });
    }

    // Check pending signups
    const pendingUser = getPendingSignup(email);
    
    if (!pendingUser) {
      return res.status(400).json({ message: "No pending signup found for this email" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUser.otp = otp;
    pendingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Update pending signup with new OTP and timestamp
    addPendingSignup(email, pendingUser);

    // Send OTP Email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email - New OTP",
        text: `Your new OTP is ${otp}. It expires in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ OTP resent successfully to:", email);
      res.status(200).json({ message: "OTP resent to your email" });
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError.message);
      return res.status(500).json({ 
        message: "Failed to send verification email. Please try again later." 
      });
    }
  } catch (error) {
    console.log("Error in resendOTP controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
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

export const initiateEmailChange = async (req, res) => {
  const { newEmail } = req.body;
  try {
    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const userId = req.user._id;
    const currentEmail = req.user.email;

    // Check if new email is the same as current email
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      return res.status(400).json({ message: "New email is the same as current email" });
    }

    // Check if new email is already in use by another user
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save pending email and OTP to database
    await User.findByIdAndUpdate(userId, {
      pendingEmail: newEmail,
      pendingEmailOTP: otp,
      pendingEmailOTPExpires: otpExpires,
    });

    // Send OTP Email to new email address
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newEmail,
        subject: "Verify your new email address",
        text: `Your OTP to verify your new email address is ${otp}. It expires in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email change OTP sent successfully to:", newEmail);
      res.status(200).json({ message: "OTP sent to your new email address" });
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError.message);
      // Clear pending fields since email failed
      await User.findByIdAndUpdate(userId, {
        pendingEmail: undefined,
        pendingEmailOTP: undefined,
        pendingEmailOTPExpires: undefined,
      });
      return res.status(500).json({ 
        message: "Failed to send verification email. Please check the email address or try again later." 
      });
    }
  } catch (error) {
    console.log("Error in initiateEmailChange controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmailChange = async (req, res) => {
  const { otp } = req.body;
  try {
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.pendingEmail) {
      return res.status(400).json({ message: "No pending email change found" });
    }

    if (user.pendingEmailOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.pendingEmailOTPExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Update email and clear pending fields in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email: user.pendingEmail,
        pendingEmail: undefined,
        pendingEmailOTP: undefined,
        pendingEmailOTPExpires: undefined,
      },
      { new: true }
    );

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.log("Error in verifyEmailChange controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
