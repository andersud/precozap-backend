"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AIController = exports.aiService = void 0;
// ─── Service ─────────────────────────────────────────────────────────────────
const aiProviders_1 = require("../../infra/providers/aiProviders");
const product_repository_1 = require("../products/product.repository");
const env_1 = require("../../shared/config/env");
const logger_1 = require("../../shared/utils/logger");
class AIService {
    provider;
    constructor() {
        if (env_1.env.anthropicApiKey) {
            this.provider = new aiProviders_1.AnthropicAIProvider(env_1.env.anthropicApiKey);
            logger_1.logger.info("🤖 AI Provider: Anthropic Claude");
        }
        else {
            this.provider = new aiProviders_1.MockAIProvider();
            logger_1.logger.info("🤖 AI Provider: Mock (set ANTHROPIC_API_KEY for real AI)");
        }
    }
    async query(input) {
        const allProducts = product_repository_1.productRepository.findAll();
        const enrichedInput = {
            ...input,
            context: {
                ...input.context,
                products: allProducts.map((p) => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    brand: p.brand,
                    bestPrice: p.bestPrice,
                    bestMarketplace: p.bestMarketplace,
                    rating: p.rating,
                    tags: p.tags,
                })),
            },
        };
        const result = await this.provider.query(enrichedInput);
        // Search for related products based on AI response
        let relatedProducts = [];
        if (result.productIds && result.productIds.length > 0) {
            relatedProducts = result.productIds
                .map((id) => product_repository_1.productRepository.findById(id))
                .filter(Boolean);
        }
        else if (result.intent && result.intent !== "general") {
            relatedProducts = product_repository_1.productRepository
                .search(result.intent)
                .slice(0, 3)
                .map((p) => product_repository_1.productRepository.findById(p.id))
                .filter(Boolean);
        }
        return { ...result, relatedProducts };
    }
    getProviderInfo() {
        return {
            name: env_1.env.anthropicApiKey ? "Anthropic Claude" : "Mock AI",
            isReal: Boolean(env_1.env.anthropicApiKey),
        };
    }
}
exports.aiService = new AIService();
const response_1 = require("../../shared/utils/response");
class AIController {
    async query(req, res) {
        try {
            const { message, conversationHistory } = req.body;
            if (!message || typeof message !== "string" || message.trim().length < 3) {
                (0, response_1.sendError)(res, "Message must be at least 3 characters");
                return;
            }
            if (message.trim().length > 500) {
                (0, response_1.sendError)(res, "Message too long (max 500 characters)");
                return;
            }
            const result = await exports.aiService.query({
                message: message.trim(),
                conversationHistory: conversationHistory || [],
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            logger_1.logger.error("AI query failed", error);
            (0, response_1.sendServerError)(res, error);
        }
    }
    getStatus(_req, res) {
        (0, response_1.sendSuccess)(res, exports.aiService.getProviderInfo());
    }
}
exports.AIController = AIController;
exports.aiController = new AIController();
// ─── Routes ──────────────────────────────────────────────────────────────────
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const aiRouter = (0, express_1.Router)();
const aiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, error: "Too many AI requests, please try again in a minute" },
    standardHeaders: true,
    legacyHeaders: false,
});
aiRouter.post("/query", aiRateLimit, exports.aiController.query.bind(exports.aiController));
aiRouter.get("/status", exports.aiController.getStatus.bind(exports.aiController));
exports.default = aiRouter;
//# sourceMappingURL=ai.module.js.map