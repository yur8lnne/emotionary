import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/diary?date=YYYY-MM-DD
 * 로그인된 사용자의 특정 날짜의 일기 조회
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const diary = await prisma.diary.findFirst({
      where: {
        userId: session.user.id,
        date,
      },
    });

    if (!diary) {
      return NextResponse.json({ diary: null }, { status: 200 });
    }

    return NextResponse.json({ diary }, { status: 200 });
  } catch (err) {
    console.error("GET /api/diary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
