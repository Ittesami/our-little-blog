import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isCommentRoute = /^\/api\/posts\/[^/]+\/comments/.test(pathname);
  const isProtectedApi =
    (pathname.startsWith("/api/posts") ||
      pathname.startsWith("/api/messages") ||
      pathname.startsWith("/api/cloudinary")) &&
    request.method !== "GET" &&
    !isCommentRoute;

  if (!isAdminPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    if (isAdminPage) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/posts/:path*", "/api/messages/:path*", "/api/cloudinary/:path*"],
};
