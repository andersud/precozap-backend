import { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    userId: string;
    email: string;
}
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export declare function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void;
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function generateToken(payload: JwtPayload): string;
//# sourceMappingURL=auth.d.ts.map