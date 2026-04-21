"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceAggregator = exports.ShopeeProvider = exports.AmazonProvider = exports.MercadoLivreProvider = void 0;
// ─── MercadoLivre Provider ────────────────────────────────────────────────────
class MercadoLivreProvider {
    name = "Mercado Livre";
    async searchProducts(query, limit = 5) {
        // In production: call ML API https://api.mercadolibre.com/sites/MLB/search?q=
        await new Promise((r) => setTimeout(r, 50));
        return this.mockResults(query, limit);
    }
    async getProductDetails(externalId) {
        // In production: call https://api.mercadolibre.com/items/{externalId}
        await new Promise((r) => setTimeout(r, 50));
        return { id: externalId, bestMarketplace: this.name };
    }
    mockResults(query, limit) {
        const q = query.toLowerCase();
        return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
            externalId: `ML_${Date.now()}_${i}`,
            name: `${query} - Opção ${i + 1} (Mercado Livre)`,
            price: Math.round((Math.random() * 2000 + 500) * 100) / 100,
            originalPrice: Math.round((Math.random() * 3000 + 1000) * 100) / 100,
            discount: Math.floor(Math.random() * 35) + 5,
            image: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80`,
            url: `https://mercadolivre.com.br/search?q=${encodeURIComponent(q)}`,
            marketplace: this.name,
            rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
            shipping: i === 0 ? "Grátis" : `R$ ${(Math.random() * 20 + 5).toFixed(2)}`,
            inStock: Math.random() > 0.1,
        }));
    }
}
exports.MercadoLivreProvider = MercadoLivreProvider;
// ─── Amazon Provider ──────────────────────────────────────────────────────────
class AmazonProvider {
    name = "Amazon";
    async searchProducts(query, limit = 5) {
        // In production: use Amazon Product Advertising API
        await new Promise((r) => setTimeout(r, 50));
        return this.mockResults(query, limit);
    }
    async getProductDetails(externalId) {
        await new Promise((r) => setTimeout(r, 50));
        return { id: externalId, bestMarketplace: this.name };
    }
    mockResults(query, limit) {
        return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
            externalId: `AMZ_${Date.now()}_${i}`,
            name: `${query} - Opção ${i + 1} (Amazon)`,
            price: Math.round((Math.random() * 2000 + 500) * 100) / 100,
            originalPrice: Math.round((Math.random() * 3000 + 1000) * 100) / 100,
            discount: Math.floor(Math.random() * 30) + 5,
            image: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80`,
            url: `https://amazon.com.br/s?k=${encodeURIComponent(query)}`,
            marketplace: this.name,
            rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
            shipping: "Prime Grátis",
            inStock: Math.random() > 0.05,
        }));
    }
}
exports.AmazonProvider = AmazonProvider;
// ─── Shopee Provider ──────────────────────────────────────────────────────────
class ShopeeProvider {
    name = "Shopee";
    async searchProducts(query, limit = 5) {
        // In production: use Shopee Open API
        await new Promise((r) => setTimeout(r, 50));
        return this.mockResults(query, limit);
    }
    async getProductDetails(externalId) {
        await new Promise((r) => setTimeout(r, 50));
        return { id: externalId, bestMarketplace: this.name };
    }
    mockResults(query, limit) {
        return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
            externalId: `SHP_${Date.now()}_${i}`,
            name: `${query} - Opção ${i + 1} (Shopee)`,
            price: Math.round((Math.random() * 1800 + 400) * 100) / 100,
            originalPrice: Math.round((Math.random() * 2800 + 900) * 100) / 100,
            discount: Math.floor(Math.random() * 40) + 10,
            image: `https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80`,
            url: `https://shopee.com.br/search?keyword=${encodeURIComponent(query)}`,
            marketplace: this.name,
            rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
            shipping: Math.random() > 0.5 ? "Grátis" : `R$ ${(Math.random() * 15 + 5).toFixed(2)}`,
            inStock: Math.random() > 0.15,
        }));
    }
}
exports.ShopeeProvider = ShopeeProvider;
// ─── Aggregator ───────────────────────────────────────────────────────────────
class MarketplaceAggregator {
    providers;
    constructor(providers) {
        this.providers = providers;
    }
    async searchAll(query, limit = 3) {
        const results = await Promise.allSettled(this.providers.map((p) => p.searchProducts(query, limit)));
        return results
            .filter((r) => r.status === "fulfilled")
            .flatMap((r) => r.value)
            .sort((a, b) => a.price - b.price);
    }
}
exports.MarketplaceAggregator = MarketplaceAggregator;
//# sourceMappingURL=marketplaceProviders.js.map