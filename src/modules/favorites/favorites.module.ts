import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";

import { productRepository } from "../products/product.repository";
import { sendSuccess, sendError, sendServerError } from "../../shared/utils/response";
import { requireAuth } from "../../shared/middlewares/auth";

/* ───────────────────────────────────────────────────────────────
   TYPES
─────────────────────────────────────────────────────────────── */

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  priceAlert?: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name?: string;
}

export interface FavoriteWithProduct extends Favorite {
  product: Product | null;
}

/* ───────────────────────────────────────────────────────────────
   DATABASE (IN MEMORY)
─────────────────────────────────────────────────────────────── */

const db = {
  favorites: new Map<string, Favorite>(),
};

/* ───────────────────────────────────────────────────────────────
   REPOSITORY
─────────────────────────────────────────────────────────────── */

export class FavoriteRepository {
  findByUser(userId: string): Favorite[] {
    return Array.from(db.favorites.values()).filter(
      (f) => f.userId === userId
    );
  }

  findByUserAndProduct(userId: string, productId: string): Favorite | null {
    return (
      Array.from(db.favorites.values()).find(
        (f) => f.userId === userId && f.productId === productId
      ) ?? null
    );
  }

  save(favorite: Favorite): Favorite {
    db.favorites.set(favorite.id, favorite);
    return favorite;
  }

  delete(id: string): boolean {
    return db.favorites.delete(id);
  }

  updatePriceAlert(id: string, priceAlert: number): Favorite | null {
    const fav = db.favorites.get(id);
    if (!fav) return null;

    fav.priceAlert = priceAlert;
    db.favorites.set(id, fav);

    return fav;
  }
}

export const favoriteRepository = new FavoriteRepository();

/* ───────────────────────────────────────────────────────────────
   SERVICE
─────────────────────────────────────────────────────────────── */

export class FavoriteService {
  async getUserFavorites(userId: string): Promise<FavoriteWithProduct[]> {
    const favorites = favoriteRepository.findByUser(userId);

    return Promise.all(
      favorites.map(async (f) => ({
        ...f,
        product: await productRepository.findById(f.productId),
      }))
    );
  }

  async addFavorite(
    userId: string,
    productId: string,
    priceAlert?: number
  ): Promise<FavoriteWithProduct> {
    const existing = favoriteRepository.findByUserAndProduct(userId, productId);

    if (existing) {
      return {
        ...existing,
        product: await productRepository.findById(productId),
      };
    }

    const favorite: Favorite = {
      id: randomUUID(),
      userId,
      productId,
      priceAlert,
      createdAt: new Date().toISOString(),
    };

    favoriteRepository.save(favorite);

    return {
      ...favorite,
      product: await productRepository.findById(productId),
    };
  }

  removeFavorite(userId: string, productId: string): boolean {
    const existing = favoriteRepository.findByUserAndProduct(userId, productId);
    if (!existing) return false;

    return favoriteRepository.delete(existing.id);
  }

  setPriceAlert(
    userId: string,
    productId: string,
    priceAlert: number
  ): Favorite | null {
    const existing = favoriteRepository.findByUserAndProduct(userId, productId);
    if (!existing) return null;

    return favoriteRepository.updatePriceAlert(existing.id, priceAlert);
  }

  isFavorite(userId: string, productId: string): boolean {
    return Boolean(
      favoriteRepository.findByUserAndProduct(userId, productId)
    );
  }
}

export const favoriteService = new FavoriteService();

/* ───────────────────────────────────────────────────────────────
   CONTROLLER
─────────────────────────────────────────────────────────────── */

export class FavoriteController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) return sendError(res, "Unauthorized", 401);

      const favorites = await favoriteService.getUserFavorites(userId);

      sendSuccess(res, favorites, { total: favorites.length });
    } catch (error) {
      sendServerError(res, error);
    }
  }

  async add(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) return sendError(res, "Unauthorized", 401);

      const { productId, priceAlert } = req.body;

      if (!productId) {
        return sendError(res, "productId is required");
      }

      const product = await productRepository.findById(productId);

      if (!product) {
        return sendError(res, "Product not found", 404);
      }

      const favorite = await favoriteService.addFavorite(
        userId,
        productId,
        priceAlert ? Number(priceAlert) : undefined
      );

      sendSuccess(res, favorite, undefined, 201);
    } catch (error) {
      sendServerError(res, error);
    }
  }

  remove(req: Request, res: Response): void {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) return sendError(res, "Unauthorized", 401);

      const { productId } = req.params;

      const removed = favoriteService.removeFavorite(userId, productId);

      if (!removed) {
        return sendError(res, "Favorite not found", 404);
      }

      sendSuccess(res, { removed: true });
    } catch (error) {
      sendServerError(res, error);
    }
  }

  setPriceAlert(req: Request, res: Response): void {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) return sendError(res, "Unauthorized", 401);

      const { productId } = req.params;
      const { priceAlert } = req.body;

      if (!priceAlert || isNaN(Number(priceAlert))) {
        return sendError(res, "Valid priceAlert is required");
      }

      const updated = favoriteService.setPriceAlert(
        userId,
        productId,
        Number(priceAlert)
      );

      if (!updated) {
        return sendError(res, "Favorite not found", 404);
      }

      sendSuccess(res, updated);
    } catch (error) {
      sendServerError(res, error);
    }
  }
}

export const favoriteController = new FavoriteController();

/* ───────────────────────────────────────────────────────────────
   ROUTES
─────────────────────────────────────────────────────────────── */

const favoriteRouter = Router();

favoriteRouter.use(requireAuth);

favoriteRouter.get("/", favoriteController.getAll.bind(favoriteController));
favoriteRouter.post("/", favoriteController.add.bind(favoriteController));
favoriteRouter.delete("/:productId", favoriteController.remove.bind(favoriteController));
favoriteRouter.patch("/:productId/alert", favoriteController.setPriceAlert.bind(favoriteController));

export default favoriteRouter;