type User = any;
export declare class UserRepository {
    findById(id: string): User | null;
    findByEmail(email: string): User | null;
    save(user: User): User;
}
export declare const userRepository: UserRepository;
export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface AuthResult {
    token: string;
    user: Omit<User, "passwordHash">;
}
export declare class UserService {
    register(input: RegisterInput): AuthResult;
    login(input: LoginInput): AuthResult;
    demoLogin(): AuthResult;
    getProfile(userId: string): Omit<User, "passwordHash"> | null;
}
export declare const userService: UserService;
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../shared/middlewares/auth";
export declare class UserController {
    register(req: Request, res: Response): void;
    login(req: Request, res: Response): void;
    demoLogin(_req: Request, res: Response): void;
    getProfile(req: AuthenticatedRequest, res: Response): void;
}
export declare const userController: UserController;
declare const userRouter: import("express-serve-static-core").Router;
export default userRouter;
//# sourceMappingURL=users.module.d.ts.map