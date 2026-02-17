import bcrypt from "bcryptjs";
import userRepository from "../repositories/UserRepository.js";
import imageService from "./ImageService.js";
import otpService from "./OTPService.js";
import emailService from "./EmailService.js";
import { generateOTP } from "../utils/helpers.js";
import {
  NotFoundError,
  ValidationError,
} from "../errors/index.js";
import { OTP_EXPIRY_MS } from "../utils/constants.js";

class UserService {
  async updateProfile(userId, { fullName, profilePic }) {
    const user = await userRepository.findByIdSafe(userId);
    if (!user) throw new NotFoundError("User not found");

    const updateData = {};

    if (fullName) {
      updateData.fullName = fullName;
    }

    if (profilePic === "") {
      if (user.profilePic) {
        await imageService.delete(user.profilePic);
      }
      updateData.profilePic = "";
    } else if (profilePic) {
      const newUrl = await imageService.replaceImage(
        profilePic,
        user.profilePic
      );
      updateData.profilePic = newUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    return userRepository.updateById(userId, updateData);
  }

  async initiateEmailChange(userId, { newEmail, password }) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError("User not found");

    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new ValidationError("New email is the same as current email");
    }

    const existingUser = await userRepository.findByEmail(newEmail);
    if (existingUser) {
      throw new ValidationError("Email already in use");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid password");
    }

    const otp = generateOTP();

    await userRepository.updateById(userId, {
      pendingEmail: newEmail.toLowerCase(),
      pendingEmailOTP: otp,
      pendingEmailOTPExpires: new Date(Date.now() + OTP_EXPIRY_MS),
    });

    await emailService.sendEmailChangeOTP(newEmail, otp);

    return { newEmail };
  }

  async verifyEmailChange(userId, { otp }) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.pendingEmail || !user.pendingEmailOTP) {
      throw new ValidationError("No pending email change found");
    }

    if (new Date() > user.pendingEmailOTPExpires) {
      await userRepository.updateById(userId, {
        pendingEmail: null,
        pendingEmailOTP: null,
        pendingEmailOTPExpires: null,
      });
      throw new ValidationError("OTP has expired. Please request a new one.");
    }

    if (user.pendingEmailOTP !== otp) {
      throw new ValidationError("Invalid OTP");
    }

    const updatedUser = await userRepository.updateById(userId, {
      email: user.pendingEmail,
      pendingEmail: null,
      pendingEmailOTP: null,
      pendingEmailOTPExpires: null,
    });

    return updatedUser;
  }
}

export default new UserService();
