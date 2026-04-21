"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
class AppError extends Error {
    message;
    statusCode;
    isOperational;
    constructor(message, statusCode = 400, isOperational = true) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, _next) {
    logger_1.logger.error(`${req.method} ${req.path} - ${err.message}`, {
        stack: err.stack,
    });
    if (err instanceof AppError) {
        (0, response_1.sendError)(res, err.message, err.statusCode);
        return;
    }
    (0, response_1.sendError)(res, "Internal server error", 500);
}
function notFoundHandler(req, res) {
    (0, response_1.sendError)(res, `Route ${req.method} ${req.path} not found`, 404);
}
//# sourceMappingURL=errorHandler.js.map