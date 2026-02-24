import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * Next 코드가 date를 "하루 단위"로 쓰는 패턴이라,
 * POST에서도 YYYY-MM-DD 형태면 UTC 자정으로 정규화해줍니다.
 */
function toDiaryDate(input: any): Date | null {
  if (typeof input !== "string") return null;

  // "2026-02-18" 형태면 UTC 자정으로 맞춤
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const d = new Date(`${input}T00:00:00.000Z`);
    return isNaN(d.getTime()) ? null : d;
  }

  // ISO 문자열 등 일반 Date 파싱
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * GET /api/diary?date=YYYY-MM-DD&friendUserId=<number?>
 *
 * - Next 코드와 동일하게 해당 날짜(UTC) 범위에서 diary 1개 조회
 * - friendUserId가 있으면 그 사람(userId=int)의 다이어리를 조회, 없으면 내 것 조회
 */
router.get("/", requireAuth, async (req, res) => {
  console.log("✅ HIT DIARY GET (Express)", req.originalUrl);

  try {
    const loginUserId = Number((req as any).user.id);

    const date = req.query.date as string | undefined;
    const yearParam = req.query.year as string | undefined;
    const monthParam = req.query.month as string | undefined;
    const friendUserId = req.query.friendUserId as string | undefined;

    if (!date && (!yearParam || !monthParam)) {
      return res
        .status(400)
        .json({ error: "date or year/month is required" });
    }

    const ownerId = friendUserId ? Number(friendUserId) : loginUserId;

    if (yearParam && monthParam && !date) {
      const year = Number(yearParam);
      const month = Number(monthParam);

      if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "invalid year/month" });
      }

      const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

      const diaries = await prisma.diary.findMany({
        where: {
          userId: ownerId,
          date: {
            gte: start,
            lt: end,
          },
        },
        select: {
          date: true,
        },
      });

      const diaryDates = diaries.map((d) => d.date.toISOString().slice(0, 10));

      return res.status(200).json({ diaryDates });
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "invalid date format" });
    }

    const diary = await prisma.diary.findFirst({
      where: {
        userId: ownerId,
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        emotions: true,
        likes: true,
      },
    });

    return res.status(200).json({ diary });
  } catch (err) {
    console.error("GET /diary error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
