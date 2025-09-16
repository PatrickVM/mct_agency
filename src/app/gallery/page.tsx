"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Camera, Search, Calendar, User } from "lucide-react";

interface GalleryPhoto {
  id: string;
  filename: string;
  url: string;
  originalName: string;
  size: number;
  createdAt: string;
  uploadedBy: {
    email: string;
  };
}

function PhotoCard({ photo }: { photo: GalleryPhoto }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 group">
      <div className="aspect-square relative bg-muted">
        <img
          src={photo.url}
          alt={photo.originalName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Photo info overlay - appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white font-medium text-sm truncate" title={photo.originalName}>
            {photo.originalName}
          </p>
          <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
            <Calendar className="h-3 w-3" />
            {new Date(photo.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <Camera className="h-16 w-16 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg">
          No photos in our gallery yet.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back soon for amazing photography!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPhotos = async (search?: string) => {
    try {
      setLoading(true);
      const url = new URL("/api/gallery/photos", window.location.origin);
      if (search) {
        url.searchParams.set("search", search);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.ok) {
        setPhotos(data.photos);
      } else {
        console.error("Failed to fetch photos:", data.message);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchPhotos(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-primary hover:text-primary/80 transition-colors mb-4"
          >
            Murray Creative
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Camera className="h-12 w-12 text-primary" />
            Photo Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore our curated collection of creative photography and visual inspiration.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search photos..."
                className="pl-10 text-center"
              />
            </form>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Camera className="h-3 w-3" />
                {photos.length} photo{photos.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading photos...</p>
            </div>
          ) : (
            <PhotoGrid photos={photos} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Interested in our creative services?
          </p>
          <Link
            href="/auth/signin"
            className="text-primary hover:text-primary/80 underline"
          >
            Get in touch today
          </Link>
        </footer>
      </div>
    </div>
  );
}