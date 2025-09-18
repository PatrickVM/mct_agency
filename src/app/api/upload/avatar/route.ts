import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createStorageService } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload file
    const storage = createStorageService();
    const uploadResult = await storage.uploadAvatar(
      fileBuffer,
      user.id,
      file.name
    );

    // Update user profile with new avatar URL
    await prisma.profiles.upsert({
      where: { userId: user.id },
      update: {
        avatarUrl: uploadResult.url,
      },
      create: {
        id: `profile-${user.id}-${Date.now()}`,
        userId: user.id,
        displayName: user.email.split("@")[0], // Default display name
        avatarUrl: uploadResult.url,
        bio: null,
        hobbies: [],
        socialLinks: undefined,
        isPublic: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: uploadResult.url,
        filename: uploadResult.filename,
        size: uploadResult.size,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.profiles?.avatarUrl) {
      return NextResponse.json(
        { success: false, message: "No avatar to delete" },
        { status: 400 }
      );
    }

    // Extract path from URL
    const avatarUrl = user.profiles.avatarUrl;
    const pathMatch = avatarUrl.match(/\/api\/files\/(.+)$/);

    if (pathMatch) {
      const storage = createStorageService();
      await storage.deleteFile(pathMatch[1]);
    }

    // Update profile to remove avatar URL
    await prisma.profiles.update({
      where: { userId: user.id },
      data: { avatarUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}