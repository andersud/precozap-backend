"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env_1 = require("../config/env");
function formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}
exports.logger = {
    info: (message, meta) => {
        console.log(formatMessage("info", message, meta));
    },
    warn: (message, meta) => {
        console.warn(formatMessage("warn", message, meta));
    },
    error: (message, meta) => {
        console.error(formatMessage("error", message, meta));
    },
    debug: (message, meta) => {
        if (env_1.env.isDev) {
            console.debug(formatMessage("debug", message, meta));
        }
    },
};
//# sourceMappingURL=logger.js.map