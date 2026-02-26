import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    console.log("✅ HIT DIARY LIKE POST (Express)", req.body);
    const { diaryId, userId } = req.body;

    if (!diaryId || !userId) {
      return res.status(400).json({
        message: "필수 값 누락: diaryId, userId 모두 필요",
      });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        diaryId: Number(diaryId),
        userId: Number(userId),
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return res.status(200).json({
        message: "좋아요 삭제 성공!",
        liked: false,
      });
    }

    await prisma.like.create({
      data: {
        diary: { connect: { id: Number(diaryId) } },
        user: { connect: { id: Number(userId) } },
      },
    });

    return res.status(201).json({
      message: "좋아요 저장 성공!",
      liked: true,
    });
  } catch (error: any) {
    console.error("🔥 Prisma 좋아요 저장 에러 🔥", error);
    return res.status(500).json({
      message: "좋아요 저장 실패: Prisma 에러 발생",
      error: error.message,
    });
  }
});

export default router;
