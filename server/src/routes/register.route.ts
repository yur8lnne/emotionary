// server/src/routes/register.route.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma"; // 경로가 다르면 수정하세요

const router = Router();

router.get("/ping", (_req, res) => {
  res.json({ ok: true, from: "express", route: "/api/register/ping" });
});

/**
 * POST /api/register
 */
router.post("/", async (req, res, next) => {
  try {

    // express 확인
    //console.log("✅ HIT REGISTER (Express)");
    //console.log("   body:", req.body);


    const { userId, password, name, email, phone } = req.body ?? {};

    // 필수값 체크
    if (!userId || !password) {
      return res.status(400).json({ message: "필수 값 누락" });
    }

    // 중복 체크 (userId, email, phone)
    const existingUserId = await prisma.user.findUnique({ where: { userId } });
    if (existingUserId) {
      return res.status(409).json({ message: "이미 존재하는 ID입니다." });
    }

    if (email) {
      try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
          return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
        }
      } catch (e) {
        console.warn("이메일 중복 확인 중 경고:", e);
      }
    }

    if (phone) {
      try {
        const existingPhone = await prisma.user.findUnique({ where: { phone } });
        if (existingPhone) {
          return res.status(409).json({ message: "이미 존재하는 전화번호입니다." });
        }
      } catch (e) {
        console.warn("전화번호 중복 확인 중 경고:", e);
      }
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성
    const newUser = await prisma.user.create({
      data: {
        userId,
        password: hashedPassword,
        name: name || null,
        email: email || null,
        phone: phone || null,
      },
    });

    return res.status(201).json({ message: "회원가입 성공!", user: newUser });
  } catch (error: any) {
    console.error("회원가입 에러:", error);
    // 에러 미들웨어를 쓰고 있다면 next(error)로 넘겨도 됩니다.
    return res.status(500).json({ message: "회원가입 실패", error: error?.message ?? String(error) });
  }
});

export default router;
