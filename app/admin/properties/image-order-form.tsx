"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  deleteImage,
  fetchImages,
  updateImageDescription,
  updateImageOrder,
} from "@/actions/image-actions";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface ImageData {
  id: string;
  filePath: string;
  desc: string | null;
  order: number;
}

interface ImageGalleryProps {
  recordId: string;
  recordType: "property" | "retreat" | "host";
}

function ImageItem({
  image,
  index,
  onDescriptionChange,
  onDelete,
}: {
  image: ImageData;
  index: number;
  onDescriptionChange: (id: string, desc: string) => void;
  onDelete: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set up both draggable and drop target on each item
    const dragCleanup = draggable({
      element,
      getInitialData: () => ({
        imageId: image.id,
        index: index,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const dropCleanup = dropTargetForElements({
      element,
      getData: () => ({
        imageId: image.id,
        index: index,
      }),
      canDrop: ({ source }) => {
        return source.data.imageId !== image.id;
      },
    });

    return () => {
      dragCleanup();
      dropCleanup();
    };
  }, [image.id, index]);

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

export function ImageGallery({ recordId, recordType }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadImages();
  }, [recordId, recordType]);

  useEffect(() => {
    if (!images.length) return;

    const cleanup = monitorForElements({
      onDrop: async ({ source, location }) => {
        console.log("Drop event fired", { source, location });

        const dropTarget = location.current.dropTargets[0];
        if (!dropTarget || !source.data.imageId) {
          console.log("No valid drop target or source");
          return;
        }

        const sourceId = source.data.imageId;
        const targetId = dropTarget.data.imageId;

        if (sourceId === targetId) {
          console.log("Same source and target");
          return;
        }

        const newImages = [...images];
        const sourceIndex = newImages.findIndex((img) => img.id === sourceId);
        const targetIndex = newImages.findIndex((img) => img.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1) {
          console.log("Invalid source or target index");
          return;
        }

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
  }, [images]);

  const loadImages = async () => {
    try {
      const fetchedImages = await fetchImages(recordId, recordType);
      setImages(fetchedImages.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    }
  };

  const handleDescriptionChange = async (id: string, description: string) => {
    try {
      await updateImageDescription(id, description);
      setImages(
        images.map((img) =>
          img.id === id ? { ...img, desc: description } : img
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(id);
      setImages(images.filter((img) => img.id !== id));
      toast({ title: "Success", description: "Image deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
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
        />
      ))}
    </div>
  );
}
