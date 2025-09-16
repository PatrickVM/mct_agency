"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Eye,
  EyeOff,
  Mail,
  MessageCircle,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TalentProfile {
  id: string;
  displayName: string;
  bio: string | null;
  hobbies: string[];
  avatarUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    createdAt: string;
  };
}

export default function TalentManager() {
  const [profiles, setProfiles] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/admin/talent");
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      toast.error("Failed to load talent profiles");
    } finally {
      setLoading(false);
    }
  };

  const togglePublicStatus = async (
    profileId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/talent/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !currentStatus }),
      });

      if (response.ok) {
        setProfiles(
          profiles.map((p) =>
            p.id === profileId ? { ...p, isPublic: !currentStatus } : p
          )
        );
        toast.success(
          `Profile ${!currentStatus ? "published to" : "removed from"} gallery`
        );
      } else {
        toast.error("Failed to update profile status");
      }
    } catch (error) {
      toast.error("Failed to update profile status");
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.hobbies.some((hobby) =>
        hobby.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading) {
    return <div className="text-center py-8">Loading talent profiles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profiles Grid */}
      <div className="grid gap-4">
        {filteredProfiles.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No profiles match your search"
                  : "No talent profiles found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProfiles.map((profile) => {
            const initials = profile.displayName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase();

            return (
              <Card key={profile.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage
                        src={profile.avatarUrl || undefined}
                        alt={profile.displayName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">
                          {profile.displayName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={profile.isPublic}
                            onCheckedChange={() =>
                              togglePublicStatus(profile.id, profile.isPublic)
                            }
                          />
                          <Badge
                            variant={profile.isPublic ? "default" : "secondary"}
                          >
                            {profile.isPublic ? (
                              <Eye className="h-3 w-3 mr-1" />
                            ) : (
                              <EyeOff className="h-3 w-3 mr-1" />
                            )}
                            {profile.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {profile.user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined{" "}
                          {new Date(
                            profile.user.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      {profile.bio && (
                        <p className="text-sm text-card-foreground mt-3 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}

                      {profile.hobbies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {profile.hobbies.slice(0, 4).map((hobby, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {hobby}
                            </Badge>
                          ))}
                          {profile.hobbies.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{profile.hobbies.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Updated{" "}
                          {new Date(profile.updatedAt).toLocaleDateString()}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`#notes-${profile.id}`}>
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Notes
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
