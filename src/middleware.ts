import { NextResponse, NextRequest } from "next/server";

const publicRoutes = ["/login", "/register"];
const protectedRoutes = ["/profile", "/my-recipes"];
const COOKIE_NAME = "jwtToken";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/profile", "/login", "/register"],
};
