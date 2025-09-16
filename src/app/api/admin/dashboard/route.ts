import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const [
      totalUsers,
      totalProfiles,
      publicProfiles,
      pendingInvites,
      totalNotes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
      prisma.profile.count({ where: { isPublic: true } }),
      prisma.inviteToken.count({
        where: { consumedAt: null, expiresAt: { gt: new Date() } },
      }),
      prisma.note.count(),
    ]);

    const stats = {
      totalUsers,
      totalProfiles,
      publicProfiles,
      pendingInvites,
      totalNotes,
    };

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}