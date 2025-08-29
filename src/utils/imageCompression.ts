/**
 * Image compression utility to automatically optimize images
 * Ensures images are compressed to target size while maintaining quality
 */

interface CompressionOptions {
  maxSizeBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export class ImageCompressor {
  private static readonly DEFAULT_OPTIONS: Required<CompressionOptions> = {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    format: 'jpeg'
  };

  /**
   * Compress an image file to meet size requirements
   */
  static async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // If file is already small enough and is an acceptable format, return as-is
    if (file.size <= opts.maxSizeBytes && this.isAcceptableFormat(file)) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            opts.maxWidth,
            opts.maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress the image
          ctx?.drawImage(img, 0, 0, width, height);

          // Try different quality levels to meet size requirement
          this.compressToTargetSize(canvas, opts, file.name)
            .then(resolve)
            .catch(reject);
        } catch (error) {
          reject(new Error(`Failed to process image: ${error}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress multiple images
   */
  static async compressImages(
    files: File[],
    options: CompressionOptions = {}
  ): Promise<File[]> {
    const compressionPromises = files.map(file => 
      this.compressImage(file, options)
    );
    
    return Promise.all(compressionPromises);
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if necessary
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Compress canvas to target file size using binary search approach
   */
  private static async compressToTargetSize(
    canvas: HTMLCanvasElement,
    options: Required<CompressionOptions>,
    originalFileName: string
  ): Promise<File> {
    let quality = options.quality;
    let minQuality = 0.1;
    let maxQuality = 1.0;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const blob = await this.canvasToBlob(canvas, options.format, quality);
      
      if (blob.size <= options.maxSizeBytes || quality <= minQuality) {
        // Success or reached minimum quality
        const fileName = this.generateFileName(originalFileName, options.format);
        return new File([blob], fileName, { 
          type: blob.type,
          lastModified: Date.now()
        });
      }

      // Binary search for optimal quality
      if (blob.size > options.maxSizeBytes) {
        maxQuality = quality;
        quality = (minQuality + quality) / 2;
      } else {
        minQuality = quality;
        quality = (quality + maxQuality) / 2;
      }

      attempts++;
    }

    // Fallback: return with minimum quality
    const blob = await this.canvasToBlob(canvas, options.format, minQuality);
    const fileName = this.generateFileName(originalFileName, options.format);
    return new File([blob], fileName, { 
      type: blob.type,
      lastModified: Date.now()
    });
  }

  /**
   * Convert canvas to blob with specified format and quality
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * Check if file format is acceptable
   */
  private static isAcceptableFormat(file: File): boolean {
    const acceptableTypes = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png'];
    return acceptableTypes.includes(file.type.toLowerCase());
  }

  /**
   * Generate appropriate filename with correct extension
   */
  private static generateFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const extension = format === 'jpeg' ? 'jpg' : format;
    return `${nameWithoutExt}_compressed.${extension}`;
  }

  /**
   * Get human-readable file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Quick compression function for common use cases
 */
export const compressImageToSize = async (
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024
): Promise<File> => {
  return ImageCompressor.compressImage(file, { maxSizeBytes });
};

/**
 * Compress multiple images with progress callback
 */
export const compressImagesWithProgress = async (
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<File[]> => {
  const results: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const compressedFile = await ImageCompressor.compressImage(files[i], options);
    results.push(compressedFile);
    
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  
  return results;
};
