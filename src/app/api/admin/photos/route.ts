import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const photos = await prisma.adminPhoto.findMany({
      include: {
        uploadedBy: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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