import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PASSWORD_MIN_LENGTH,
} from "../utils/constants.js";

export const validateSignupInput = ({ fullName, email, password }) => {
  const errors = [];

  if (!fullName?.trim()) errors.push("Full name is required");
  if (!email?.trim()) errors.push("Email is required");
  else if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format");

  if (!password) errors.push("Password is required");
  else if (password.length < PASSWORD_MIN_LENGTH)
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  else if (!PASSWORD_REGEX.test(password))
    errors.push(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );

  return { isValid: errors.length === 0, errors };
};

export const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email?.trim()) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  return { isValid: errors.length === 0, errors };
};

export const validateOTPInput = ({ email, otp }) => {
  const errors = [];

  if (!email?.trim()) errors.push("Email is required");
  if (!otp?.trim()) errors.push("OTP is required");
  else if (otp.length !== 6) errors.push("OTP must be 6 digits");

  return { isValid: errors.length === 0, errors };
};

export const validateGoogleLoginInput = ({ token }) => {
  const errors = [];

  if (!token?.trim()) errors.push("Google token is required");

  return { isValid: errors.length === 0, errors };
};

export const validateEmailChangeInput = ({ newEmail }) => {
  const errors = [];

  if (!newEmail?.trim()) errors.push("New email is required");
  else if (!EMAIL_REGEX.test(newEmail)) errors.push("Invalid email format");

  return { isValid: errors.length === 0, errors };
};

export const validateResendOTPInput = ({ email }) => {
  const errors = [];

  if (!email?.trim()) errors.push("Email is required");

  return { isValid: errors.length === 0, errors };
};
