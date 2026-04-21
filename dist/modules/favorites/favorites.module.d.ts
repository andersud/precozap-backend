type Favorite = any;
export declare class FavoriteRepository {
    findByUser(userId: string): Favorite[];
    findByUserAndProduct(userId: string, productId: string): Favorite | null;
    save(favorite: Favorite): Favorite;
    delete(id: string): boolean;
    updatePriceAlert(id: string, priceAlert: number): Favorite | null;
}
export declare const favoriteRepository: FavoriteRepository;
import { Product } from "../../shared/database/inMemoryDb";
export interface FavoriteWithProduct extends Favorite {
    product: Product | null;
}
export declare class FavoriteService {
    getUserFavorites(userId: string): FavoriteWithProduct[];
    addFavorite(userId: string, productId: string, priceAlert?: number): FavoriteWithProduct;
    removeFavorite(userId: string, productId: string): boolean;
    setPriceAlert(userId: string, productId: string, priceAlert: number): Favorite | null;
    isFavorite(userId: string, productId: string): boolean;
}
export declare const favoriteService: FavoriteService;
import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middlewares/auth";
export declare class FavoriteController {
    getAll(req: AuthenticatedRequest, res: Response): void;
    add(req: AuthenticatedRequest, res: Response): void;
    remove(req: AuthenticatedRequest, res: Response): void;
    setPriceAlert(req: AuthenticatedRequest, res: Response): void;
}
export declare const favoriteController: FavoriteController;
declare const favoriteRouter: import("express-serve-static-core").Router;
export default favoriteRouter;
//# sourceMappingURL=favorites.module.d.ts.map