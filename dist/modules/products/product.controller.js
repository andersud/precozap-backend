"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const response_1 = require("../../shared/utils/response");
class ProductController {
    // 🔧 PARSER SEGURO DE NÚMEROS
    parseNumber(value) {
        if (value === undefined)
            return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    }
    // 🔧 BUILDER DE FILTROS
    buildFilters(query) {
        return {
            category: typeof query.category === "string" ? query.category : undefined,
            minPrice: this.parseNumber(query.minPrice),
            maxPrice: this.parseNumber(query.maxPrice),
            marketplace: typeof query.marketplace === "string" ? query.marketplace : undefined,
            sort: typeof query.sort === "string" ? query.sort : undefined,
        };
    }
    // 🔥 CREATE PRODUCT
    async create(req, res) {
        try {
            const { name, category } = req.body;
            if (!name || typeof name !== "string") {
                (0, response_1.sendError)(res, "Product name is required", 400);
                return;
            }
            if (!category || typeof category !== "string") {
                (0, response_1.sendError)(res, "Category is required", 400);
                return;
            }
            const product = await product_service_1.productService.create(req.body);
            (0, response_1.sendSuccess)(res, product, { created: true });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 🔍 SEARCH
    async search(req, res) {
        try {
            const { search } = req.query;
            if (!search || typeof search !== "string" || search.trim().length < 2) {
                (0, response_1.sendError)(res, "Search must be at least 2 characters", 400);
                return;
            }
            const filters = this.buildFilters(req.query);
            const products = await product_service_1.productService.search(search.trim(), filters);
            (0, response_1.sendSuccess)(res, products || [], {
                total: products?.length || 0,
                search,
                filters,
            });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 📦 GET ALL (COM SEARCH + SORT)
    async getAll(req, res) {
        try {
            const { search } = req.query;
            const filters = this.buildFilters(req.query);
            // 🔥 se tem busca → usa search
            if (search && typeof search === "string" && search.trim().length >= 2) {
                const products = await product_service_1.productService.search(search.trim(), filters);
                (0, response_1.sendSuccess)(res, products || [], {
                    total: products?.length || 0,
                    search,
                    filters,
                });
                return;
            }
            const products = await product_service_1.productService.findAll(filters);
            (0, response_1.sendSuccess)(res, products || [], {
                total: products?.length || 0,
                filters,
            });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 🔍 GET BY ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                (0, response_1.sendError)(res, "Product id is required", 400);
                return;
            }
            const product = await product_service_1.productService.findById(id);
            if (!product) {
                (0, response_1.sendNotFound)(res, "Product");
                return;
            }
            (0, response_1.sendSuccess)(res, product);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 📊 COMPARE
    async compare(req, res) {
        try {
            const { id } = req.params;
            const result = await product_service_1.productService.compareProduct(id);
            if (!result) {
                (0, response_1.sendNotFound)(res, "Product");
                return;
            }
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 📈 INSIGHTS
    async getPriceInsights(req, res) {
        try {
            const { id } = req.params;
            const insights = await product_service_1.productService.getPriceInsights(id);
            if (!insights) {
                (0, response_1.sendNotFound)(res, "Product or price history");
                return;
            }
            (0, response_1.sendSuccess)(res, insights);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 📦 CATEGORIES
    async getCategories(_req, res) {
        try {
            const categories = await product_service_1.productService.getCategories();
            (0, response_1.sendSuccess)(res, categories || []);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 💰 ADD PRICE
    async addPrice(req, res) {
        try {
            const { id } = req.params;
            const { marketplace, price, url, originalPrice, discount, shipping, inStock, installments, } = req.body;
            if (!marketplace || typeof marketplace !== "string") {
                (0, response_1.sendError)(res, "marketplace is required", 400);
                return;
            }
            const parsedPrice = Number(price);
            if (!parsedPrice || parsedPrice <= 0) {
                (0, response_1.sendError)(res, "price must be greater than 0", 400);
                return;
            }
            const result = await product_service_1.productService.addPrice({
                productId: id,
                marketplace: marketplace.trim(),
                price: parsedPrice,
                url,
                originalPrice: originalPrice ? Number(originalPrice) : undefined,
                discount: discount ? Number(discount) : undefined,
                shipping,
                inStock,
                installments,
            });
            (0, response_1.sendSuccess)(res, result, { created: true });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    // 🖱️ TRACK CLICK
    async trackClick(req, res) {
        try {
            const { id } = req.params;
            const { marketplace, sessionId } = req.body;
            if (!marketplace) {
                (0, response_1.sendError)(res, "marketplace is required", 400);
                return;
            }
            await product_service_1.productService.trackClick(id, marketplace, req.user?.userId, sessionId || "anonymous");
            (0, response_1.sendSuccess)(res, { tracked: true });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
//# sourceMappingURL=product.controller.js.map