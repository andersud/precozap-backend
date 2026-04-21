"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = exports.notificationService = exports.NotificationService = void 0;
const db = {
    notifications: new Map()
};
const product_repository_1 = require("../products/product.repository");
class NotificationService {
    getUserNotifications(userId) {
        return Array.from(db.notifications.values())
            .filter((n) => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    markAsRead(notificationId, userId) {
        const notification = db.notifications.get(notificationId);
        if (!notification || notification.userId !== userId)
            return false;
        notification.read = true;
        db.notifications.set(notificationId, notification);
        return true;
    }
    markAllAsRead(userId) {
        let count = 0;
        for (const [id, notif] of db.notifications.entries()) {
            if (notif.userId === userId && !notif.read) {
                notif.read = true;
                db.notifications.set(id, notif);
                count++;
            }
        }
        return count;
    }
    // Called by a background job (simulated) to check price drops
    checkPriceAlerts() {
        const favorites = Array.from(db.favorites.values()).filter((f) => f.priceAlert !== undefined);
        for (const fav of favorites) {
            const product = product_repository_1.productRepository.findById(fav.productId);
            if (!product || fav.priceAlert === undefined)
                continue;
            if (product.bestPrice <= fav.priceAlert) {
                const existingToday = Array.from(db.notifications.values()).find((n) => n.userId === fav.userId &&
                    n.productId === fav.productId &&
                    n.type === "price_drop" &&
                    n.createdAt.startsWith(new Date().toISOString().split("T")[0]));
                if (!existingToday) {
                    const notification = {
                        id: db.generateId(),
                        userId: fav.userId,
                        productId: fav.productId,
                        type: "price_drop",
                        message: `🎉 Alerta de preço! **${product.name}** atingiu R$ ${product.bestPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} no ${product.bestMarketplace}. Você configurou alerta para R$ ${fav.priceAlert.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}!`,
                        read: false,
                        createdAt: new Date().toISOString(),
                    };
                    db.notifications.set(notification.id, notification);
                }
            }
        }
    }
    getUnreadCount(userId) {
        return Array.from(db.notifications.values()).filter((n) => n.userId === userId && !n.read).length;
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
const response_1 = require("../../shared/utils/response");
class NotificationController {
    getAll(req, res) {
        try {
            const notifications = exports.notificationService.getUserNotifications(req.user.userId);
            const unreadCount = exports.notificationService.getUnreadCount(req.user.userId);
            (0, response_1.sendSuccess)(res, notifications, { total: notifications.length, unreadCount });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    markRead(req, res) {
        try {
            const { id } = req.params;
            const success = exports.notificationService.markAsRead(id, req.user.userId);
            if (!success) {
                (0, response_1.sendError)(res, "Notification not found", 404);
                return;
            }
            (0, response_1.sendSuccess)(res, { read: true });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
    markAllRead(req, res) {
        try {
            const count = exports.notificationService.markAllAsRead(req.user.userId);
            (0, response_1.sendSuccess)(res, { markedRead: count });
        }
        catch (error) {
            (0, response_1.sendServerError)(res, error);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
// ─── Routes ──────────────────────────────────────────────────────────────────
const express_1 = require("express");
const auth_1 = require("../../shared/middlewares/auth");
const notificationRouter = (0, express_1.Router)();
notificationRouter.use(auth_1.requireAuth);
notificationRouter.get("/", exports.notificationController.getAll.bind(exports.notificationController));
notificationRouter.patch("/:id/read", exports.notificationController.markRead.bind(exports.notificationController));
notificationRouter.patch("/read-all", exports.notificationController.markAllRead.bind(exports.notificationController));
exports.default = notificationRouter;
//# sourceMappingURL=notifications.module.js.map