"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  deleteImage,
  fetchImages,
  RecordType,
  updateImageDescription,
  updateImageOrder,
  uploadImage,
} from "@/actions/image-actions";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { X } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { imageProcessor } from "@/lib/sharp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface ImageData {
  id: string;
  filePath: string;
  desc: string | null;
  order: number;
}

interface ImageManagementProps {
  recordId: string;
  recordType: RecordType;
}
function useImages(recordId: string, recordType: RecordType) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadImages = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedImages = await fetchImages(recordId, recordType);
      setImages(fetchedImages.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [recordId, recordType]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return {
    images,
    setImages,
    isLoading,
    // Only use refreshImages when we actually need a fresh fetch
    refreshImages: loadImages,
  };
}

// Modified ImageUpload component to accept onUploadComplete callback
function ModifiedImageUpload({
  recordId,
  recordType,
  onUploadComplete,
}: ImageManagementProps & {
  onUploadComplete: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processAndUploadFiles = async (files: File[]) => {
    try {
      setUploading(true);
      setProgress(0);

      // Previous upload logic remains the same...
      toast({ title: "Processing", description: "Preparing images..." });

      const processedFiles = await imageProcessor.processImages(
        files,
        (progress) => {
          setProgress(progress / 2);
        }
      );

      for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("recordType", recordType);
        formData.append("recordId", recordId);

        try {
          await uploadImage(formData);
          setProgress(50 + ((i + 1) / processedFiles.length) * 50);
        } catch (error) {
          console.error("Upload failed:", error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: `${processedFiles.length} ${
          processedFiles.length === 1 ? "image" : "images"
        } uploaded successfully`,
      });

      // Call the callback to refresh the gallery
      onUploadComplete();
    } catch (error) {
      console.error("Processing failed:", error);
      toast({
        title: "Error",
        description: "Failed to process images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      processAndUploadFiles(acceptedFiles);
    },
    [recordId, recordType, onUploadComplete]
  );

  // Rest of the ImageUpload component remains the same...
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    disabled: uploading,
    multiple: true,
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <h4 className="text-sm font-medium">Upload New Images</h4>
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          uploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the files here..."
              : "Drag 'n' drop images here, or click to select"}
          </p>
          {uploading && (
            <>
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground">
                {progress < 50 ? "Processing images..." : "Uploading..."} (
                {Math.round(progress)}%)
              </p>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Supported formats: PNG, JPG, GIF, WebP
      </p>
    </div>
  );
}
function ModifiedImageGallery({
  recordId,
  recordType,
  images,
  setImages,
}: ImageManagementProps & {
  images: ImageData[];
  setImages: (images: ImageData[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (!images.length) return;

    const cleanup = monitorForElements({
      onDrop: async ({ source, location }) => {
        const dropTarget = location.current.dropTargets[0];
        if (!dropTarget || !source.data.imageId) return;

        const sourceId = source.data.imageId;
        const targetId = dropTarget.data.imageId;

        if (sourceId === targetId) return;

        const newImages = [...images];
        const sourceIndex = newImages.findIndex((img) => img.id === sourceId);
        const targetIndex = newImages.findIndex((img) => img.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        // Move the image to new position
        const [movedImage] = newImages.splice(sourceIndex, 1);
        newImages.splice(targetIndex, 0, movedImage);

        // Update order numbers
        const updatedImages = newImages.map((img, index) => ({
          ...img,
          order: index,
        }));

        // Optimistically update UI
        setImages(updatedImages);

        try {
          await updateImageOrder(updatedImages);
          toast({ title: "Success", description: "Image order updated" });
        } catch (error) {
          // Revert on error
          setImages(images);
          toast({
            title: "Error",
            description: "Failed to update image order",
            variant: "destructive",
          });
        }
      },
    });

    return cleanup;
  }, [images, setImages]);

  const handleDescriptionChange = async (id: string, description: string) => {
    try {
      // Optimistically update UI
      setImages(
        images.map((img) =>
          img.id === id ? { ...img, desc: description } : img
        )
      );

      await updateImageDescription(id, description);
    } catch (error) {
      // Revert on error
      setImages(images);
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistically update UI
      setImages(images.filter((img) => img.id !== id));

      await deleteImage(id);
      toast({ title: "Success", description: "Image deleted" });
    } catch (error) {
      // Revert on error
      setImages(images);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <span>
        The first image will be the cover image. Drag & drop to reorder.
      </span>
      <div
        ref={containerRef}
        className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {images.map((image, index) => (
          <ImageItem
            key={image.id}
            image={image}
            index={index}
            onDescriptionChange={handleDescriptionChange}
            onDelete={handleDelete}
            setDraggingId={setDraggingId}
          />
        ))}
      </div>
    </div>
  );
}

export function ImageManagement({
  recordId,
  recordType,
}: ImageManagementProps) {
  const { images, setImages, isLoading, refreshImages } = useImages(
    recordId,
    recordType
  );

  return (
    <div className="space-y-4">
      <ModifiedImageUpload
        recordId={recordId}
        recordType={recordType}
        onUploadComplete={refreshImages} // Keep refresh for uploads since we need new data
      />
      <div>
        <h4 className="text-sm font-medium">Image Gallery</h4>
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">
            Loading images...
          </div>
        ) : (
          <ModifiedImageGallery
            recordId={recordId}
            recordType={recordType}
            images={images}
            setImages={setImages}
          />
        )}
      </div>
    </div>
  );
}

function ImageItem({
  image,
  index,
  onDescriptionChange,
  onDelete,
  setDraggingId,
}: {
  image: ImageData;
  index: number;
  onDescriptionChange: (id: string, desc: string) => void;
  onDelete: (id: string) => void;
  setDraggingId: (id: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const dragCleanup = draggable({
      element,
      getInitialData: () => ({
        imageId: image.id,
        index: index,
      }),
      onDragStart: () => {
        setIsDragging(true);
        setDraggingId(image.id);
      },
      onDrop: () => {
        setIsDragging(false);
        setDraggingId(null);
      },
    });

    const dropCleanup = dropTargetForElements({
      element,
      getData: () => ({
        imageId: image.id,
        index: index,
      }),
      canDrop: ({ source }) => source.data.imageId !== image.id,
    });

    return () => {
      dragCleanup();
      dropCleanup();
    };
  }, [image.id, index, setDraggingId]);

  return (
    <div
      ref={ref}
      data-testid={`image-item-${image.id}`}
      className={`group relative flex cursor-move flex-col overflow-hidden rounded-md border border-gray-200 bg-white/20 shadow-sm backdrop-blur transition-all duration-200 ${
        isDragging ? "scale-95 opacity-50" : "opacity-100 hover:shadow-md"
      }`}
    >
      <div className="relative h-48 w-full">
        <Button
          size="icon"
          variant="outline"
          className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onDelete(image.id)}
        >
          <X className="h-4 w-4" />
        </Button>
        <Image
          src={image.filePath}
          alt={image.desc || `Image ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="pointer-events-none rounded-t-md object-cover"
        />
      </div>
      <Input
        value={image.desc ?? ""}
        onChange={(e) => onDescriptionChange(image.id, e.target.value)}
        placeholder="Add description..."
        className="border-0 px-2 py-1 text-sm focus:ring-0"
      />
    </div>
  );
}
