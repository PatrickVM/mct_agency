import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const setPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { password } = setPasswordSchema.parse(body);

    // Update password in Supabase
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Password update error:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Failed to set password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password set successfully",
    });
  } catch (err) {
    console.error("Set password error:", err);

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
