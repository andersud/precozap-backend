import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/* ───────────────────────────────────────────────────────────────
   TYPES
─────────────────────────────────────────────────────────────── */

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/* ───────────────────────────────────────────────────────────────
   MIDDLEWARES
─────────────────────────────────────────────────────────────── */

// 🔓 AUTH OPCIONAL
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = decoded;
  } catch {
    // ignora erro (auth opcional)
  }

  next();
}

// 🔒 AUTH OBRIGATÓRIO
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = decoded;

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/* ───────────────────────────────────────────────────────────────
   TOKEN
─────────────────────────────────────────────────────────────── */

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}