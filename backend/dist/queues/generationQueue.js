"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generationQueue = void 0;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
// parse redis url to get host and port
function getRedisConfig() {
    const url = env_1.config.redisUrl.replace("redis://", "");
    const parts = url.split(":");
    return {
        host: parts[0] || "localhost",
        port: parseInt(parts[1] || "6379"),
    };
}
exports.generationQueue = new bullmq_1.Queue("assessment-generation", {
    connection: getRedisConfig(),
    defaultJobOptions: {
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 20 },
        attempts: 2,
        backoff: {
            type: "exponential",
            delay: 3000,
        },
    },
});
//# sourceMappingURL=generationQueue.js.map