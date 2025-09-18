"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { Trash2, Eye, Calendar, User, FolderOpen } from "lucide-react";
import AdminUpload from "@/components/upload/admin-upload";
import { useConfirmationModal } from "@/components/ui/confirmation-modal";

interface AdminPhoto {
  id: string;
  filename: string;
  url: string;
  folder: string;
  originalName: string;
  size: number;
  createdAt: string;
  uploadedBy: {
    email: string;
  };
}

export default function PhotoManager() {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { confirm, ConfirmationModalComponent } = useConfirmationModal();

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/admin/photos");
      const data = await response.json();

      if (response.ok) {
        setPhotos(data.photos);
      } else {
        toast.error("Failed to load photos");
      }
    } catch (error) {
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUploadSuccess = () => {
    fetchPhotos();
    toast.success("Upload completed successfully!");
  };

  const handleDeletePhoto = async (photoId: string, photoName: string) => {
    await confirm({
      title: "Delete Photo",
      description: `Are you sure you want to delete "${photoName}"? This action cannot be undone and the photo will be permanently removed from the gallery.`,
      confirmText: "Delete Photo",
      cancelText: "Keep Photo",
      variant: "destructive",
      icon: "delete",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/photos/${photoId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            toast.success("Photo deleted successfully");
          } else {
            const data = await response.json();
            toast.error(data.message || "Failed to delete photo");
          }
        } catch (error) {
          toast.error("Failed to delete photo");
        }
      },
    });
  };

  const filteredPhotos = selectedFolder
    ? photos.filter(photo => photo.folder === selectedFolder)
    : photos;

  const folderCounts = photos.reduce((acc, photo) => {
    acc[photo.folder] = (acc[photo.folder] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const folders = Object.keys(folderCounts).sort();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUpload onUploadSuccess={handleUploadSuccess} />
        </CardContent>
      </Card>

      {/* Folder Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Photo Library ({photos.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={() => setSelectedFolder(null)}
              variant={selectedFolder === null ? "default" : "outline"}
              size="sm"
            >
              All Folders ({photos.length})
            </Button>
            {folders.map(folder => (
              <Button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                variant={selectedFolder === folder ? "default" : "outline"}
                size="sm"
              >
                {folder.charAt(0).toUpperCase() + folder.slice(1)} ({folderCounts[folder]})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {selectedFolder
                ? `No photos found in ${selectedFolder} folder`
                : "No photos uploaded yet"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                <Image
                  src={photo.url}
                  alt={photo.originalName}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{photo.folder}</Badge>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(photo.url, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePhoto(photo.id, photo.originalName)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate" title={photo.originalName}>
                    {photo.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(photo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {photo.uploadedBy.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {ConfirmationModalComponent}
    </div>
  );
}