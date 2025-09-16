import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  // Get session from cookie
  const sessionCookie = request.cookies.get("session");
  let user = null;

  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch (error) {
      // Invalid session cookie, clear it
      response.cookies.delete("session");
    }
  }

  // Protect /app routes
  if (request.nextUrl.pathname.startsWith("/app") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }

    // Check if user is admin
    if (user.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth/signin") && user) {
    const url = request.nextUrl.clone();
    if (user.role === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/app";
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
