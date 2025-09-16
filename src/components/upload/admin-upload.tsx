"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, X, Folder, Image as ImageIcon, AlertCircle } from "lucide-react";

interface AdminUploadProps {
  onUploadSuccess?: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FOLDERS = [
  { value: "gallery", label: "Gallery", description: "Main gallery photos" },
  { value: "marketing", label: "Marketing", description: "Marketing materials" },
  { value: "events", label: "Events", description: "Event photos" },
  { value: "misc", label: "Miscellaneous", description: "Other photos" },
];

export default function AdminUpload({ onUploadSuccess }: AdminUploadProps) {
  const [selectedFolder, setSelectedFolder] = useState("gallery");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(7);

  const addFiles = (newFiles: File[]) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large (max 5MB)`);
        return false;
      }
      return true;
    });

    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: generateId(),
      status: 'pending',
    }));

    // Generate previews
    uploadFiles.forEach(uploadFile => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, preview: e.target?.result as string }
            : f
        ));
      };
      reader.readAsDataURL(uploadFile.file);
    });

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const newFiles = Array.from(e.dataTransfer.files);
    if (newFiles.length > 0) {
      addFiles(newFiles);
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
    const newFiles = e.target.files;
    if (newFiles) {
      addFiles(Array.from(newFiles));
    }
    e.target.value = ''; // Reset input
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("No files to upload");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f.file));
      formData.append("folder", selectedFolder);

      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      const response = await fetch("/api/upload/admin", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const { uploaded, errors, totalUploaded } = data.data;

        // Mark successful uploads
        setFiles(prev => prev.map(f => {
          // First try exact match with originalName (most reliable)
          let wasUploaded = uploaded?.some((u: any) => u.originalName === f.file.name) || false;

          // Fallback to normalized filename matching if exact match fails
          if (!wasUploaded) {
            const originalBaseName = f.file.name
              .split('.')[0] // Remove extension
              .toLowerCase() // Convert to lowercase
              .replace(/[^a-zA-Z0-9]/g, '-'); // Replace non-alphanumeric with dashes

            wasUploaded = uploaded?.some((u: any) => {
              if (!u.filename) return false;
              const uploadedFileName = u.filename.toLowerCase();
              return uploadedFileName.includes(originalBaseName);
            }) || false;
          }

          // Check for errors by filename (original name)
          const hasError = errors?.some((error: string) =>
            error?.toLowerCase().includes(f.file.name.toLowerCase())
          ) || false;

          // Determine status more explicitly
          let status: 'pending' | 'uploading' | 'success' | 'error' = 'error';
          let errorMessage: string | undefined = undefined;

          if (wasUploaded) {
            status = 'success';
          } else if (hasError) {
            status = 'error';
            errorMessage = errors?.find((e: string) =>
              e?.toLowerCase().includes(f.file.name.toLowerCase())
            );
          } else if (errors?.length === 0 && uploaded?.length > 0) {
            // If no errors reported and there were uploads, mark as success
            status = 'success';
          } else {
            status = 'error';
            errorMessage = 'Upload status unknown';
          }

          return {
            ...f,
            status,
            error: errorMessage,
          };
        }));

        toast.success(`Uploaded ${totalUploaded} file(s) successfully!`);

        if (errors?.length > 0) {
          toast.error(`${errors.length} file(s) failed to upload`);
        }

        onUploadSuccess?.();

        // Clear successful uploads after a delay
        setTimeout(() => {
          setFiles(prev => {
            const remaining = prev.filter(f => f.status !== 'success');
            console.log('Clearing uploads - before:', prev.length, 'after:', remaining.length);
            return remaining;
          });
        }, 2000);

        // Also clear all files if all uploads were successful
        if (errors?.length === 0 && uploaded?.length > 0) {
          setTimeout(() => {
            setFiles([]);
          }, 3000);
        }

      } else {
        setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: data.message })));
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: errorMessage })));
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'uploading':
        return <Badge variant="default">Uploading...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Folder Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Select Folder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FOLDERS.map(folder => (
              <button
                key={folder.value}
                onClick={() => setSelectedFolder(folder.value)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedFolder === folder.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-sm">{folder.label}</div>
                <div className="text-xs text-muted-foreground">{folder.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>

            <div>
              <h3 className="text-lg font-medium">Drop photos here</h3>
              <p className="text-muted-foreground">
                Or click to select multiple files
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG, WebP • Max 5MB per file
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full sm:w-auto"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Select Files
              </Button>

              {files.length > 0 && (
                <Button
                  onClick={uploadFiles}
                  disabled={uploading}
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  Upload {files.length} file(s) to {FOLDERS.find(f => f.value === selectedFolder)?.label}
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Files to Upload ({files.length})</span>
              <Button
                onClick={() => setFiles([])}
                variant="outline"
                size="sm"
                disabled={uploading}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map(uploadFile => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {/* File preview */}
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                    {uploadFile.preview ? (
                      <img
                        src={uploadFile.preview}
                        alt={uploadFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {uploadFile.file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    {uploadFile.error && (
                      <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {uploadFile.error}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(uploadFile.status)}

                    {uploadFile.status === 'pending' && (
                      <Button
                        onClick={() => removeFile(uploadFile.id)}
                        variant="ghost"
                        size="sm"
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}