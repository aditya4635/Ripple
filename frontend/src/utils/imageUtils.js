import {
  VALID_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from "../config/constants.js";

export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: "No file selected" };

  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File too large (${sizeInMB}MB). Maximum size is ${MAX_IMAGE_SIZE_MB}MB`,
    };
  }

  return { valid: true, error: null };
};

export const compressImage = async (file, maxSizeMB = 1) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let base64 = canvas.toDataURL(file.type || "image/jpeg", quality);

        const targetSize = maxSizeMB * 1024 * 1024;
        while (base64.length > targetSize && quality > 0.5) {
          quality -= 0.1;
          base64 = canvas.toDataURL(file.type || "image/jpeg", quality);
        }

        resolve(base64);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const getAvatarUrl = (user) => {
  if (user?.profilePic && user.profilePic !== "") {
    return user.profilePic;
  }

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52B788",
  ];

  const colorIndex = (user?.fullName?.charCodeAt(0) || 0) % colors.length;
  const bgColor = colors[colorIndex];

  const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="800" fill="${bgColor}"/><text x="400" y="400" font-size="320" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="bold">${initials}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
