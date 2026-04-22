import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";

import { generateToken, AuthenticatedRequest } from "../../shared/middlewares/auth";
import { sendSuccess, sendError, sendServerError } from "../../shared/utils/response";

/* ───────────────────────────────────────────────────────────────
   TYPES
─────────────────────────────────────────────────────────────── */

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

/* ───────────────────────────────────────────────────────────────
   DATABASE (IN MEMORY)
─────────────────────────────────────────────────────────────── */

const db = {
  users: new Map<string, User>(),
};

/* ───────────────────────────────────────────────────────────────
   REPOSITORY
─────────────────────────────────────────────────────────────── */

export class UserRepository {
  findById(id: string): User | null {
    return db.users.get(id) ?? null;
  }

  findByEmail(email: string): User | null {
    return (
      Array.from(db.users.values()).find(
        (u) => u.email === email
      ) ?? null
    );
  }

  save(user: User): User {
    db.users.set(user.id, user);
    return user;
  }
}

export const userRepository = new UserRepository();

/* ───────────────────────────────────────────────────────────────
   SERVICE
─────────────────────────────────────────────────────────────── */

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: Omit<User, "passwordHash">;
}

// ⚠️ simples (em produção usar bcrypt)
function simpleHash(password: string): string {
  return Buffer.from(password + "precozap_salt").toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash;
}

export class UserService {
  register(input: RegisterInput): AuthResult {
    const email = input.email.toLowerCase().trim();

    const existing = userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const user: User = {
      id: randomUUID(), // ✅ CORRIGIDO
      email,
      name: input.name.trim(),
      passwordHash: simpleHash(input.password),
      createdAt: new Date().toISOString(),
    };

    userRepository.save(user);

    const token = generateToken({ userId: user.id, email: user.email });

    const { passwordHash: _, ...safeUser } = user;

    return { token, user: safeUser };
  }

  login(input: LoginInput): AuthResult {
    const email = input.email.toLowerCase().trim();

    const user = userRepository.findByEmail(email);

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const { passwordHash: _, ...safeUser } = user;

    return { token, user: safeUser };
  }

  demoLogin(): AuthResult {
    const email = "demo@precozap.com";

    let demoUser = userRepository.findByEmail(email);

    if (!demoUser) {
      return this.register({
        name: "Usuário Demo",
        email,
        password: "demo123",
      });
    }

    const token = generateToken({
      userId: demoUser.id,
      email: demoUser.email,
    });

    const { passwordHash: _, ...safeUser } = demoUser;

    return { token, user: safeUser };
  }

  getProfile(userId: string): Omit<User, "passwordHash"> | null {
    const user = userRepository.findById(userId);

    if (!user) return null;

    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  }
}

export const userService = new UserService();

/* ───────────────────────────────────────────────────────────────
   CONTROLLER
─────────────────────────────────────────────────────────────── */

export class UserController {
  register(req: Request, res: Response): void {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return sendError(res, "name, email and password are required");
      }

      if (password.length < 6) {
        return sendError(res, "Password must be at least 6 characters");
      }

      const result = userService.register({ name, email, password });

      sendSuccess(res, result, undefined, 201);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("already registered")
      ) {
        return sendError(res, error.message, 409);
      }

      sendServerError(res, error);
    }
  }

  login(req: Request, res: Response): void {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, "email and password are required");
      }

      const result = userService.login({ email, password });

      sendSuccess(res, result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Invalid credentials")
      ) {
        return sendError(res, error.message, 401);
      }

      sendServerError(res, error);
    }
  }

  demoLogin(_req: Request, res: Response): void {
    try {
      const result = userService.demoLogin();

      sendSuccess(res, result);
    } catch (error) {
      sendServerError(res, error);
    }
  }

  getProfile(req: AuthenticatedRequest, res: Response): void {
    try {
      const profile = userService.getProfile(req.user!.userId);

      if (!profile) {
        return sendError(res, "User not found", 404);
      }

      sendSuccess(res, profile);
    } catch (error) {
      sendServerError(res, error);
    }
  }
}

export const userController = new UserController();

/* ───────────────────────────────────────────────────────────────
   ROUTES
─────────────────────────────────────────────────────────────── */

import { requireAuth } from "../../shared/middlewares/auth";

const userRouter = Router();

userRouter.post("/register", userController.register.bind(userController));
userRouter.post("/login", userController.login.bind(userController));
userRouter.post("/demo", userController.demoLogin.bind(userController));
userRouter.get("/profile", requireAuth, userController.getProfile.bind(userController));

export default userRouter;