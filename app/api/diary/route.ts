// app/api/diary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const loginUserId = Number(session.user.id);
  const { date, content, emoji, friendUserId } = await req.json();

  try {
    await prisma.diary.upsert({
      where: { userId_date: { userId: loginUserId, date } },
      update: { content, emoji, friendUserId },
      create: { userId: loginUserId, date, content, emoji, friendUserId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const diary = await prisma.diary.findFirst({
      where: {
        userId: session.user.id,   // 로그인한 사용자 아이디
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        emotions: true,
      },
    });

    return NextResponse.json({ diary }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
