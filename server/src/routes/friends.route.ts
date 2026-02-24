// server/src/routes/friends.route.ts
import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * GET /api/friends?type=detailed
 * - 기본: friends: ["friendUserId", ...]
 * - detailed: friends: [{ id, friendId, friendName }, ...]
 */
router.get("/", requireAuth, async (req, res) => {
  console.log("✅ HIT FRIENDS GET (Express)", req.originalUrl);

  try {
    const loginUserId = Number((req as any).user.id);
    const type = (req.query.type as string | undefined) ?? null;

    const list = await prisma.friend.findMany({
      where: { ownerId: loginUserId },
      include: { friend: true },
      orderBy: { order: "asc" },
    });

    if (type === "detailed") {
      return res.json({
        friends: list.map((f) => ({
          id: f.friend.id,
          friendId: f.friend.userId,
          friendName: f.friend.name,
        })),
      });
    }

    return res.json({ friends: list.map((f) => f.friend.userId) });
  } catch (e) {
    console.error("GET /friends error:", e);
    return res.json({ friends: [] });
  }
});

/**
 * POST /api/friends
 * body: { friendUserId: string }
 */
router.post("/", requireAuth, async (req, res) => {
  console.log("✅ HIT FRIENDS POST (Express)", req.body);

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

/**
 * DELETE /api/friends?id=<friendUserId>
 */
router.delete("/", requireAuth, async (req, res) => {
  console.log("✅ HIT FRIENDS DELETE (Express)", req.query);

  try {
    const loginUserId = Number((req as any).user.id);
    const id = req.query.id as string | undefined;

    if (!id) return res.status(400).json({ error: "Missing id" });

    const target = await prisma.user.findUnique({ where: { userId: id } });
    if (!target) return res.status(400).json({ error: "존재하지 않는 아이디입니다." });

    await prisma.friend.deleteMany({ where: { ownerId: loginUserId, friendId: target.id } });

    const list = await prisma.friend.findMany({
      where: { ownerId: loginUserId },
      include: { friend: true },
      orderBy: { order: "asc" },
    });

    return res.json({ friends: list.map((f) => f.friend.userId) });
  } catch (e) {
    console.error("DELETE /friends error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PATCH /api/friends
 * body: { orderedFriends: string[] }  // ["id1","id2",...]
 */
router.patch("/", requireAuth, async (req, res) => {
  console.log("✅ HIT FRIENDS PATCH (Express)", req.body);

  try {
    const loginUserId = Number((req as any).user.id);
    const { orderedFriends } = req.body ?? {};

    if (!Array.isArray(orderedFriends)) {
      return res.status(400).json({ error: "orderedFriends must be an array" });
    }

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

    return res.json({ success: true });
  } catch (e) {
    console.error("PATCH /friends error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
