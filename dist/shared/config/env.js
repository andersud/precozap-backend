"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("3001"),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    JWT_SECRET: zod_1.z.string().default("precozap-secret-dev"),
    ANTHROPIC_API_KEY: zod_1.z.string().optional(),
    CACHE_TTL_PRODUCTS: zod_1.z.string().default("300"),
    CACHE_TTL_SEARCH: zod_1.z.string().default("60"),
    FRONTEND_URL: zod_1.z.string().default("http://localhost:3000"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}
exports.env = {
    port: parseInt(parsed.data.PORT, 10),
    nodeEnv: parsed.data.NODE_ENV,
    jwtSecret: parsed.data.JWT_SECRET,
    anthropicApiKey: parsed.data.ANTHROPIC_API_KEY,
    cache: {
        ttlProducts: parseInt(parsed.data.CACHE_TTL_PRODUCTS, 10),
        ttlSearch: parseInt(parsed.data.CACHE_TTL_SEARCH, 10),
    },
    frontendUrl: parsed.data.FRONTEND_URL,
    isDev: parsed.data.NODE_ENV === "development",
    isProd: parsed.data.NODE_ENV === "production",
};
//# sourceMappingURL=env.js.map