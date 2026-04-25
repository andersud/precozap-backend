import {
  productRepository,
  ProductFilters,
  AddPriceDTO,
} from "./product.repository";

import { cacheService } from "../../shared/utils/cache";
import { env } from "../../shared/config/env";
import { logger } from "../../shared/utils/logger";

export interface ComparisonResult {
  product: any;
  bestDeal: any;
  worstDeal: any;
  savings: number;
  savingsPercent: number;
  recommendation: string;
  isFakePromotion: boolean;
}

export interface PriceInsight {
  currentBest: number;
  historicalMin: number;
  historicalMax: number;
  historicalAvg: number;
  isGoodDeal: boolean;
  priceTrend: "falling" | "rising" | "stable";
  prediction: string;
}

export class ProductService {
  // 🔥 CREATE (COM PROTEÇÃO DE DUPLICADOS)
  async create(data: any) {
    if (!data.name) {
      throw new Error("Product name is required");
    }

    const normalizedName = data.name.trim().toLowerCase();

    // 🔥 evita duplicados (MVP)
    const existing = await productRepository.search(normalizedName);

    if (existing.length > 0) {
      return existing[0];
    }

    return productRepository.save({
      name: data.name,
      category: data.category || "general",
      image: data.image ?? null,
      description: data.description ?? "",
      rating: 0,
      reviews: 0,
      bestPrice: 0,
    });
  }

  // 🔍 SEARCH (COM CACHE)
  async search(query: string, filters?: ProductFilters) {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;

    const cached = cacheService.get<any[]>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return cached;
    }

    const results = await productRepository.search(query, filters);

    cacheService.set(cacheKey, results, env.cache.ttlSearch);

    return results;
  }

  // 🔍 GET ALL
  async findAll(filters?: ProductFilters) {
    return productRepository.findAll(filters);
  }

  // 🔍 GET BY ID (COM CACHE)
  async findById(id: string) {
    const cacheKey = `product:${id}`;

    const cached = cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const product = await productRepository.findByIdWithRelations(id);

    if (product) {
      cacheService.set(cacheKey, product, env.cache.ttlProducts);
    }

    return product;
  }

  // 📦 CATEGORIES
  async getCategories() {
    return productRepository.getCategories();
  }

  // 💰 ADD PRICE (COM INVALIDAÇÃO DE CACHE SEGURA)
  async addPrice(data: AddPriceDTO) {
    const result = await productRepository.addPrice(data);

    // 🔥 invalida cache do produto
    if (typeof (cacheService as any).delete === "function") {
      (cacheService as any).delete(`product:${data.productId}`);
    }

    return result;
  }

  // 📊 COMPARE
  async compareProduct(id: string): Promise<ComparisonResult | null> {
    const product = await this.findById(id);

    if (!product || !product.prices?.length) return null;

    const sorted = [...product.prices].sort(
      (a: any, b: any) => Number(a.price) - Number(b.price)
    );

    const bestDeal = sorted[0];
    const worstDeal = sorted[sorted.length - 1];

    const bestPrice = Number(bestDeal.price);
    const worstPrice = Number(worstDeal.price);

    const savings = worstPrice - bestPrice;

    const savingsPercent =
      worstPrice > 0 ? Math.round((savings / worstPrice) * 100) : 0;

    const isFakePromotion = this.detectFakePromotion(product);

    let recommendation = `Compre no ${bestDeal.marketplace} e economize R$ ${savings.toFixed(
      2
    )}`;

    if (isFakePromotion) {
      recommendation += "\n⚠️ Possível promoção falsa detectada.";
    }

    return {
      product,
      bestDeal,
      worstDeal,
      savings,
      savingsPercent,
      recommendation,
      isFakePromotion,
    };
  }

  // 📈 INSIGHTS
  async getPriceInsights(id: string): Promise<PriceInsight | null> {
    const product = await this.findById(id);

    if (!product || !product.priceHistory?.length) return null;

    const prices: number[] = product.priceHistory.map((h: any) =>
      Number(h.price)
    );

    const historicalMin = Math.min(...prices);
    const historicalMax = Math.max(...prices);

    const historicalAvg =
      prices.reduce((a: number, b: number) => a + b, 0) / prices.length;

    const currentBest = Number(product.bestPrice);

    const isGoodDeal = currentBest <= historicalAvg * 0.95;

    let priceTrend: "falling" | "rising" | "stable" = "stable";

    if (prices.length >= 2) {
      const last = prices[prices.length - 1];
      const prev = prices[prices.length - 2];

      if (last < prev) priceTrend = "falling";
      else if (last > prev) priceTrend = "rising";
    }

    return {
      currentBest,
      historicalMin,
      historicalMax,
      historicalAvg: Number(historicalAvg.toFixed(2)),
      isGoodDeal,
      priceTrend,
      prediction: isGoodDeal
        ? "🔥 Ótimo preço — abaixo da média histórica"
        : priceTrend === "falling"
        ? "📉 Tendência de queda — pode baixar mais"
        : "📊 Preço dentro do padrão",
    };
  }

  // 🧠 DETECTA PROMOÇÃO FALSA
  private detectFakePromotion(product: any): boolean {
    if (!product.priceHistory?.length) return false;

    const maxHistorical = Math.max(
      ...product.priceHistory.map((h: any) => Number(h.price))
    );

    return product.prices.some(
      (p: any) =>
        p.originalPrice &&
        Number(p.originalPrice) > maxHistorical * 1.5 &&
        p.discount &&
        p.discount > 40
    );
  }

  // 🖱️ TRACK CLICK
  async trackClick(
    productId: string,
    marketplace: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    logger.info("Click tracked", {
      productId,
      marketplace,
      userId,
      sessionId,
    });
  }
}

export const productService = new ProductService();