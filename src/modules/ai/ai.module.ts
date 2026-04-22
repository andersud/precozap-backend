// ─── Service ─────────────────────────────────────────────────────────────────
import {
  AIProvider,
  AIQueryInput,
  AIQueryOutput,
  MockAIProvider,
  AnthropicAIProvider,
} from "../../infra/providers/aiProviders";

import { productRepository } from "../products/product.repository";
import { env } from "../../shared/config/env";
import { logger } from "../../shared/utils/logger";

import { Product } from "@prisma/client";

type AIResponse = AIQueryOutput & {
  relatedProducts: Product[];
};

class AIService {
  private provider: AIProvider;

  constructor() {
    if (env.anthropicApiKey) {
      this.provider = new AnthropicAIProvider(env.anthropicApiKey);
      logger.info("🤖 AI Provider: Anthropic Claude");
    } else {
      this.provider = new MockAIProvider();
      logger.info("🤖 AI Provider: Mock");
    }
  }

  async query(input: AIQueryInput): Promise<AIResponse> {
    // 🔥 CORREÇÃO: await obrigatório
    const allProducts = await productRepository.findAll();

    const enrichedInput: AIQueryInput = {
      ...input,
      context: {
        ...input.context,
        products: allProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          bestPrice: Number(p.bestPrice), // 🔥 Prisma Decimal → number
          rating: p.rating,
        })),
      },
    };

    const result = await this.provider.query(enrichedInput);

    let relatedProducts: Product[] = [];

    // 🔥 CASO 1: IA retornou IDs
    if (result.productIds?.length) {
      const products = await Promise.all(
        result.productIds.map((id) =>
          productRepository.findById(id)
        )
      );

      relatedProducts = products.filter(
        (p): p is Product => p !== null
      );
    }

    // 🔥 CASO 2: usar intenção (busca)
    else if (result.intent && result.intent !== "general") {
      const productsByIntent = await productRepository.search(result.intent);

      const topProducts = productsByIntent.slice(0, 3);

      const fullProducts = await Promise.all(
        topProducts.map((p) =>
          productRepository.findById(p.id)
        )
      );

      relatedProducts = fullProducts.filter(
        (p): p is Product => p !== null
      );
    }

    return {
      ...result,
      relatedProducts,
    };
  }

  getProviderInfo(): { name: string; isReal: boolean } {
    return {
      name: env.anthropicApiKey ? "Anthropic Claude" : "Mock AI",
      isReal: Boolean(env.anthropicApiKey),
    };
  }
}

export const aiService = new AIService();

// ─── Controller ──────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import {
  sendSuccess,
  sendError,
  sendServerError,
} from "../../shared/utils/response";

export class AIController {
  async query(req: Request, res: Response): Promise<void> {
    try {
      const { message, conversationHistory } = req.body;

      if (!message || typeof message !== "string" || message.trim().length < 3) {
        sendError(res, "Message must be at least 3 characters");
        return;
      }

      if (message.trim().length > 500) {
        sendError(res, "Message too long (max 500 characters)");
        return;
      }

      const result = await aiService.query({
        message: message.trim(),
        conversationHistory: conversationHistory || [],
      });

      sendSuccess(res, result);
    } catch (error) {
      logger.error("AI query failed", error);
      sendServerError(res, error);
    }
  }

  getStatus(_req: Request, res: Response): void {
    sendSuccess(res, aiService.getProviderInfo());
  }
}

export const aiController = new AIController();

// ─── Routes ──────────────────────────────────────────────────────────────────
import { Router } from "express";
import rateLimit from "express-rate-limit";

const aiRouter = Router();

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Too many AI requests, please try again in a minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

aiRouter.post("/query", aiRateLimit, aiController.query.bind(aiController));
aiRouter.get("/status", aiController.getStatus.bind(aiController));

export default aiRouter;