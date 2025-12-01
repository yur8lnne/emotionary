import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { date: string } }
) {
  const date = params.date; // "2025-11-28"

  // 날짜 범위 설정 (00:00 ~ 23:59)
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  // 해당 날짜의 일기 1개 가져오기
  const diary = await prisma.diary.findFirst({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      emotions: true, // 연결된 이모지만 가져오기
      likes: true,
    },
  });

  return NextResponse.json({ diary });
}
