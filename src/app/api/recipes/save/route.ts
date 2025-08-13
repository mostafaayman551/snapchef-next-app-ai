import prisma from "@/utils/db";
import { SaveRecipeDto } from "@/utils/dtos";
import { getUserFromToken } from "@/utils/token";
import { saveRecipeSchema } from "@/utils/validationSchema";
import { NextResponse, NextRequest } from "next/server";

/**
 *
 * @method POST
 * @route ~/api/recipes/save
 * @desc save recipe
 * @access private
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user)
      return NextResponse.json(
        { message: "unauthorized request, please login" },
        { status: 401 }
      );
    const body = (await request.json()) as SaveRecipeDto;
    const validation = saveRecipeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        ingredients: body.ingredients.toString(),
        steps: body.steps.toString(),
        userId: user.id,
      },
    });
    return NextResponse.json({ message: "Recipe saved successfully", recipe }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
