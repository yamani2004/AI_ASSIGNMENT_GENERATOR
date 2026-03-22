import { Queue } from "bullmq";
import { config } from "../config/env";

// parse redis url to get host and port
function getRedisConfig() {
  const url = config.redisUrl.replace("redis://", "");
  const parts = url.split(":");
  return {
    host: parts[0] || "localhost",
    port: parseInt(parts[1] || "6379"),
  };
}

export const generationQueue = new Queue("assessment-generation", {
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