import express from "express";
import authController from "../controllers/AuthController.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import {
  validateSignupInput,
  validateLoginInput,
  validateOTPInput,
  validateGoogleLoginInput,
  validateResendOTPInput,
} from "../validators/authValidators.js";

const router = express.Router();

router.post(
  "/signup",
  rateLimiter({ windowMs: 60000, maxRequests: 5 }),
  validate(validateSignupInput),
  authController.signup
);

router.post(
  "/verify-email",
  validate(validateOTPInput),
  authController.verifyEmail
);

router.post(
  "/resend-otp",
  rateLimiter({ windowMs: 60000, maxRequests: 3, message: "Too many OTP requests" }),
  validate(validateResendOTPInput),
  authController.resendOTP
);

router.post(
  "/google",
  validate(validateGoogleLoginInput),
  authController.googleLogin
);

router.post(
  "/login",
  rateLimiter({ windowMs: 60000, maxRequests: 10 }),
  validate(validateLoginInput),
  authController.login
);

router.post("/logout", authController.logout);

router.get("/check", authenticate, authController.checkAuth);

export default router;
