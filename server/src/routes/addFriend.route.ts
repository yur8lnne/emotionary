import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * POST /api/friends
 * body: { friendUserId: string }
 */
router.post("/", requireAuth, async (req, res) => {
  console.log("✅ HIT ADD FRIEND POST (Express)", req.body);

  try {
    const loginUserId = Number((req as any).user.id);
    const { friendUserId } = req.body ?? {};

    if (!friendUserId || !/^\S+$/.test(friendUserId)) {
      return res.status(400).json({ error: "잘못된 아이디" });
    }

    // 본인 확인
    const me = await prisma.user.findUnique({ where: { id: loginUserId } });
    if (me?.userId === friendUserId) {
      return res.status(400).json({ error: "본인은 친구로 추가할 수 없습니다." });
    }

    // 친구 존재 확인
    const target = await prisma.user.findUnique({ where: { userId: friendUserId } });
    if (!target) {
      return res.status(400).json({ error: "존재하지 않는 아이디입니다." });
    }

    // 이미 친구인지 확인
    const exists = await prisma.friend.findFirst({
      where: { ownerId: loginUserId, friendId: target.id },
    });
    if (exists) {
      return res.status(400).json({ error: "이미 친구입니다." });
    }

    // 친구 추가 (order는 맨 뒤)
    const maxOrder =
      (
        await prisma.friend.findFirst({
          where: { ownerId: loginUserId },
          orderBy: { order: "desc" },
        })
      )?.order ?? 0;

    await prisma.friend.create({
      data: { ownerId: loginUserId, friendId: target.id, order: maxOrder + 1 },
    });

    const list = await prisma.friend.findMany({
      where: { ownerId: loginUserId },
      include: { friend: true },
      orderBy: { order: "asc" },
    });

    return res.json({ friends: list.map((f) => f.friend.userId) });
  } catch (e) {
    console.error("POST /friends error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
