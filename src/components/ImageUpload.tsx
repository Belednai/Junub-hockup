import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ImagePlus, X, Upload, Loader2 } from 'lucide-react';
import { compressImagesWithProgress, ImageCompressor } from '@/utils/imageCompression';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 2,
  disabled = false
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ completed: 0, total: 0 });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || isCompressing) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];

    // Validate files
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive"
        });
        continue;
      }

      // Remove the size limit check since we'll compress automatically
      validFiles.push(file);
    }

    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      });
      
      // Take only the files that fit within the limit
      const remainingSlots = maxImages - images.length;
      validFiles.splice(remainingSlots);
    }

    if (validFiles.length > 0) {
      setIsCompressing(true);
      setCompressionProgress({ completed: 0, total: validFiles.length });

      try {
        // Show initial toast for compression
        toast({
          title: "Processing images",
          description: "Optimizing images for upload...",
        });

        // Compress images with progress tracking
        const compressedFiles = await compressImagesWithProgress(
          validFiles,
          {
            maxSizeBytes: 5 * 1024 * 1024, // 5MB target
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.8,
            format: 'jpeg'
          },
          (completed, total) => {
            setCompressionProgress({ completed, total });
          }
        );

        // Calculate compression savings
        const originalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
        const compressedSize = compressedFiles.reduce((sum, file) => sum + file.size, 0);
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

        // Show success message with compression details
        toast({
          title: "Images optimized successfully",
          description: `${compressedFiles.length} image(s) processed. Saved ${savings}% space (${ImageCompressor.formatFileSize(originalSize - compressedSize)})`,
        });

        onImagesChange([...images, ...compressedFiles]);
      } catch (error) {
        console.error('Error compressing images:', error);
        toast({
          title: "Compression failed",
          description: "Failed to optimize images. Please try again or use smaller images.",
          variant: "destructive"
        });
      } finally {
        setIsCompressing(false);
        setCompressionProgress({ completed: 0, total: 0 });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isCompressing ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled || isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={isCompressing ? undefined : openFileDialog}
      >
        <div className="p-6 text-center">
          {isCompressing ? (
            <>
              <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground mb-1">
                Optimizing images...
              </p>
              <p className="text-xs text-muted-foreground">
                Processing {compressionProgress.completed}/{compressionProgress.total} images
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum {maxImages} images • Auto-optimized to 5MB
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {images.length}/{maxImages} images selected
              </p>
            </>
          )}
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled}
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {!disabled && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          ))}
          
          {/* Add more button if under limit */}
          {images.length < maxImages && !disabled && !isCompressing && (
            <Card
              className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer transition-colors"
              onClick={openFileDialog}
            >
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center">
                  <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Add Image</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
