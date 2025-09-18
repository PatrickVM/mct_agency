import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Fetch photos from the "gallery" folder only (public photos)
    const photos = await prisma.admin_photos.findMany({
      where: {
        folder: "gallery",
        ...(search && {
          OR: [
            { originalName: { contains: search, mode: "insensitive" } },
            { filename: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
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

    return NextResponse.json({
      success: true,
      photos,
    });
  } catch (error) {
    console.error("Failed to fetch gallery photos:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}