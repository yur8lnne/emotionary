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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const loginUserId = Number(session.user.id);

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  try {
    const diary = await prisma.diary.findUnique({
      where: { userId_date: { userId: loginUserId, date: date! } },
    });

    return NextResponse.json({ diary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ diary: null });
  }
}
