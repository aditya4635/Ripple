import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PASSWORD_MIN_LENGTH,
} from "../config/constants.js";

export function validateSignupForm({ fullName, email, password }) {
  if (!fullName?.trim()) return "Full name is required";
  if (!email?.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (!PASSWORD_REGEX.test(password))
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)";
  return null;
}

export function validateLoginForm({ email, password }) {
  if (!email?.trim()) return "Email is required";
  if (!password) return "Password is required";
  return null;
}

export function validateEmail(email) {
  if (!email?.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
  return null;
}
