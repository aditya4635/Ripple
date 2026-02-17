import { generateOTP } from "../utils/helpers.js";
import {
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_MS,
  PENDING_SIGNUP_CLEANUP_INTERVAL_MS,
} from "../utils/constants.js";
import { RateLimitError, ValidationError } from "../errors/index.js";
import logger from "../utils/logger.js";

class OTPService {
  constructor() {
    this.pendingSignups = new Map();
    this._startCleanup();
  }

  createPendingSignup(userData) {
    const otp = generateOTP();
    const entry = {
      ...userData,
      otp,
      otpExpiresAt: Date.now() + OTP_EXPIRY_MS,
      lastOTPSentAt: Date.now(),
    };
    this.pendingSignups.set(userData.email.toLowerCase(), entry);
    return otp;
  }

  getPendingSignup(email) {
    return this.pendingSignups.get(email.toLowerCase());
  }

  removePendingSignup(email) {
    this.pendingSignups.delete(email.toLowerCase());
  }

  hasPendingSignup(email) {
    return this.pendingSignups.has(email.toLowerCase());
  }

  verifyOTP(email, otp) {
    const entry = this.getPendingSignup(email);

    if (!entry) {
      throw new ValidationError(
        "No pending verification found. Please sign up again."
      );
    }

    if (Date.now() > entry.otpExpiresAt) {
      this.removePendingSignup(email);
      throw new ValidationError("OTP has expired. Please request a new one.");
    }

    if (entry.otp !== otp) {
      throw new ValidationError("Invalid OTP. Please try again.");
    }

    return entry;
  }

  regenerateOTP(email) {
    const entry = this.getPendingSignup(email);

    if (!entry) {
      throw new ValidationError(
        "No pending verification found. Please sign up again."
      );
    }

    const timeSinceLastOTP = Date.now() - entry.lastOTPSentAt;
    if (timeSinceLastOTP < OTP_RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - timeSinceLastOTP) / 1000
      );
      throw new RateLimitError(
        `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
        remainingSeconds
      );
    }

    const newOTP = generateOTP();
    entry.otp = newOTP;
    entry.otpExpiresAt = Date.now() + OTP_EXPIRY_MS;
    entry.lastOTPSentAt = Date.now();

    return newOTP;
  }

  _startCleanup() {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      for (const [email, entry] of this.pendingSignups.entries()) {
        if (now > entry.otpExpiresAt + OTP_EXPIRY_MS) {
          this.pendingSignups.delete(email);
          cleaned++;
        }
      }
      if (cleaned > 0) {
        logger.debug(`Cleaned ${cleaned} expired pending signups`);
      }
    }, PENDING_SIGNUP_CLEANUP_INTERVAL_MS);
  }
}

export default new OTPService();
