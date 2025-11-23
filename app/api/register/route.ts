import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, password, username, email, phone } = body;

        if (!userId || !password) {
            return NextResponse.json({ message: "필수 값 누락" }, { status: 400 });
        }

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 데이터베이스에 저장
        const newUser = await prisma.user.create({
            data: {
                userId,
                password: hashedPassword,
                username,
                email,
                phone,
            },
        });

        return NextResponse.json({ message: "회원가입 성공!", user: newUser }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { message: "회원가입 실패", error: error.message },
            { status: 500 }
        );
    }
}
