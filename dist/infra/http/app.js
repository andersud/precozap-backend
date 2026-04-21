"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../../shared/config/env");
const errorHandler_1 = require("../../shared/middlewares/errorHandler");
const logger_1 = require("../../shared/utils/logger");
// Routes
const product_routes_1 = __importDefault(require("../../modules/products/product.routes"));
const favorites_module_1 = __importDefault(require("../../modules/favorites/favorites.module"));
const users_module_1 = __importDefault(require("../../modules/users/users.module"));
const ai_module_1 = __importDefault(require("../../modules/ai/ai.module"));
const notifications_module_1 = __importDefault(require("../../modules/notifications/notifications.module"));
const app = (0, express_1.default)();
// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [env_1.env.frontendUrl, "http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Logging ─────────────────────────────────────────────────────────────────
app.use((0, morgan_1.default)(env_1.env.isDev ? "dev" : "combined", {
    stream: { write: (msg) => logger_1.logger.info(msg.trim()) },
}));
// ─── Global Rate Limit ────────────────────────────────────────────────────────
const globalLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, error: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimit);
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/healthz", (_req, res) => {
    res.json({
        success: true,
        data: {
            status: "ok",
            service: "PreçoZap API",
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/products", product_routes_1.default);
app.use("/api/favorites", favorites_module_1.default);
app.use("/api/auth", users_module_1.default);
app.use("/api/ai", ai_module_1.default);
app.use("/api/notifications", notifications_module_1.default);
// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map