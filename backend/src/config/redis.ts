import IORedis from "ioredis";
import { config } from "./env.js";

export const redis = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected");
});