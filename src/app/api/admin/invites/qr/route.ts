import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createInviteToken } from "@/lib/invites";
import { generateQRCode, generateInviteUrl } from "@/lib/qr";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    // Create invite token without email (for QR)
    const inviteToken = await createInviteToken("", admin.id);

    // Generate QR code
    const inviteUrl = generateInviteUrl(inviteToken.token);
    const qrDataUrl = generateQRCode(inviteUrl);

    return NextResponse.json({
      success: true,
      token: inviteToken.token,
      inviteUrl,
      qrDataUrl,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate QR invite" },
      { status: 500 }
    );
  }
}