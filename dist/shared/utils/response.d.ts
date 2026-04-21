import { Response } from "express";
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: Record<string, unknown>;
}
export declare function sendSuccess<T>(res: Response, data: T, meta?: Record<string, unknown>, statusCode?: number): void;
export declare function sendError(res: Response, message: string, statusCode?: number): void;
export declare function sendNotFound(res: Response, resource?: string): void;
export declare function sendUnauthorized(res: Response): void;
export declare function sendServerError(res: Response, error?: unknown): void;
//# sourceMappingURL=response.d.ts.map