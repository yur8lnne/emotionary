import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * POST /api/diary/write
 * body: { content, date, emoji }
 *
 * - userId는 body에서 받지 않고, 로그인 세션(req.user.id)로 강제합니다.
 * - Diary 생성 + Emotion 생성은 transaction으로 묶어서 원자적으로 처리합니다.
 */
router.post("/", requireAuth, async (req, res) => {
  console.log("✅ HIT DIARY WRITE POST (Express)", req.body);

  try {
    const loginUserId = Number((req as any).user.id);

    const { content, date, emoji } = req.body ?? {};

    if (!content || !date || !emoji) {
      return res.status(400).json({
        message: "필수 값 누락: content, date, emoji 모두 필요",
      });
    }

    const diaryDate = new Date(date);
    if (isNaN(diaryDate.getTime())) {
      return res.status(400).json({ message: "date 형식이 올바르지 않습니다." });
    }

    // ✅ Diary + Emotion을 한 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1) 일기 생성
      const diary = await tx.diary.create({
        data: {
          userId: loginUserId,
          content,
          date: diaryDate,
        },
      });

      // 2) 이모티콘 저장(Emotion)
      await tx.emotion.create({
        data: {
          icon: emoji,
          date: diaryDate,
          user: { connect: { id: loginUserId } },
          diary: { connect: { id: diary.id } },
        },
      });

      return diary;
    });

    return res.status(201).json({
      message: "일기 & 이모티콘 저장 성공!",
      diary: result,
    });
  } catch (error: any) {
    console.error("💥 DIARY WRITE ERROR 💥", error);
    return res.status(500).json({
      message: "일기 저장 실패",
      error: error?.message ?? String(error),
    });
  }
});

export default router;
