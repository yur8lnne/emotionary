import type { Request, Response, NextFunction } from "express";

export default function notFound(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ message: `Not Found: ${req.method} ${req.originalUrl}` });
}
