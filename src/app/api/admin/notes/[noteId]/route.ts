import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { noteId } = await params;

    // Ensure the note belongs to the current admin
    await prisma.note.delete({
      where: {
        id: noteId,
        adminUserId: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete note" },
      { status: 500 }
    );
  }
}