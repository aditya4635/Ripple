// In-memory store for pending user signups (before email verification)
const pendingSignups = new Map();

// Cleanup expired signups every 15 minutes
const CLEANUP_INTERVAL = 15 * 60 * 1000;
const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingSignups.entries()) {
    if (data.otpExpires < now) {
      pendingSignups.delete(email);
      console.log(`🗑️  Cleaned up expired signup for: ${email}`);
    }
  }
}, CLEANUP_INTERVAL);

export const addPendingSignup = (email, data) => {
  // Add timestamp for when OTP was sent
  const signupData = {
    ...data,
    lastOtpSentAt: Date.now(),
  };
  pendingSignups.set(email, signupData);
  console.log(`📝 Added pending signup for: ${email}`);
};

export const getPendingSignup = (email) => {
  return pendingSignups.get(email);
};

export const removePendingSignup = (email) => {
  pendingSignups.delete(email);
  console.log(`✅ Removed pending signup for: ${email}`);
};

export const hasPendingSignup = (email) => {
  return pendingSignups.has(email);
};

export const canResendOTP = (email) => {
  const pendingUser = pendingSignups.get(email);
  if (!pendingUser) return { canResend: false, reason: "No pending signup found" };
  
  const RESEND_COOLDOWN = 60 * 1000; // 60 seconds
  const timeSinceLastOtp = Date.now() - pendingUser.lastOtpSentAt;
  
  if (timeSinceLastOtp < RESEND_COOLDOWN) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN - timeSinceLastOtp) / 1000);
    return { 
      canResend: false, 
      reason: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
      remainingSeconds 
    };
  }
  
  return { canResend: true };
};
