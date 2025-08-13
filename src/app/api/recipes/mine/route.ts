import { NextResponse, NextRequest } from "next/server";
import { getUserFromToken } from "@/utils/token";
import prisma from "@/utils/db";

/**
 *
 * @method GET
 * @route ~/api/recipes/mine
 * @desc get all recipes created by the user
 * @access private
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user)
      return NextResponse.json(
        { message: "unauthorized request, please login" },
        { status: 401 }
      );
    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
