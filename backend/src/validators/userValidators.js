import {
  VALID_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
} from "../utils/constants.js";

export const validateProfileUpdate = ({ fullName, profilePic }) => {
  const errors = [];

  if (fullName !== undefined && !fullName.trim()) {
    errors.push("Full name cannot be empty");
  }

  if (profilePic !== undefined && profilePic !== "") {
    const mimeMatch = profilePic.match(/^data:(image\/[a-z]+);base64,/);
    if (!mimeMatch) {
      errors.push("Invalid image format. Please upload a valid image file.");
    } else if (!VALID_IMAGE_TYPES.includes(mimeMatch[1])) {
      errors.push("Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)");
    }
  }

  return { isValid: errors.length === 0, errors };
};
