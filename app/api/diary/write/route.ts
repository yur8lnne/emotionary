// app/api/diary/write/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

console.log("🔎 Prisma keys:", Object.keys(prisma));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, date, userId, emoji } = body;

    if (!content || !date || !emoji) {
      return NextResponse.json(
        { message: "필수 값 누락: content, date, emoji 모두 필요" },
        { status: 400 }
      );
    }

    let diary;
    try {
      // 1️⃣ 일기 먼저 생성
      diary = await prisma.diary.create({
        data: {
          userId,
          content,
          date: new Date(date),
        },
      });
    } catch (prismaError) {
      console.error("🔥 Prisma 일기 저장 에러 🔥", prismaError);
      return NextResponse.json(
        {
          message: "일기 저장 실패: Prisma 에러 발생",
          error: prismaError,
        },
        { status: 500 }
      );
    }

    try {
      // 2️⃣ 이모티콘이 있으면 Emotion 테이블에 저장
      await prisma.emotion.create({
        data: {
          icon: emoji,
          date: new Date(date),
          user: { connect: { id: userId } },      // user 연결
          diary: { connect: { id: diary.id } },   // diary 연결
        },
      });
    } catch (prismaError) {
      console.error("🔥 Prisma 이모티콘 저장 에러 🔥", prismaError);
      return NextResponse.json(
        {
          message: "이모티콘 저장 실패: Prisma 에러 발생",
          error: prismaError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "일기 & 이모티콘 저장 성공!", diary },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("💥 일기 저장 전체 에러 💥", error);
    return NextResponse.json(
      { message: "일기 저장 실패", error: error.message },
      { status: 500 }
    );
  }
}
