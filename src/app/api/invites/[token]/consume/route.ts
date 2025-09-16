import { NextRequest, NextResponse } from "next/server";
import { validateInviteToken, consumeInviteToken } from "@/lib/invites";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await validateInviteToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    await consumeInviteToken(token);

    return NextResponse.json({
      success: true,
      message: "Invite token consumed successfully",
    });
  } catch (error) {
    console.error("Error consuming invite token:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}