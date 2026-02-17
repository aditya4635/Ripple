import bcrypt from "bcryptjs";
import userRepository from "../repositories/UserRepository.js";
import tokenService from "./TokenService.js";
import otpService from "./OTPService.js";
import emailService from "./EmailService.js";
import googleAuthService from "./GoogleAuthService.js";
import {
  AuthenticationError,
  ValidationError,
} from "../errors/index.js";

class AuthService {
  async initiateSignup({ fullName, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = otpService.createPendingSignup({
      fullName,
      email,
      password: hashedPassword,
    });

    await emailService.sendOTP(email, otp);

    return { email };
  }

  async verifyEmail({ email, otp }, res) {
    const pendingData = otpService.verifyOTP(email, otp);

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      otpService.removePendingSignup(email);
      throw new ValidationError("Email already exists");
    }

    const user = await userRepository.create({
      fullName: pendingData.fullName,
      email: pendingData.email,
      password: pendingData.password,
      isVerified: true,
    });

    otpService.removePendingSignup(email);
    tokenService.setTokenCookie(res, user._id);

    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    };
  }

  async resendOTP({ email }) {
    const newOTP = otpService.regenerateOTP(email);
    await emailService.sendOTP(email, newOTP);
    return { email };
  }

  async login({ email, password }, res) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    tokenService.setTokenCookie(res, user._id);

    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    };
  }

  async googleLogin({ token }, res) {
    const googleUser = await googleAuthService.verifyToken(token);

    let user = await userRepository.findByEmail(googleUser.email);

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8) + "A1!a",
        salt
      );

      user = await userRepository.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        password: randomPassword,
        profilePic: googleUser.profilePic,
        isVerified: true,
      });
    }

    tokenService.setTokenCookie(res, user._id);

    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    };
  }

  logout(res) {
    tokenService.clearTokenCookie(res);
  }

  formatUserResponse(user) {
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
