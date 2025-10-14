import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const photosData = await prisma.admin_photos.findMany({
      include: {
        users: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the response to use 'uploadedBy' instead of 'users'
    const photos = photosData.map(({ users, ...photo }) => ({
      ...photo,
      uploadedBy: users,
    }));

    return NextResponse.json({
      success: true,
      photos,
    });
  } catch (error) {
    console.error("Failed to fetch admin photos:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}