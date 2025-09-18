import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    try {
      const supabase = await createClient();

      // Exchange the code for a session
      const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

      if (authError) {
        console.error("Auth error:", authError);
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_failed`);
      }

      if (!authData.user) {
        console.error("No user data received");
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_user`);
      }

      // Check if user exists in our database, create if not
      const user = await prisma.users.upsert({
        where: { email: authData.user.email! },
        update: {
          updatedAt: new Date(),
        },
        create: {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: authData.user.email!,
          role: "user",
          updatedAt: new Date(),
        },
        include: {
          profiles: true,
        },
      });

      // Set our custom session cookie
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

      // Redirect to onboarding if user has no profile, otherwise to app
      const redirectTo = user.profiles ? "/app" : "/onboarding";
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);

    } catch (error) {
      console.error("Callback processing error:", error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=callback_failed`);
    }
  }

  // No code parameter, redirect to sign in
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`);
}