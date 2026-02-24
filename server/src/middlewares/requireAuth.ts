import type { Request, Response, NextFunction } from "express";

type NextAuthSession = {
  user?: { id?: string | number; userId?: string; name?: string; email?: string | null };
  expires?: string;
};

async function fetchNextAuthSession(req: Request): Promise<NextAuthSession | null> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookie = req.headers.cookie ?? "";

  if (!cookie) return null;

  const r = await fetch(`${base}/api/auth/session`, {
    method: "GET",
    headers: { cookie }, // ✅ 쿠키를 NextAuth로 전달
  });

  if (!r.ok) return null;

  const data = (await r.json().catch(() => null)) as NextAuthSession | null;
  if (!data?.user?.id) return null;

  return data;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await fetchNextAuthSession(req);

    if (!session?.user?.id) {
      return res.status(401).json({ error: "로그인 필요" });
    }

    (req as any).user = session.user;
    return next();
  } catch (err) {
    console.error("[requireAuth] error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
