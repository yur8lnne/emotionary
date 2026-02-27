import { Router } from "express";

import diaryRouter from "./diary.route";
import diaryWriteRouter from "./diaryWrite.route";
import diaryLikeRouter from "./diaryLike.route";
import listFriendsRouter from "./listFriends.route";
import addFriendRouter from "./addFriend.route";
import removeFriendRouter from "./removeFriend.route";
import reorderFriendsRouter from "./reorderFriends.route";
import authRouter from "./auth.route";
import registerRouter from "./register.route";
import loginRouter from "./login.route";

const router = Router();

router.use("/diary", diaryRouter);
router.use("/diaryWrite", diaryWriteRouter);
router.use("/diaryLike", diaryLikeRouter);
router.use("/friends", listFriendsRouter);
router.use("/friends", addFriendRouter);
router.use("/friends", removeFriendRouter);
router.use("/friends", reorderFriendsRouter);
router.use("/auth", authRouter);
router.use("/register", registerRouter);
router.use("/login", loginRouter);

export default router;
