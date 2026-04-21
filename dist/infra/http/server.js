"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("../../shared/config/env");
const logger_1 = require("../../shared/utils/logger");
const notifications_module_1 = require("../../modules/notifications/notifications.module");
// 🔥 Força aceitar localhost, 127.0.0.1 e rede local
const HOST = "0.0.0.0";
// 🚀 Start server
const server = app_1.default.listen(env_1.env.port, HOST, () => {
    logger_1.logger.info(`🚀 PreçoZap API running on http://localhost:${env_1.env.port}`);
    logger_1.logger.info(`🌍 Also accessible via http://127.0.0.1:${env_1.env.port}`);
    logger_1.logger.info(`📦 Environment: ${env_1.env.nodeEnv}`);
    logger_1.logger.info(`🌐 CORS allowed: ${env_1.env.frontendUrl}`);
    logger_1.logger.info(`🤖 AI: ${env_1.env.anthropicApiKey ? "Anthropic Claude" : "Mock Mode"}`);
    logger_1.logger.info(`📡 Endpoints:`);
    logger_1.logger.info(`   GET  /api/healthz`);
    logger_1.logger.info(`   GET  /api/products`);
    logger_1.logger.info(`   GET  /api/products/search?q=`);
    logger_1.logger.info(`   GET  /api/products/:id`);
    logger_1.logger.info(`   GET  /api/products/:id/compare`);
    logger_1.logger.info(`   GET  /api/products/:id/insights`);
    logger_1.logger.info(`   POST /api/products`);
    logger_1.logger.info(`   POST /api/auth/register`);
    logger_1.logger.info(`   POST /api/auth/login`);
    logger_1.logger.info(`   POST /api/auth/demo`);
    logger_1.logger.info(`   GET  /api/favorites (auth required)`);
    logger_1.logger.info(`   POST /api/favorites (auth required)`);
    logger_1.logger.info(`   POST /api/ai/query`);
});
// 🔄 Background job (protegido contra crash)
const interval = setInterval(() => {
    try {
        logger_1.logger.debug("Running price alert check...");
        notifications_module_1.notificationService.checkPriceAlerts();
    }
    catch (error) {
        logger_1.logger.error("Error in price alert job:", error);
    }
}, 5 * 60 * 1000);
// 🛑 Graceful shutdown
const shutdown = (signal) => {
    logger_1.logger.info(`${signal} received, shutting down gracefully...`);
    clearInterval(interval);
    server.close(() => {
        logger_1.logger.info("Server closed.");
        process.exit(0);
    });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
// ⚠️ Tratamento de erros globais (evita crash silencioso)
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error("Unhandled rejection:", reason);
});
process.on("uncaughtException", (error) => {
    logger_1.logger.error("Uncaught exception:", error);
});
exports.default = server;
//# sourceMappingURL=server.js.map