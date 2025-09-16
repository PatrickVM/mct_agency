import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().min(2),
  bio: z.string().optional(),
  hobbies: z.array(z.string()).max(10),
  socialLinks: z.object({
    website: z.string().url().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional().nullable(),
  avatarUrl: z.string().url().optional().or(z.literal("")).nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has a profile
    if (user.profile) {
      return NextResponse.json(
        { success: false, message: "Profile already exists" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: validatedData.displayName,
        bio: validatedData.bio || null,
        hobbies: validatedData.hobbies,
        socialLinks: validatedData.socialLinks || null,
        avatarUrl: validatedData.avatarUrl,
        isPublic: false,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = profileSchema.partial().parse(body);

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}