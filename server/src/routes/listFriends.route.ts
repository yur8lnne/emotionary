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
  console.log("✅ HIT LIST FRIENDS GET (Express)", req.originalUrl);

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

export default router;
