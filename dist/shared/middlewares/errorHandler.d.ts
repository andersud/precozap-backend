import { Request, Response, NextFunction } from "express";
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=errorHandler.d.ts.map