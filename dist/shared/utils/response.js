"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendNotFound = sendNotFound;
exports.sendUnauthorized = sendUnauthorized;
exports.sendServerError = sendServerError;
function sendSuccess(res, data, meta, statusCode = 200) {
    const response = { success: true, data };
    if (meta)
        response.meta = meta;
    res.status(statusCode).json(response);
}
function sendError(res, message, statusCode = 400) {
    const response = { success: false, error: message };
    res.status(statusCode).json(response);
}
function sendNotFound(res, resource = "Resource") {
    sendError(res, `${resource} not found`, 404);
}
function sendUnauthorized(res) {
    sendError(res, "Unauthorized", 401);
}
function sendServerError(res, error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    sendError(res, message, 500);
}
//# sourceMappingURL=response.js.map