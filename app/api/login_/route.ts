import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password) {
      return NextResponse.json(
        { message: "ID와 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user) {
      // 존재하지 않는 ID
      return NextResponse.json(
        { message: "존재하지 않는 ID입니다." },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // 비밀번호 불일치
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 로그인 성공
    return NextResponse.json(
      {
        message: "로그인 성공",
        user: { id: user.id, userId: user.userId, name: user.name },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("로그인 에러:", err);
    return NextResponse.json(
      { message: "로그인 실패", error: err.message },
      { status: 500 }
    );
  }
}
