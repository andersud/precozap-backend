import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../shared/middlewares/auth";
export declare class ProductController {
    private parseNumber;
    private buildFilters;
    create(req: Request, res: Response): Promise<void>;
    search(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    compare(req: Request, res: Response): Promise<void>;
    getPriceInsights(req: Request, res: Response): Promise<void>;
    getCategories(_req: Request, res: Response): Promise<void>;
    addPrice(req: Request, res: Response): Promise<void>;
    trackClick(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const productController: ProductController;
//# sourceMappingURL=product.controller.d.ts.map