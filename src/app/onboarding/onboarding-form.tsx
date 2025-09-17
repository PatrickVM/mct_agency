"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { X, Plus, Upload } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface OnboardingFormProps {
  user: {
    id: string;
    email: string;
    profile: any;
  };
  mode?: "create" | "edit";
  initialProfile?: {
    displayName: string;
    bio: string | null;
    hobbies: string[];
    socialLinks: Record<string, string> | null;
    avatarUrl: string | null;
  };
}

export default function OnboardingForm({
  user,
  mode = "create",
  initialProfile,
}: OnboardingFormProps) {
  const [hobbies, setHobbies] = useState<string[]>(
    initialProfile?.hobbies ?? []
  );
  const [newHobby, setNewHobby] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    initialProfile?.avatarUrl ?? ""
  );
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: initialProfile?.displayName ?? "",
      bio: initialProfile?.bio ?? "",
      website: initialProfile?.socialLinks?.website ?? "",
      instagram: initialProfile?.socialLinks?.instagram ?? "",
      tiktok: initialProfile?.socialLinks?.tiktok ?? "",
    },
  });

  const addHobby = () => {
    if (
      newHobby.trim() &&
      !hobbies.includes(newHobby.trim()) &&
      hobbies.length < 10
    ) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby("");
    }
  };

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      let newAvatarUrl: string | null = null;

      // Upload avatar if provided
      if (avatar) {
        try {
          const formData = new FormData();
          formData.append("file", avatar);

          const response = await fetch("/api/upload/avatar", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            newAvatarUrl = data.data.url as string;
          } else {
            throw new Error(data.message || "Upload failed");
          }
        } catch (error) {
          console.error("Avatar upload failed:", error);
          toast.error(
            mode === "create"
              ? "Avatar upload failed, but profile will be created without it"
              : "Avatar upload failed; keeping your current avatar"
          );
        }
      }

      // Build social links
      const socialLinks = {
        ...(data.website && { website: data.website }),
        ...(data.instagram && { instagram: data.instagram }),
        ...(data.tiktok && { tiktok: data.tiktok }),
      };

      if (mode === "create") {
        const profileData = {
          displayName: data.displayName,
          bio: data.bio || "",
          hobbies,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          avatarUrl: newAvatarUrl || null,
        };

        const response = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create profile");
        }

        toast.success("Profile created successfully!");
      } else {
        // Edit (PATCH)
        const patchPayload: Record<string, any> = {
          displayName: data.displayName,
          bio: data.bio || "",
          hobbies,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        };

        if (newAvatarUrl) {
          patchPayload.avatarUrl = newAvatarUrl;
        }

        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchPayload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update profile");
        }

        toast.success("Profile updated");
      }
      router.push("/app");
    } catch (error) {
      console.error("Profile creation failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {mode === "create" ? "Create Your Profile" : "Edit Your Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={avatarPreview} alt="Profile picture" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a profile picture
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Display Name *
            </label>
            <Input
              {...register("displayName")}
              placeholder="Your full name"
              className={errors.displayName ? "border-red-500" : ""}
            />
            {errors.displayName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Bio
            </label>
            <Textarea
              {...register("bio")}
              placeholder="Tell us about yourself, your experience, and what makes you unique..."
              rows={4}
              className={errors.bio ? "border-red-500" : ""}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Hobbies/Skills */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Skills & Hobbies
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                placeholder="Add a skill or hobby..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHobby();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addHobby}
                size="sm"
                disabled={!newHobby.trim() || hobbies.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby, index) => (
                <Badge key={index} variant="secondary" className="pl-3 pr-1">
                  {hobby}
                  <button
                    type="button"
                    onClick={() => removeHobby(hobby)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Add up to 10 skills or hobbies that represent you
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Social Links (Optional)
            </label>

            <div>
              <Input
                {...register("website")}
                placeholder="https://your-website.com"
                type="url"
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>

            <div>
              <Input
                {...register("instagram")}
                placeholder="@instagram_username"
              />
            </div>

            <div>
              <Input {...register("tiktok")} placeholder="@tiktok_username" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "create"
                ? "Creating Profile..."
                : "Saving..."
              : mode === "create"
                ? "Complete Setup"
                : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
