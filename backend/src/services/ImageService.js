import cloudinary from "../config/cloudinary.js";
import logger from "../utils/logger.js";
import { extractCloudinaryPublicId } from "../utils/helpers.js";
import { CLOUDINARY_PROFILE_FOLDER } from "../utils/constants.js";

class ImageService {
  async upload(base64Image, folder = CLOUDINARY_PROFILE_FOLDER) {
    try {
      const result = await cloudinary.uploader.upload(base64Image, {
        folder,
        resource_type: "image",
      });
      return result.secure_url;
    } catch (error) {
      logger.error("Failed to upload image to Cloudinary", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  }

  async delete(imageUrl) {
    const publicId = extractCloudinaryPublicId(imageUrl);
    if (!publicId) return;

    try {
      await cloudinary.uploader.destroy(publicId);
      logger.debug(`Deleted Cloudinary image: ${publicId}`);
    } catch (error) {
      logger.warn(`Failed to delete Cloudinary image: ${publicId}`, {
        error: error.message,
      });
    }
  }

  async replaceImage(newBase64Image, oldImageUrl, folder) {
    if (oldImageUrl) {
      await this.delete(oldImageUrl);
    }
    return this.upload(newBase64Image, folder);
  }
}

export default new ImageService();
