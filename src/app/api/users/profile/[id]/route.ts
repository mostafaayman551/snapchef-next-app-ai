import prisma from "@/utils/db";
import { clearCookie, getUserFromToken } from "@/utils/token";
import { updateUserSchema } from "@/utils/validationSchema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

type UserProps = {
  id: string;
};
/**
 *
 * @method GET
 * @route ~/api/users/profile/:id
 * @desc get user profile
 * @access private
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<UserProps> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const userFromToken = getUserFromToken(request);
    if (userFromToken === null || userFromToken.id !== user.id) {
      return NextResponse.json(
        { message: "you are not allowed to view this profile" },
        { status: 403 }
      );
    }
    return NextResponse.json({ message: "success", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @method DELETE
 * @route /api/users/profile/:id
 * @description this api is used to delete a user.
 * @summary this api is used to delete a user and his/her reciepes and clear current cookies.
 * @access private
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<UserProps> }) {
  try {
    const {id} = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const userFromToken = getUserFromToken(request);
    if (!userFromToken) {
      return NextResponse.json(
        { message: "unauthorized access, please login" },
        { status: 401 }
      );
    }
    if (userFromToken.id === user.id) {
      // delete all recipe of user
      await prisma.recipe.deleteMany({ where: { userId: user.id } });
      // delete user
      await prisma.user.delete({ where: { id: user.id } });

      return NextResponse.json(
        { message: "user deleted successfully" },
        { status: 200, headers: { "Set-Cookie": clearCookie() } }
      );
    }
    return NextResponse.json({ message: "access denied" }, { status: 403 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @method PUT
 * @route /api/users/profile/:id
 * @description this api is used to update a user.
 * @summary this api is used to update a user profile
 * @access private
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<UserProps> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const userFromToken = getUserFromToken(request);
    if (!userFromToken) {
      return NextResponse.json(
        { message: "unauthorized access, please login" },
        { status: 401 }
      );
    }
    if (userFromToken.id !== user.id) {
      return NextResponse.json({ message: "access denied" }, { status: 403 });
    }
    const body = (await request.json()) as {
      name?: string;
      password?: string;
      confirmPassword?: string;
    };
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        password: body.password,
      },
    });
    return NextResponse.json(
      { message: "user updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "internal server error",
      },
      { status: 500 }
    );
  }
}
