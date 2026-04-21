"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        next();
        return;
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = decoded;
    }
    catch {
        // optional: ignore bad tokens
    }
    next();
}
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        (0, response_1.sendUnauthorized)(res);
        return;
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = decoded;
        next();
    }
    catch {
        (0, response_1.sendUnauthorized)(res);
    }
}
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtSecret, { expiresIn: "7d" });
}
//# sourceMappingURL=auth.js.map