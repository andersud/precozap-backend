"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const env_1 = require("../config/env");
class CacheService {
    cache;
    constructor() {
        this.cache = new node_cache_1.default({
            stdTTL: env_1.env.cache.ttlProducts,
            checkperiod: 120,
            useClones: false,
        });
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value, ttl) {
        if (ttl !== undefined) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }
    del(key) {
        return this.cache.del(key);
    }
    flush() {
        this.cache.flushAll();
    }
    keys() {
        return this.cache.keys();
    }
    stats() {
        return this.cache.getStats();
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cache.js.map