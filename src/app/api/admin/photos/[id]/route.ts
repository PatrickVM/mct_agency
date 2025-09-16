import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStorageService } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    // Find the photo
    const photo = await prisma.adminPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json(
        { success: false, message: "Photo not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    const storage = createStorageService();
    try {
      await storage.deleteFile(photo.path);
    } catch (error) {
      console.error("Failed to delete file from storage:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.adminPhoto.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete photo" },
      { status: 500 }
    );
  }
}