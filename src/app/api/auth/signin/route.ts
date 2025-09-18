import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = signInSchema.parse(body);

    // For local development, use simple hardcoded credentials
    // Admin: admin@murraycreative.com / admin123
    // User: user@example.com / user123

    let user = null;
    let isValidLogin = false;

    if (email === "admin@murraycreative.com" && password === "admin123") {
      // Check if admin exists in database, create if not
      user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          role: "admin",
        },
        include: {
          profile: true,
        },
      });
      isValidLogin = true;
    } else if (email === "user@example.com" && password === "user123") {
      // Check if user exists in database, create if not
      user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          role: "user",
        },
        include: {
          profile: true,
        },
      });
      isValidLogin = true;
    } else {
      // Try to find existing user in database with any password for development
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (existingUser && password === "dev123") {
        user = existingUser;
        isValidLogin = true;
      }
    }

    if (!isValidLogin || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile || null,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}