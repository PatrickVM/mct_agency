import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // For local development without Supabase
  // Skip authentication, allow all routes

  const response = NextResponse.next({
    request,
  });

  // Optional: Add some mock user data for development
  if (process.env.NODE_ENV === "development") {
    // You can add mock session data here if needed
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};