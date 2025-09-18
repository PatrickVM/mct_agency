import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInviteToken, sendMagicLink } from "@/lib/invites";
import { z } from "zod";

const createInviteSchema = z.object({
  email: z.string().email(),
});

export async function GET() {
  try {
    const admin = await requireAdmin();

    const invites = await prisma.invite_tokens.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ invites });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { email } = createInviteSchema.parse(body);

    const inviteToken = await createInviteToken(email, admin.id);

    // Send magic link
    let inviteUrl = null;
    try {
      await sendMagicLink(email, inviteToken.token);
    } catch (error) {
      console.error("Failed to send magic link:", error);
      // Don't fail the request if email sending fails
    }

    // For local development, provide the invite URL directly
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('/api/mock')) {
      inviteUrl = `${process.env.NEXTAUTH_URL}/invite/accept?token=${inviteToken.token}`;
    }

    return NextResponse.json({
      success: true,
      invite: inviteToken,
      inviteUrl, // Include the URL for local development
    });
  } catch (error) {
    console.error("Create invite error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create invite" },
      { status: 500 }
    );
  }
}