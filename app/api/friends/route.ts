import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 임시 로그인된 사용자 (user 테이블의 id=Int)
const SESSION_USER_DB_ID = 1;
// ↑ 실제로는 로그인 시 세션에서 user.id(Int)를 받아와야 하는 값

export async function GET() {
  try {
    const list = await prisma.friend.findMany({
      where: { ownerId: SESSION_USER_DB_ID },
      include: { friend: true }
    });

    // friend.userId (문자열)만 프론트로 전달
    return NextResponse.json({
      friends: list.map((f) => f.friend.userId)
    });
  } catch (e) {
    console.error("GET error:", e);
    return NextResponse.json({ friends: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { friendUserId } = await req.json();

    if (!friendUserId) {
      return NextResponse.json({ error: "아이디를 입력하세요" }, { status: 400 });
    }

    // 1. 본인인지 검사
    const me = await prisma.user.findUnique({
      where: { id: SESSION_USER_DB_ID },
    });

    if (me?.userId === friendUserId) {
      return NextResponse.json(
        { error: "본인은 친구로 추가할 수 없습니다." },
        { status: 400 }
      );
    }

    // 2. 실제 존재하는 사용자인지 검사
    const target = await prisma.user.findUnique({
      where: { userId: friendUserId },
    });

    if (!target) {
      return NextResponse.json(
        { error: "존재하지 않는 아이디입니다." },
        { status: 400 }
      );
    }

    // 3. 이미 친구인지 검사
    const exists = await prisma.friend.findFirst({
      where: {
        ownerId: SESSION_USER_DB_ID,
        friendId: target.id,
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "이미 친구입니다." },
        { status: 400 }
      );
    }

    // 4. 친구 추가
    await prisma.friend.create({
      data: {
        ownerId: SESSION_USER_DB_ID,
        friendId: target.id,
      },
    });

    // 새 목록 반환
    const list = await prisma.friend.findMany({
      where: { ownerId: SESSION_USER_DB_ID },
      include: { friend: true },
    });

    return NextResponse.json({
      friends: list.map((f) => f.friend.userId),
    });
  } catch (e) {
    console.error("POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // id = userId(String) → friendId(Int)로 변환 필요
    const target = await prisma.user.findUnique({
      where: { userId: id },
    });

    if (!target) {
      return NextResponse.json({ error: "존재하지 않는 아이디" }, { status: 400 });
    }

    await prisma.friend.deleteMany({
      where: {
        ownerId: SESSION_USER_DB_ID,
        friendId: target.id,
      },
    });

    const list = await prisma.friend.findMany({
      where: { ownerId: SESSION_USER_DB_ID },
      include: { friend: true },
    });

    return NextResponse.json({
      friends: list.map((f) => f.friend.userId),
    });
  } catch (e) {
    console.error("DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
