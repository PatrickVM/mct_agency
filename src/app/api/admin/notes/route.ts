import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createNoteSchema = z.object({
  talentUserId: z.string(),
  body: z.string().min(1).max(1000),
});

export async function GET() {
  try {
    const admin = await requireAdmin();

    const notes = await prisma.note.findMany({
      where: { adminUserId: admin.id },
      orderBy: { createdAt: "desc" },
    });

    // Manually fetch talent user data for each note
    const notesWithTalentUser = await Promise.all(
      notes.map(async (note) => {
        const talentUser = await prisma.user.findUnique({
          where: { id: note.talentUserId },
          select: {
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        });
        return { ...note, talentUser };
      })
    );

    return NextResponse.json({ notes: notesWithTalentUser });
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
    const { talentUserId, body: noteBody } = createNoteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        talentUserId,
        adminUserId: admin.id,
        body: noteBody,
      },
    });

    // Manually fetch talent user data
    const talentUser = await prisma.user.findUnique({
      where: { id: talentUserId },
      select: {
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const noteWithTalentUser = { ...note, talentUser };

    return NextResponse.json({
      success: true,
      note: noteWithTalentUser,
    });
  } catch (error) {
    console.error("Create note error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid data", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create note" },
      { status: 500 }
    );
  }
}