import { clearCookie } from "@/utils/token";
import { NextResponse } from "next/server";

/**
 * @method GET
 * @route /api/users/logout
 * @description Handles user logout by clearing the authentication cookie.
 * @summary Logs the user out of the application.
 * @access public
 */
export async function GET() {
  try {
    const expiredCookie = clearCookie();
    return NextResponse.json(
      { message: "user has been logged out" },
      {
        status: 200,
        headers: {
          "Set-Cookie": expiredCookie,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
