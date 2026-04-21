import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "../../shared/config/env";
import {
  errorHandler,
  notFoundHandler,
} from "../../shared/middlewares/errorHandler";
import { logger } from "../../shared/utils/logger";

// Routes
import productRoutes from "../../modules/products/product.routes";
import favoriteRoutes from "../../modules/favorites/favorites.module";
import userRoutes from "../../modules/users/users.module";
import aiRoutes from "../../modules/ai/ai.module";
import notificationRoutes from "../../modules/notifications/notifications.module";

const app = express();

// ─── TRUST PROXY (🔥 ESSENCIAL PARA RENDER) ─────────────────────
app.set("trust proxy", 1);

// ─── SECURITY ───────────────────────────────────────────────────
app.use(helmet());

// ─── CORS (🔥 MAIS ROBUSTO) ─────────────────────────────────────
const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // mobile/postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS bloqueado: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ─── BODY PARSER ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── LOGGING ───────────────────────────────────────────────────
app.use(
  morgan(env.isDev ? "dev" : "combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// ─── RATE LIMIT ─────────────────────────────────────────────────
const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isDev ? 1000 : 300, // 🔥 mais permissivo em dev
  message: { success: false, error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimit);

// ─── HEALTH CHECK ───────────────────────────────────────────────
app.get("/api/healthz", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "PreçoZap API",
      version: "1.0.0",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ─── ROUTES ─────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);

// ─── 404 HANDLER ───────────────────────────────────────────────
app.use(notFoundHandler);

// ─── ERROR HANDLER ─────────────────────────────────────────────
app.use(errorHandler);

export default app;