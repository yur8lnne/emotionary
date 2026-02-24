// app/api/register/route.ts
export const runtime = "nodejs"; // Node.js 환경에서 실행

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, password, name, email, phone } = body;

    // 필수값 체크
    if (!userId || !password) {
      return NextResponse.json({ message: "필수 값 누락" }, { status: 400 });
    }

    // 중복 체크 (userId, email, phone)
    const existingUserId = await prisma.user.findUnique({ where: { userId } });
    if (existingUserId) return NextResponse.json({ message: "이미 존재하는 ID입니다.", status: 409 });

    if (email) {
      try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) return NextResponse.json({ message: "이미 존재하는 이메일입니다.", status: 409 });
      } catch (e) {
        console.warn("이메일 중복 확인 중 경고:", e);
      }
    }

    if (phone) {
      try {
        const existingPhone = await prisma.user.findUnique({ where: { phone } });
        if (existingPhone) return NextResponse.json({ message: "이미 존재하는 전화번호입니다.", status: 409 });
      } catch (e) {
        console.warn("전화번호 중복 확인 중 경고:", e);
      }
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성
    const newUser = await prisma.user.create({
      data: {
        userId,
        password: hashedPassword,
        name: name || null,   // optional 필드 처리
        email: email || null,
        phone: phone || null,
      },
    });

    return NextResponse.json({ message: "회원가입 성공!", user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("회원가입 에러:", error); // 서버 콘솔에 실제 에러 출력
    return NextResponse.json({ message: "회원가입 실패", error: error.message }, { status: 500 });
  }
}
