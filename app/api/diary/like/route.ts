import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { diaryId, userId } = body;

        if (!diaryId || !userId) {
            return NextResponse.json(
                { message: "필수 값 누락: diaryId, userId 모두 필요" },
                { status: 400 }
            );
        }

        // 좋아요 생성
        await prisma.like.create({
            data: {
                diary: { connect: { id: diaryId } },
                user: { connect: { id: userId } },
            },
        });

        return NextResponse.json(
            { message: "좋아요 저장 성공!" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("🔥 Prisma 좋아요 저장 에러 🔥", error);
        return NextResponse.json(
            {
                message: "좋아요 저장 실패: Prisma 에러 발생",
                error: error,
            },
            { status: 500 }
        );
    }
}
