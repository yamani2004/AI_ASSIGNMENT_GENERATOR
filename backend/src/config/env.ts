import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/ai_assessment",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  geminiKey: process.env.GEMINI_API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};