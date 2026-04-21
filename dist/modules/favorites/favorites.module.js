"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteController = exports.FavoriteController = exports.favoriteService = exports.FavoriteService = exports.favoriteRepository = exports.FavoriteRepository = void 0;
const db = { favorites: new Map() };
class FavoriteRepository {
    findByUser(userId) {
        return Array.from(db.favorites.values()).filter((f) => f.userId === userId);
    }
    findByUserAndProduct(userId, productId) {
        return (Array.from(db.favorites.values()).find((f) => f.userId === userId && f.productId === productId) ?? null);
    }
    save(favorite) {
        db.favorites.set(favorite.id, favorite);
        return favorite;
    }
    delete(id) {
        return db.favorites.delete(id);
    }
    updatePriceAlert(id, priceAlert) {
        const fav = db.favorites.get(id);
        if (!fav)
            return null;
        fav.priceAlert = priceAlert;
        db.favorites.set(id, fav);
        return fav;
    }
}
exports.FavoriteRepository = FavoriteRepository;
exports.favoriteRepository = new FavoriteRepository();
// ─── Service ─────────────────────────────────────────────────────────────────
const product_repository_1 = require("../products/product.repository");
class FavoriteService {
    getUserFavorites(userId) {
        const favorites = exports.favoriteRepository.findByUser(userId);
        return favorites.map((f) => ({
            ...f,
            product: product_repository_1.productRepository.findById(f.productId),
        }));
    }
    addFavorite(userId, productId, priceAlert) {
        const existing = exports.favoriteRepository.findByUserAndProduct(userId, productId);
        if (existing) {
            return { ...existing, product: product_repository_1.productRepository.findById(productId) };
        }
        const favorite = {
            id: db.generateId(),
            userId,
            productId,
            priceAlert,
            createdAt: new Date().toISOString(),
        };
        exports.favoriteRepository.save(favorite);
        return { ...favorite, product: product_repository_1.productRepository.findById(productId) };
    }
    removeFavorite(userId, productId) {
        const existing = exports.favoriteRepository.findByUserAndProduct(userId, productId);
        if (!existing)
            return false;
        return exports.favoriteRepository.delete(existing.id);
    }
    setPriceAlert(userId, productId, priceAlert) {
        const existing = exports.favoriteRepository.findByUserAndProduct(userId, productId);
        if (!existing)
            return null;
        return exports.favoriteRepository.updatePriceAlert(existing.id, priceAlert);
    }
    isFavorite(userId, productId) {
        return Boolean(exports.favoriteRepository.findByUserAndProduct(userId, productId));
    }
}
exports.FavoriteService = FavoriteService;
exports.favoriteService = new FavoriteService();
const response_1 = require("../../shared/utils/response");
class FavoriteController {
    getAll(req, res) {
        try {
            const userId = req.user.userId;
            const favorites = exports.favoriteService.getUserFavorites(userId);
            (0, response_1.sendSuccess)(res, favorites, { total: favorites.length });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    add(req, res) {
        try {
            const userId = req.user.userId;
            const { productId, priceAlert } = req.body;
            if (!productId) {
                (0, response_1.sendError)(res, "productId is required");
                return;
            }
            const product = product_repository_1.productRepository.findById(productId);
            if (!product) {
                (0, response_1.sendError)(res, "Product not found", 404);
                return;
            }
            const favorite = exports.favoriteService.addFavorite(userId, productId, priceAlert ? parseFloat(priceAlert) : undefined);
            (0, response_1.sendSuccess)(res, favorite, undefined, 201);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    remove(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;
            const removed = exports.favoriteService.removeFavorite(userId, productId);
            if (!removed) {
                (0, response_1.sendError)(res, "Favorite not found", 404);
                return;
            }
            (0, response_1.sendSuccess)(res, { removed: true });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    setPriceAlert(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;
            const { priceAlert } = req.body;
            if (!priceAlert || isNaN(parseFloat(priceAlert))) {
                (0, response_1.sendError)(res, "Valid priceAlert is required");
                return;
            }
            const updated = exports.favoriteService.setPriceAlert(userId, productId, parseFloat(priceAlert));
            if (!updated) {
                (0, response_1.sendError)(res, "Favorite not found", 404);
                return;
            }
            (0, response_1.sendSuccess)(res, updated);
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
}
exports.FavoriteController = FavoriteController;
exports.favoriteController = new FavoriteController();
// ─── Routes ──────────────────────────────────────────────────────────────────
const express_1 = require("express");
const auth_1 = require("../../shared/middlewares/auth");
const favoriteRouter = (0, express_1.Router)();
favoriteRouter.use(auth_1.requireAuth);
favoriteRouter.get("/", exports.favoriteController.getAll.bind(exports.favoriteController));
favoriteRouter.post("/", exports.favoriteController.add.bind(exports.favoriteController));
favoriteRouter.delete("/:productId", exports.favoriteController.remove.bind(exports.favoriteController));
favoriteRouter.patch("/:productId/alert", exports.favoriteController.setPriceAlert.bind(exports.favoriteController));
exports.default = favoriteRouter;
//# sourceMappingURL=favorites.module.js.map