import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await requireAdmin();

    const profilesData = await prisma.profiles.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform the response to use 'user' instead of 'users'
    const profiles = profilesData.map(({ users, ...profile }) => ({
      ...profile,
      user: users,
    }));

    return NextResponse.json({ profiles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}