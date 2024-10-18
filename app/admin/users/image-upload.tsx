"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/actions/user-actions";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload"}
    </Button>
  );
}

export function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const result = await uploadImage(formData);
    if (result.success) {
      // Handle success (e.g., show a success message, reset the form)
      console.log("Image uploaded successfully:", result.url);
      setFile(null);
      setPreview(null);
      formRef.current?.reset();
    } else {
      // Handle error
      console.error("Upload failed:", result.error);
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <Input
        type="file"
        name="image"
        onChange={handleFileChange}
        accept="image/*"
      />
      {preview && (
        <div className="mt-4">
          <Image
            src={preview}
            alt="Preview"
            width={100}
            height={100}
            className="object-cover"
          />
        </div>
      )}
      <SubmitButton />
    </form>
  );
}
