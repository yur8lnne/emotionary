import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * PATCH /api/friends
 * body: { orderedFriends: string[] }  // ["id1","id2",...]
 */
router.patch("/", requireAuth, async (req, res) => {
  console.log("✅ HIT REORDER FRIENDS PATCH (Express)", req.body);

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
