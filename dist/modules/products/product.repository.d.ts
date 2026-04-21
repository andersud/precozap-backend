import { Prisma } from "@prisma/client";
export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    marketplace?: string;
    sort?: "price_asc" | "price_desc" | "newest";
}
export interface CreateProductDTO {
    name: string;
    category: string;
    image?: string;
    description?: string;
    rating?: number;
    reviews?: number;
    bestPrice?: number;
}
export interface AddPriceDTO {
    productId: string;
    marketplace: string;
    price: number;
    url?: string;
    originalPrice?: number;
    discount?: number;
    shipping?: string;
    inStock?: boolean;
    installments?: string;
}
export declare const productRepository: {
    buildWhere(filters?: ProductFilters): Prisma.ProductWhereInput;
    buildOrder(sort?: string): Prisma.ProductOrderByWithRelationInput;
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
    findByIdWithRelations(id: string): Promise<({
        prices: {
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
        }[];
        priceHistory: {
            marketplace: string;
            id: string;
            createdAt: Date;
            price: number;
            date: Date;
            productId: string;
        }[];
    } & {
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
    }) | null>;
    findById(id: string): Promise<{
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
    } | null>;
    search(query: string, filters?: ProductFilters): Promise<{
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
    save(data: CreateProductDTO): Promise<{
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
};
//# sourceMappingURL=product.repository.d.ts.map