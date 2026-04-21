"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const product_repository_1 = require("./product.repository");
const cache_1 = require("../../shared/utils/cache");
const env_1 = require("../../shared/config/env");
const logger_1 = require("../../shared/utils/logger");
class ProductService {
    // 🔥 CREATE
    async create(data) {
        if (!data.name) {
            throw new Error("Product name is required");
        }
        return product_repository_1.productRepository.save({
            name: data.name,
            category: data.category || "general",
            image: data.image ?? null,
            description: data.description ?? "",
            rating: 0,
            reviews: 0,
            bestPrice: 0,
        });
    }
    // 🔍 SEARCH
    async search(query, filters) {
        const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
        const cached = cache_1.cacheService.get(cacheKey);
        if (cached) {
            logger_1.logger.debug(`Cache hit: ${cacheKey}`);
            return cached;
        }
        const results = await product_repository_1.productRepository.search(query, filters);
        cache_1.cacheService.set(cacheKey, results, env_1.env.cache.ttlSearch);
        return results;
    }
    // 🔍 GET ALL
    async findAll(filters) {
        return product_repository_1.productRepository.findAll(filters);
    }
    // 🔍 GET BY ID (COM RELAÇÕES)
    async findById(id) {
        const cacheKey = `product:${id}`;
        const cached = cache_1.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const product = await product_repository_1.productRepository.findByIdWithRelations(id);
        if (product) {
            cache_1.cacheService.set(cacheKey, product, env_1.env.cache.ttlProducts);
        }
        return product;
    }
    // 📦 CATEGORIES
    async getCategories() {
        return product_repository_1.productRepository.getCategories();
    }
    // 💰 ADD PRICE (🔥 NOVO PADRÃO)
    async addPrice(data) {
        return product_repository_1.productRepository.addPrice(data);
    }
    // 📊 COMPARE PRODUCT
    async compareProduct(id) {
        const product = await this.findById(id);
        if (!product || !product.prices?.length)
            return null;
        const sorted = [...product.prices].sort((a, b) => a.price - b.price);
        const bestDeal = sorted[0];
        const worstDeal = sorted[sorted.length - 1];
        const savings = worstDeal.price - bestDeal.price;
        const savingsPercent = Math.round((savings / worstDeal.price) * 100);
        const isFakePromotion = this.detectFakePromotion(product);
        let recommendation = `Compre no ${bestDeal.marketplace} e economize R$ ${savings.toFixed(2)}`;
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
    // 📈 PRICE INSIGHTS (🔥 MELHORADO)
    async getPriceInsights(id) {
        const product = await this.findById(id);
        if (!product || !product.priceHistory?.length)
            return null;
        const prices = product.priceHistory.map((h) => h.price);
        const historicalMin = Math.min(...prices);
        const historicalMax = Math.max(...prices);
        const historicalAvg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const currentBest = product.bestPrice;
        const isGoodDeal = currentBest <= historicalAvg * 0.95;
        // 🔥 DETECTAR TENDÊNCIA
        let priceTrend = "stable";
        if (prices.length >= 3) {
            const last = prices[prices.length - 1];
            const prev = prices[prices.length - 2];
            if (last < prev)
                priceTrend = "falling";
            else if (last > prev)
                priceTrend = "rising";
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
    // 🧠 DETECT FAKE PROMOTION
    detectFakePromotion(product) {
        if (!product.priceHistory?.length)
            return false;
        const maxHistorical = Math.max(...product.priceHistory.map((h) => h.price));
        return product.prices.some((p) => p.originalPrice &&
            p.originalPrice > maxHistorical * 1.5 &&
            p.discount &&
            p.discount > 40);
    }
    // 🖱️ TRACK CLICK
    async trackClick(productId, marketplace, userId, sessionId) {
        logger_1.logger.info("Click tracked", {
            productId,
            marketplace,
            userId,
            sessionId,
        });
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
//# sourceMappingURL=product.service.js.map