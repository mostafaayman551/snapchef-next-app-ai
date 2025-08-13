import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { generateToken, setCookie } from "@/utils/token";
import { RegisterFormDto } from "@/utils/dtos";
import { registerSchema } from "@/utils/validationSchema";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterFormDto;

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });
    const token = generateToken({ id: user.id, email: user.email });
    const cookie = setCookie(token);
    const { password, ...rest } = user;
    return NextResponse.json(
      { message: "success", user: { ...rest } },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
