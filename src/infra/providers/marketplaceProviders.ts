// ─── Tipos locais ─────────────────────────────────────────────

export interface Product {
  id: string;
  name?: string;
  bestMarketplace?: string;
}

// ─── Interfaces principais ───────────────────────────────────

export interface MarketplaceSearchResult {
  externalId: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  url: string;
  marketplace: string;
  rating: number;
  shipping: string;
  inStock: boolean;
}

export interface MarketplaceProvider {
  name: string;
  searchProducts(query: string, limit?: number): Promise<MarketplaceSearchResult[]>;
  getProductDetails(externalId: string): Promise<Partial<Product> | null>;
}

// ─── Utils ───────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ─── Mercado Livre ───────────────────────────────────────────

export class MercadoLivreProvider implements MarketplaceProvider {
  name = "Mercado Livre";

  async searchProducts(query: string, limit = 5): Promise<MarketplaceSearchResult[]> {
    await new Promise((r) => setTimeout(r, 50));
    return this.mockResults(query, limit);
  }

  async getProductDetails(externalId: string): Promise<Partial<Product> | null> {
    await new Promise((r) => setTimeout(r, 50));
    return { id: externalId, bestMarketplace: this.name };
  }

  private mockResults(query: string, limit: number): MarketplaceSearchResult[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      externalId: generateId("ML"),
      name: `${query} - Opção ${i + 1} (Mercado Livre)`,
      price: Number((Math.random() * 2000 + 500).toFixed(2)),
      originalPrice: Number((Math.random() * 3000 + 1000).toFixed(2)),
      discount: Math.floor(Math.random() * 35) + 5,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
      url: `https://mercadolivre.com.br/search?q=${encodeURIComponent(query)}`,
      marketplace: this.name,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      shipping: i === 0 ? "Grátis" : `R$ ${(Math.random() * 20 + 5).toFixed(2)}`,
      inStock: Math.random() > 0.1,
    }));
  }
}

// ─── Amazon ──────────────────────────────────────────────────

export class AmazonProvider implements MarketplaceProvider {
  name = "Amazon";

  async searchProducts(query: string, limit = 5): Promise<MarketplaceSearchResult[]> {
    await new Promise((r) => setTimeout(r, 50));
    return this.mockResults(query, limit);
  }

  async getProductDetails(externalId: string): Promise<Partial<Product> | null> {
    await new Promise((r) => setTimeout(r, 50));
    return { id: externalId, bestMarketplace: this.name };
  }

  private mockResults(query: string, limit: number): MarketplaceSearchResult[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      externalId: generateId("AMZ"),
      name: `${query} - Opção ${i + 1} (Amazon)`,
      price: Number((Math.random() * 2000 + 500).toFixed(2)),
      originalPrice: Number((Math.random() * 3000 + 1000).toFixed(2)),
      discount: Math.floor(Math.random() * 30) + 5,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
      url: `https://amazon.com.br/s?k=${encodeURIComponent(query)}`,
      marketplace: this.name,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      shipping: "Prime Grátis",
      inStock: Math.random() > 0.05,
    }));
  }
}

// ─── Shopee ──────────────────────────────────────────────────

export class ShopeeProvider implements MarketplaceProvider {
  name = "Shopee";

  async searchProducts(query: string, limit = 5): Promise<MarketplaceSearchResult[]> {
    await new Promise((r) => setTimeout(r, 50));
    return this.mockResults(query, limit);
  }

  async getProductDetails(externalId: string): Promise<Partial<Product> | null> {
    await new Promise((r) => setTimeout(r, 50));
    return { id: externalId, bestMarketplace: this.name };
  }

  private mockResults(query: string, limit: number): MarketplaceSearchResult[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      externalId: generateId("SHP"),
      name: `${query} - Opção ${i + 1} (Shopee)`,
      price: Number((Math.random() * 1800 + 400).toFixed(2)),
      originalPrice: Number((Math.random() * 2800 + 900).toFixed(2)),
      discount: Math.floor(Math.random() * 40) + 10,
      image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80",
      url: `https://shopee.com.br/search?keyword=${encodeURIComponent(query)}`,
      marketplace: this.name,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      shipping: Math.random() > 0.5 ? "Grátis" : `R$ ${(Math.random() * 15 + 5).toFixed(2)}`,
      inStock: Math.random() > 0.15,
    }));
  }
}

// ─── Aggregator ──────────────────────────────────────────────

export class MarketplaceAggregator {
  constructor(private providers: MarketplaceProvider[]) {}

  async searchAll(query: string, limit = 3): Promise<MarketplaceSearchResult[]> {
    const results = await Promise.allSettled(
      this.providers.map((p) => p.searchProducts(query, limit))
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<MarketplaceSearchResult[]> =>
          r.status === "fulfilled"
      )
      .flatMap((r) => r.value)
      .sort((a, b) => a.price - b.price);
  }
}