import "module-alias/register"; // 🔥 CRÍTICO (senão quebra em produção)

import app from "./app";
import { env } from "../../shared/config/env";
import { logger } from "../../shared/utils/logger";
import { notificationService } from "../../modules/notifications/notifications.module";

// 🔥 HOST para produção
const HOST = "0.0.0.0";

// 🔥 PORTA segura (Render + fallback)
const PORT = process.env.PORT ? Number(process.env.PORT) : env.port;

// 🚀 Start server
const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 PreçoZap API running on port ${PORT}`);
  logger.info(`📦 Environment: ${env.nodeEnv}`);
  logger.info(`🌐 CORS allowed: ${env.frontendUrl}`);
  logger.info(
    `🤖 AI: ${env.anthropicApiKey ? "Anthropic Claude" : "Mock Mode"}`
  );

  logger.info(`📡 Endpoints disponíveis:`);
  logger.info(`   GET  /api/healthz`);
  logger.info(`   GET  /api/products`);
  logger.info(`   GET  /api/products?q=`);
  logger.info(`   GET  /api/products/:id`);
  logger.info(`   GET  /api/products/:id/compare`);
  logger.info(`   GET  /api/products/:id/insights`);
  logger.info(`   POST /api/products`);
  logger.info(`   POST /api/auth/register`);
  logger.info(`   POST /api/auth/login`);
  logger.info(`   POST /api/auth/demo`);
  logger.info(`   GET  /api/favorites (auth required)`);
  logger.info(`   POST /api/favorites (auth required)`);
  logger.info(`   POST /api/ai/query`);
});

// 🔄 Background job (🔥 só roda fora de test/dev opcional)
const interval =
  env.nodeEnv !== "test"
    ? setInterval(async () => {
        try {
          logger.debug("Running price alert check...");
          await notificationService.checkPriceAlerts();
        } catch (error) {
          logger.error("Error in price alert job:", error);
        }
      }, 5 * 60 * 1000)
    : null;

// 🛑 Graceful shutdown robusto
const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  if (interval) clearInterval(interval);

  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });

  // 🔥 fallback se travar
  setTimeout(() => {
    logger.error("Force shutdown");
    process.exit(1);
  }, 5000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ⚠️ Tratamento de erros globais
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  process.exit(1); // 🔥 evita estado inconsistente
});

export default server;