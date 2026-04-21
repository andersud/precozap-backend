import { Product } from "../../shared/database/inMemoryDb";
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
export declare class MercadoLivreProvider implements MarketplaceProvider {
    name: string;
    searchProducts(query: string, limit?: number): Promise<MarketplaceSearchResult[]>;
    getProductDetails(externalId: string): Promise<Partial<Product> | null>;
    private mockResults;
}
export declare class AmazonProvider implements MarketplaceProvider {
    name: string;
    searchProducts(query: string, limit?: number): Promise<MarketplaceSearchResult[]>;
    getProductDetails(externalId: string): Promise<Partial<Product> | null>;
    private mockResults;
}
export declare class ShopeeProvider implements MarketplaceProvider {
    name: string;
    searchProducts(query: string, limit?: number): Promise<MarketplaceSearchResult[]>;
    getProductDetails(externalId: string): Promise<Partial<Product> | null>;
    private mockResults;
}
export declare class MarketplaceAggregator {
    private providers;
    constructor(providers: MarketplaceProvider[]);
    searchAll(query: string, limit?: number): Promise<MarketplaceSearchResult[]>;
}
//# sourceMappingURL=marketplaceProviders.d.ts.map