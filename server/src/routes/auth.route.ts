import { Router } from "express";

const router = Router();

// GET /api/auth/ping
router.get("/ping", (_req, res) => {
  res.json({ ok: true, from: "express", route: "/api/auth/ping" });
});

export default router;
