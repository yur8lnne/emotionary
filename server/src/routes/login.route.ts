import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    console.log("✅ HIT LOGIN (Express)");
    console.log("   body:", req.body);

    const { userId, password } = req.body ?? {};

    if (!userId || !password) {
      return res.status(400).json({ message: "ID와 비밀번호를 모두 입력해주세요." });
    }

    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: "존재하지 않는 ID입니다." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    return res.status(200).json({
      message: "로그인 성공",
      user: { id: user.id, userId: user.userId, name: user.name },
    });
  } catch (err) {
    console.error("로그인 에러:", err);
    return next(err);
  }
});

export default router;

/**
 * ✅ ts-node-dev / require 환경에서 default가 object로 감싸지는 문제를 막기 위한 CJS 호환 export
 * (이 줄이 핵심)
 */
declare const module: any;
module.exports = router;
module.exports.default = router;
