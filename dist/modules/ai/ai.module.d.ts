import { AIQueryInput, AIQueryOutput } from "../../infra/providers/aiProviders";
import { productRepository } from "../products/product.repository";
declare class AIService {
    private provider;
    constructor();
    query(input: AIQueryInput): Promise<AIQueryOutput & {
        relatedProducts: ReturnType<typeof productRepository.findById>[];
    }>;
    getProviderInfo(): {
        name: string;
        isReal: boolean;
    };
}
export declare const aiService: AIService;
import { Request, Response } from "express";
export declare class AIController {
    query(req: Request, res: Response): Promise<void>;
    getStatus(_req: Request, res: Response): void;
}
export declare const aiController: AIController;
declare const aiRouter: import("express-serve-static-core").Router;
export default aiRouter;
//# sourceMappingURL=ai.module.d.ts.map