import { ProductFilters, AddPriceDTO } from "./product.repository";
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
export declare class ProductService {
    create(data: any): Promise<{
        category: string;
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        rating: number;
        reviews: number;
        bestPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    search(query: string, filters?: ProductFilters): Promise<any[]>;
    findAll(filters?: ProductFilters): Promise<{
        category: string;
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        rating: number;
        reviews: number;
        bestPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<any>;
    getCategories(): Promise<string[]>;
    addPrice(data: AddPriceDTO): Promise<{
        marketplace: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        productId: string;
        originalPrice: number | null;
        discount: number | null;
        shipping: string | null;
        inStock: boolean;
        installments: string | null;
        url: string | null;
    }>;
    compareProduct(id: string): Promise<ComparisonResult | null>;
    getPriceInsights(id: string): Promise<PriceInsight | null>;
    private detectFakePromotion;
    trackClick(productId: string, marketplace: string, userId?: string, sessionId?: string): Promise<void>;
}
export declare const productService: ProductService;
//# sourceMappingURL=product.service.d.ts.map