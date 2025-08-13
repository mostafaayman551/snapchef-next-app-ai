import jwt from "jsonwebtoken";
import { JWTPayload } from "./types";
import { serialize } from "cookie";
import { NextRequest } from "next/server";

const COOKIE_NAME = "jwtToken";
const JWT_SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

export function clearCookie(): string {
  const cookie = serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
  return cookie;
}
export function setCookie(token: string): string {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EXPIRES_IN,
  });
}

export function generateToken(jwtPayload: JWTPayload): string {
  const token = jwt.sign(jwtPayload, JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });
  return token;
}

export function getUserFromToken(request: NextRequest): JWTPayload | null {
  try {
    const tokenCookie = request.cookies.get(COOKIE_NAME);
    if (!tokenCookie) return null;
    const token = tokenCookie.value;
    if (!token) return null;
    const userPayload = jwt.verify(token, JWT_SECRET);
    return userPayload as JWTPayload;
  } catch (error) {
    console.log(error);
    return null;
  }
}
