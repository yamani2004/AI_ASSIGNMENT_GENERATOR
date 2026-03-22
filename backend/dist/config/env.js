"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || "5000", 10),
    mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/ai_assessment",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    geminiKey: process.env.GEMINI_API_KEY || "",
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
//# sourceMappingURL=env.js.map