"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/actions/image-actions";
import { useDropzone } from "react-dropzone";

import { imageProcessor } from "@/lib/sharp";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  recordId: string;
  recordType: "property" | "program" | "host" | "retreat" | "room";
}

export function ImageUpload({ recordId, recordType }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const processAndUploadFiles = async (files: File[]) => {
    try {
      setUploading(true);
      setProgress(0);

      // Process all selected files
      toast({ title: "Processing", description: "Preparing images..." });

      const processedFiles = await imageProcessor.processImages(
        files,
        (progress) => {
          setProgress(progress / 2); // First 50% for processing
        }
      );

      // Upload processed files
      for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i];

        const formData = new FormData();
        formData.append("file", file);
        formData.append("recordType", recordType);
        formData.append("recordId", recordId);

        try {
          await uploadImage(formData);
          setProgress(50 + ((i + 1) / processedFiles.length) * 50); // Last 50% for uploading
        } catch (error) {
          console.error("Upload failed:", error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
          return;
        } finally {
          router.refresh();
        }
      }

      toast({
        title: "Success",
        description: `${processedFiles.length} ${
          processedFiles.length === 1 ? "image" : "images"
        } uploaded successfully`,
      });
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
    [recordId, recordType]
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
          <p className="text-muted-foreground text-sm">
            {isDragActive
              ? "Drop the files here..."
              : "Drag 'n' drop images here, or click to select"}
          </p>
          {uploading && (
            <>
              <Progress value={progress} className="h-1" />
              <p className="text-muted-foreground text-xs">
                {progress < 50 ? "Processing images..." : "Uploading..."} (
                {Math.round(progress)}%)
              </p>
            </>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Supported formats: PNG, JPG, GIF, WebP
      </p>
    </div>
  );
}
