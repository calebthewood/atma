"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  deleteImage,
  fetchImages,
  updateImageDescription,
  updateImageOrder,
  uploadImage,
} from "@/actions/image-actions";
import { ImageDirectorySchema } from "@/schemas/image-schema";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Image as PrismaImage } from "@prisma/client";
import { X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { z } from "zod";

import { imageProcessor } from "@/lib/sharp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

type RecordType = z.infer<typeof ImageDirectorySchema>;
type ImageData = PrismaImage;

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
      const response = await fetchImages(recordId, recordType);

      if (!response.ok || !response.data) {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch images",
          variant: "destructive",
        });
        return;
      }

      setImages(response.data.sort((a, b) => a.order - b.order));
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
    refreshImages: loadImages,
  };
}

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

      // Validate inputs
      if (!recordType || !recordId) {
        throw new Error("Missing record type or ID");
      }

      toast({ title: "Processing", description: "Preparing images..." });

      // Process images
      let processedFiles: File[];
      try {
        processedFiles = await imageProcessor.processImages(
          files,
          (progress) => {
            setProgress(progress / 2);
          }
        );
      } catch (error) {
        console.error("Image processing error:", error);
        throw new Error("Failed to process images. Please try again.");
      }

      // Upload each file
      const uploadedFiles = [];
      for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i];

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("recordType", recordType);
          formData.append("recordId", recordId);

          console.log("Uploading file:", {
            recordType,
            recordId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });

          const response = await uploadImage(formData);

          if (!response.ok) {
            throw new Error(
              response.message || `Failed to upload ${file.name}`
            );
          }

          uploadedFiles.push(response.data);
          setProgress(50 + ((i + 1) / processedFiles.length) * 50);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: "Upload Error",
            description:
              error instanceof Error
                ? error.message
                : `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          // Continue with other files
          continue;
        }
      }

      // Only show success if at least one file was uploaded
      if (uploadedFiles.length > 0) {
        toast({
          title: "Success",
          description: `${uploadedFiles.length} of ${processedFiles.length} ${
            uploadedFiles.length === 1 ? "image" : "images"
          } uploaded successfully`,
        });
        onUploadComplete();
      } else {
        throw new Error("No files were successfully uploaded");
      }
    } catch (error) {
      console.error("Upload process failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload images",
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

        const [movedImage] = newImages.splice(sourceIndex, 1);
        newImages.splice(targetIndex, 0, movedImage);

        const updatedImages = newImages.map((img, index) => ({
          ...img,
          order: index,
        }));

        setImages(updatedImages);

        const response = await updateImageOrder(updatedImages);
        if (!response.ok) {
          setImages(images); // Revert on error
          toast({
            title: "Error",
            description: response.message || "Failed to update image order",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Image order updated",
        });
      },
    });

    return cleanup;
  }, [images, setImages]);

  const handleDescriptionChange = async (id: string, description: string) => {
    try {
      setImages(
        images.map((img) =>
          img.id === id ? { ...img, desc: description } : img
        )
      );

      const response = await updateImageDescription(id, description);
      if (!response.ok) {
        setImages(images); // Revert on error
        toast({
          title: "Error",
          description: response.message || "Failed to update description",
          variant: "destructive",
        });
      }
    } catch {
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
      setImages(images.filter((img) => img.id !== id));

      const response = await deleteImage(id);
      if (!response.ok) {
        setImages(images); // Revert on error
        toast({
          title: "Error",
          description: response.message || "Failed to delete image",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Image deleted",
      });
    } catch {
      setImages(images); // Revert on error
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <span className="text-sm text-muted-foreground">
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
      className={cn(
        "group relative flex cursor-move flex-col overflow-hidden rounded-md border bg-white/20 shadow-sm backdrop-blur transition-all duration-200",
        isDragging ? "scale-95 opacity-50" : "opacity-100 hover:shadow-md"
      )}
    >
      <div className="relative h-48 w-full">
        <Button
          size="icon"
          variant="outline"
          className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onDelete(image.id)}
        >
          <X className="size-4" />
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
        onUploadComplete={refreshImages}
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
