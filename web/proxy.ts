import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/auth/token";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Static and system assets are always allowed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Extract and verify session token
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await verifySessionToken(token) : null;

  // 3. If accessing /login while already logged in
  if (pathname === "/login") {
    const isSwitching = request.nextUrl.searchParams.get("switch") === "true";
    if (user && !isSwitching) {
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (user.role === "teacher") {
        return NextResponse.redirect(new URL("/teacher", request.url));
      } else {
        return NextResponse.redirect(new URL("/student", request.url));
      }
    }
    return NextResponse.next();
  }

  // 4. Public route (Home page hub)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 5. Admin portal protection (/admin)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "staff");
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "admin") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("forbidden", "admin_only");
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 6. Teacher portal protection (/teacher and /curation)
  if (pathname.startsWith("/teacher") || pathname.startsWith("/curation")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "staff");
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "teacher" && user.role !== "admin") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("forbidden", "teacher_only");
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 7. Student areas protection (/student, /student/workshop, /student/mastery)
  if (pathname.startsWith("/student")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "student");
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
