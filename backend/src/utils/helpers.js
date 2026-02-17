import { OTP_LENGTH } from "./constants.js";

export const generateOTP = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

export const extractCloudinaryPublicId = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  const urlParts = url.split("/");
  const publicIdWithExtension = urlParts.slice(-2).join("/");
  return publicIdWithExtension.substring(
    0,
    publicIdWithExtension.lastIndexOf(".")
  );
};

export const estimateBase64SizeInMB = (base64String) => {
  const base64Data = base64String.split(",")[1];
  if (!base64Data) return 0;
  return (base64Data.length * 3) / 4 / (1024 * 1024);
};

export const extractMimeType = (base64String) => {
  const match = base64String.match(/^data:(image\/[a-z]+);base64,/);
  return match ? match[1] : null;
};
