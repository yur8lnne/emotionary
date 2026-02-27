import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * DELETE /api/friends?id=<friendUserId>
 */
router.delete("/", requireAuth, async (req, res) => {
  console.log("✅ HIT REMOVE FRIEND DELETE (Express)", req.query);

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

export default router;
