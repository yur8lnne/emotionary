import { Router } from "express";

import diaryRouter from "./diary.route";
import diaryWriteRouter from "./diaryWrite.route";
import friendsRouter from "./friends.route";
import authRouter from "./auth.route";
import registerRouter from "./register.route";
import loginRouter from "./login.route";

const router = Router();

router.use("/diary", diaryRouter);
router.use("/diaryWrite", diaryWriteRouter); 
router.use("/friends", friendsRouter);
router.use("/auth", authRouter);
router.use("/register", registerRouter);
router.use("/login", loginRouter);

export default router;
