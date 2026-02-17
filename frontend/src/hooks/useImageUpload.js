import { useState, useCallback } from "react";
import { validateImageFile, compressImage } from "../utils/imageUtils.js";
import toast from "react-hot-toast";

export function useImageUpload({ maxSizeMB = 1, onSuccess } = {}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(
    async (file) => {
      const { valid, error } = validateImageFile(file);
      if (!valid) {
        toast.error(error);
        return null;
      }

      setIsProcessing(true);
      try {
        const base64 = await compressImage(file, maxSizeMB);
        setImagePreview(base64);
        onSuccess?.(base64);
        return base64;
      } catch {
        toast.error("Failed to process image");
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [maxSizeMB, onSuccess]
  );

  const clearImage = useCallback(() => {
    setImagePreview(null);
  }, []);

  return {
    imagePreview,
    isProcessing,
    processImage,
    clearImage,
    setImagePreview,
  };
}
