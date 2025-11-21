import express from "express";
import { checkAuth, login, logout, signup, updateProfile, verifyEmail, googleLogin, resendOTP, initiateEmailChange, verifyEmailChange } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/google", googleLogin);

router.put("/update-profile", protectRoute, updateProfile);
router.post("/initiate-email-change", protectRoute, initiateEmailChange);
router.post("/verify-email-change", protectRoute, verifyEmailChange);

router.get("/check", protectRoute, checkAuth);

export default router;
