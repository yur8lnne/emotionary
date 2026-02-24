// app/api/friends/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: 친구 목록 (정렬 순서 포함)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ friends: [], error: "로그인 필요" }, { status: 401 });
    }
    const loginUserId = Number(session.user.id);

    const list = await prisma.friend.findMany({
      where: { ownerId: loginUserId },
      include: { friend: true },
      orderBy: { order: "asc" },
    });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "detailed") {
      return NextResponse.json({
        friends: list.map(f => ({
          id: f.friend.id,
          friendId: f.friend.userId,
          friendName: f.friend.name,
        })),
      });
    } else {
      return NextResponse.json({ friends: list.map(f => f.friend.userId) });
    }
  } catch (e) {
    console.error("GET error:", e);
    return NextResponse.json({ friends: [] });
  }
}

// POST: 친구 추가
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }
    const loginUserId = Number(session.user.id);
    const { friendUserId } = await req.json();

    if (!friendUserId || !/^\S+$/.test(friendUserId)) {
      return NextResponse.json({ error: "잘못된 아이디" }, { status: 400 });
    }

    // 본인 확인
    const me = await prisma.user.findUnique({ where: { id: loginUserId } });
    if (me?.userId === friendUserId) {
      return NextResponse.json({ error: "본인은 친구로 추가할 수 없습니다." }, { status: 400 });
    }

    // 친구 존재 확인
    const target = await prisma.user.findUnique({ where: { userId: friendUserId } });
    if (!target) {
      return NextResponse.json({ error: "존재하지 않는 아이디입니다." }, { status: 400 });
    }

    // 이미 친구인지 확인
    const exists = await prisma.friend.findFirst({
      where: { ownerId: loginUserId, friendId: target.id },
    });
    if (exists) {
      return NextResponse.json({ error: "이미 친구입니다." }, { status: 400 });
    }

    // 친구 추가 (order는 맨 뒤)
    const maxOrder = (await prisma.friend.findFirst({
      where: { ownerId: loginUserId },
      orderBy: { order: "desc" },
    }))?.order ?? 0;

    await prisma.friend.create({
      data: { ownerId: loginUserId, friendId: target.id, order: maxOrder + 1 },
    });

    const list = await prisma.friend.findMany({
      where: { ownerId: loginUserId },
      include: { friend: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ friends: list.map(f => f.friend.userId) });
  } catch (e) {
    console.error("POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: 친구 삭제
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    const loginUserId = Number(session.user.id);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const target = await prisma.user.findUnique({ where: { userId: id } });
    if (!target) return NextResponse.json({ error: "존재하지 않는 아이디입니다." }, { status: 400 });

    await prisma.friend.deleteMany({ where: { ownerId: loginUserId, friendId: target.id } });

    const list = await prisma.friend.findMany({
      where: { ownerId: loginUserId },
      include: { friend: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ friends: list.map(f => f.friend.userId) });
  } catch (e) {
    console.error("DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: 친구 순서 업데이트
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

    const loginUserId = Number(session.user.id);
    const { orderedFriends } = await req.json(); // ["id1","id2",...]

    for (let i = 0; i < orderedFriends.length; i++) {
      const userId = orderedFriends[i];
      const friend = await prisma.user.findUnique({ where: { userId } });
      if (friend) {
        await prisma.friend.updateMany({
          where: { ownerId: loginUserId, friendId: friend.id },
          data: { order: i },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
