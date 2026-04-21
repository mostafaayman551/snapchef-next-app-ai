import prisma from "@/utils/db";
import { getUserFromToken } from "@/utils/token";
import { NextResponse, NextRequest } from "next/server";

/**
 * @method PUT
 * @route ~/api/recipes/update/[id]
 * @desc update a recipe (title, ingredients, steps)
 * @access private
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user)
      return NextResponse.json(
        { message: "Unauthorized request, please login" },
        { status: 401 }
      );

    const { id } = await params;
    const body = await request.json();

    // Verify the recipe exists and belongs to this user
    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ message: "Recipe not found" }, { status: 404 });
    if (existing.userId !== user.id)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        ingredients: body.ingredients ?? existing.ingredients,
        steps: body.steps ?? existing.steps,
      },
    });

    return NextResponse.json(
      { message: "Recipe updated successfully", recipe },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update recipe error:", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
