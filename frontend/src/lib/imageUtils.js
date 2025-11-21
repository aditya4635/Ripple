/**
 * Image utility functions for client-side validation and compression
 */

/**
 * Validates image file type and size
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateImageFile = (file) => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)' 
    };
  }

  // Check file size (5MB max)
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      error: `File too large (${sizeInMB}MB). Maximum size is 5MB` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Compresses an image file using Canvas API and converts to base64
 * This is a simple compression that doesn't require external libraries
 * @param {File} file - The image file to compress
 * @param {number} maxSizeMB - Maximum size in MB (default: 1MB)
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
export const compressImage = async (file, maxSizeMB = 1) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 1920px)
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
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with quality adjustment
        // Start with 0.9 quality and reduce if needed
        let quality = 0.9;
        let base64 = canvas.toDataURL(file.type || 'image/jpeg', quality);
        
        // If still too large, reduce quality
        const targetSize = maxSizeMB * 1024 * 1024;
        while (base64.length > targetSize && quality > 0.5) {
          quality -= 0.1;
          base64 = canvas.toDataURL(file.type || 'image/jpeg', quality);
        }
        
        resolve(base64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Gets image dimensions from a file
 * @param {File} file - The image file
 * @returns {Promise<Object>} - { width: number, height: number }
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Converts file to base64 without compression
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded image
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};
