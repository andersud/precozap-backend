type Notification = any;
export declare class NotificationService {
    getUserNotifications(userId: string): Notification[];
    markAsRead(notificationId: string, userId: string): boolean;
    markAllAsRead(userId: string): number;
    checkPriceAlerts(): void;
    getUnreadCount(userId: string): number;
}
export declare const notificationService: NotificationService;
import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middlewares/auth";
export declare class NotificationController {
    getAll(req: AuthenticatedRequest, res: Response): void;
    markRead(req: AuthenticatedRequest, res: Response): void;
    markAllRead(req: AuthenticatedRequest, res: Response): void;
}
export declare const notificationController: NotificationController;
declare const notificationRouter: import("express-serve-static-core").Router;
export default notificationRouter;
//# sourceMappingURL=notifications.module.d.ts.map