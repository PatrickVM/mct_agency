"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Upload, X, Camera } from "lucide-react";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userInitials: string;
  onUploadSuccess?: (url: string | null) => void;
}

export default function AvatarUpload({
  currentAvatarUrl,
  userInitials,
  onUploadSuccess,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast.error("File too large. Maximum size is 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Avatar uploaded successfully!");
        setPreviewUrl(null);
        onUploadSuccess?.(data.data.url);
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreviewUrl(null);
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="space-y-4">
      <Card
        className={`relative border-2 border-dashed transition-colors cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar Preview */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage
                  src={displayUrl || undefined}
                  alt="Avatar preview"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {/* Loading overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                </div>
              )}

              {/* Camera icon overlay */}
              <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full text-primary-foreground">
                <Camera className="h-4 w-4" />
              </div>

              {/* Clear preview button */}
              {previewUrl && !uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPreview();
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Upload instructions */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Upload className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium">
                  {uploading ? "Uploading..." : "Upload Avatar"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP • Max 5MB
              </p>
            </div>
          </div>
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />
      </Card>

      {/* Upload button (alternative to drag & drop) */}
      <div className="flex gap-2">
        <Button
          onClick={handleClick}
          disabled={uploading}
          variant="outline"
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Choose File"}
        </Button>

        {currentAvatarUrl && (
          <Button
            onClick={async () => {
              try {
                const response = await fetch("/api/upload/avatar", {
                  method: "DELETE",
                });

                if (response.ok) {
                  toast.success("Avatar removed");
                  onUploadSuccess?.(null);
                } else {
                  throw new Error("Failed to remove avatar");
                }
              } catch (error) {
                toast.error("Failed to remove avatar");
              }
            }}
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
