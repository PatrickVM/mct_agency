import { z } from "zod";

// Base profile schema used for create
export const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().optional(),
  hobbies: z.array(z.string()).max(10, "You can add up to 10 hobbies"),
  socialLinks: z
    .object({
      website: z.string().url("Must be a valid URL").optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

// Partial schema for PATCH requests
export const profilePatchSchema = profileSchema.partial();

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;
