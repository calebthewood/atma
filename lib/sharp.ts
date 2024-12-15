/* Sharp Utils for resizing images prior to upload.
Not related to NextJS build step which uses sharp to
resize images */

/**
 * Utility functions for resizing images in the browser before upload
 */
export const imageProcessor = {
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  calculateNewDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth = 1920,
    maxHeight = 1080
  ) {
    // Determine if image is portrait or landscape
    const isPortrait = originalHeight > originalWidth;

    // For portrait images, swap maxWidth and maxHeight
    if (isPortrait) {
      [maxWidth, maxHeight] = [maxHeight, maxWidth];
    }

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Calculate scale ratios
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;

    // Use the smaller ratio to ensure both dimensions fit within bounds
    const ratio = Math.min(widthRatio, heightRatio);

    // Only scale down, never up
    if (ratio < 1) {
      newWidth = Math.floor(originalWidth * ratio);
      newHeight = Math.floor(originalHeight * ratio);
    }

    return { width: newWidth, height: newHeight };
  },

  /**
   * Resizes an image file to target size while maintaining aspect ratio
   * Returns null if image is already smaller than target size
   */
  async resizeImage(
    file: File,
    maxSizeInMB: number = 0.9, // Target size in MB
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8
  ): Promise<File | null> {
    // If file is already smaller than target size, return null
    if (file.size <= maxSizeInMB * 1024 * 1024) {
      return null;
    }

    // Create canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Load image
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

    // Calculate new dimensions
    const { width: newWidth, height: newHeight } = this.calculateNewDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight
    );

    // Set canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Convert to blob with quality setting
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob!);
        },
        file.type,
        quality
      );
    });

    // If still too large, recursively resize with lower quality
    if (blob.size > maxSizeInMB * 1024 * 1024 && quality > 0.1) {
      return this.resizeImage(
        new File([blob], file.name, { type: file.type }),
        maxSizeInMB,
        maxWidth,
        maxHeight,
        quality - 0.1
      );
    }

    return new File([blob], file.name, { type: file.type });
  },

  /**
   * Processes multiple images with a loading indicator
   */
  async processImages(
    files: File[],
    onProgress?: (_progress: number) => void
  ): Promise<File[]> {
    const processedFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const resized = await this.resizeImage(files[i]);
      processedFiles.push(resized || files[i]);
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100);
      }
    }

    return processedFiles;
  },
};
