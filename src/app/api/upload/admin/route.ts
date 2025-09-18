import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createStorageService } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_FOLDERS = ["gallery", "marketing", "events", "misc"];

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = formData.get("folder") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files provided" },
        { status: 400 }
      );
    }

    if (!folder || !ALLOWED_FOLDERS.includes(folder.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(", ")}` },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validate each file
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File too large (max 5MB)`);
          continue;
        }

        // Convert file to buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Upload file
        const storage = createStorageService();
        const uploadResult = await storage.uploadAdminPhoto(
          fileBuffer,
          folder.toLowerCase(),
          file.name
        );

        // Save to database
        const adminPhoto = await prisma.admin_photos.create({
          data: {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: uploadResult.filename,
            path: uploadResult.path,
            url: uploadResult.url,
            folder: folder.toLowerCase(),
            originalName: file.name,
            size: uploadResult.size,
            uploadedById: admin.id,
            updatedAt: new Date(),
          },
        });

        results.push({
          id: adminPhoto.id,
          filename: uploadResult.filename,
          originalName: file.name,
          url: uploadResult.url,
          size: uploadResult.size,
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${results.length} file(s)`,
      data: {
        uploaded: results,
        errors: errors,
        totalUploaded: results.length,
        totalErrors: errors.length,
      },
    });
  } catch (error) {
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload files" },
      { status: 500 }
    );
  }
}