import prisma from "@/utils/db";
import { getUserFromToken } from "@/utils/token";
import { NextResponse, NextRequest } from "next/server";

type DeleteParams = { id: string };
/**
 *
 * @method DELETE
 * @route ~/api/recipes/delete/:id
 * @desc delete recipe
 * @access private
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<DeleteParams> }
) {
  try {
    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });
    if (!recipe) {
      return NextResponse.json(
        { message: "Recipe not found" },
        { status: 404 }
      );
    }
    const userFromToken = getUserFromToken(request);
    if (userFromToken !== null && userFromToken.id === recipe.userId) {
      await prisma.recipe.delete({ where: { id } });
      return NextResponse.json(
        { message: "Recipe deleted successfully", id },
        { status: 200 }
      );
    }
    // recipe id exist and user exist and token is valid but user is not the owner
    return NextResponse.json(
      { message: "you are not allowed to delete this recipe" },
      { status: 403 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
