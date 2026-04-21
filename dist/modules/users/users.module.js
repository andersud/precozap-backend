"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = exports.userService = exports.UserService = exports.userRepository = exports.UserRepository = void 0;
const db = {
    users: new Map()
};
class UserRepository {
    findById(id) {
        return db.users.get(id) ?? null;
    }
    findByEmail(email) {
        return Array.from(db.users.values()).find((u) => u.email === email) ?? null;
    }
    save(user) {
        db.users.set(user.id, user);
        return user;
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
// ─── Service ─────────────────────────────────────────────────────────────────
const auth_1 = require("../../shared/middlewares/auth");
// Simplified hash (in production, use bcrypt)
function simpleHash(password) {
    return Buffer.from(password + "precozap_salt").toString("base64");
}
function verifyPassword(password, hash) {
    return simpleHash(password) === hash;
}
class UserService {
    register(input) {
        const existing = exports.userRepository.findByEmail(input.email);
        if (existing) {
            throw new Error("Email already registered");
        }
        const user = {
            id: db.generateId(),
            email: input.email.toLowerCase().trim(),
            name: input.name.trim(),
            passwordHash: simpleHash(input.password),
            createdAt: new Date().toISOString(),
        };
        exports.userRepository.save(user);
        const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email });
        const { passwordHash: _, ...safeUser } = user;
        return { token, user: safeUser };
    }
    login(input) {
        const user = exports.userRepository.findByEmail(input.email.toLowerCase());
        if (!user || !verifyPassword(input.password, user.passwordHash)) {
            throw new Error("Invalid credentials");
        }
        const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email });
        const { passwordHash: _, ...safeUser } = user;
        return { token, user: safeUser };
    }
    // Demo login (no password required)
    demoLogin() {
        const demoUser = exports.userRepository.findByEmail("demo@precozap.com");
        if (!demoUser) {
            return this.register({
                name: "Usuário Demo",
                email: "demo@precozap.com",
                password: "demo123",
            });
        }
        const token = (0, auth_1.generateToken)({ userId: demoUser.id, email: demoUser.email });
        const { passwordHash: _, ...safeUser } = demoUser;
        return { token, user: safeUser };
    }
    getProfile(userId) {
        const user = exports.userRepository.findById(userId);
        if (!user)
            return null;
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
const response_1 = require("../../shared/utils/response");
class UserController {
    register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                (0, response_1.sendError)(res, "name, email and password are required");
                return;
            }
            if (password.length < 6) {
                (0, response_1.sendError)(res, "Password must be at least 6 characters");
                return;
            }
            const result = exports.userService.register({ name, email, password });
            (0, response_1.sendSuccess)(res, result, undefined, 201);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("already registered")) {
                (0, response_1.sendError)(res, error.message, 409);
                return;
            }
            (0, response_1.sendServerError)(res, error);
        }
    }
    login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                (0, response_1.sendError)(res, "email and password are required");
                return;
            }
            const result = exports.userService.login({ email, password });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Invalid credentials")) {
                (0, response_1.sendError)(res, error.message, 401);
                return;
            }
            (0, response_1.sendServerError)(res, error);
        }
    }
    demoLogin(_req, res) {
        try {
            const result = exports.userService.demoLogin();
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    getProfile(req, res) {
        try {
            const profile = exports.userService.getProfile(req.user.userId);
            if (!profile) {
                (0, response_1.sendError)(res, "User not found", 404);
                return;
            }
            (0, response_1.sendSuccess)(res, profile);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
// ─── Routes ──────────────────────────────────────────────────────────────────
const express_1 = require("express");
const auth_2 = require("../../shared/middlewares/auth");
const userRouter = (0, express_1.Router)();
userRouter.post("/register", exports.userController.register.bind(exports.userController));
userRouter.post("/login", exports.userController.login.bind(exports.userController));
userRouter.post("/demo", exports.userController.demoLogin.bind(exports.userController));
userRouter.get("/profile", auth_2.requireAuth, exports.userController.getProfile.bind(exports.userController));
exports.default = userRouter;
//# sourceMappingURL=users.module.js.map