"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorker = startWorker;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
const Assessment_1 = __importDefault(require("../models/Assessment"));
const aiService_1 = require("../services/aiService");
const redis_1 = require("../config/redis");
function getRedisConfig() {
    const url = env_1.config.redisUrl.replace("redis://", "");
    const parts = url.split(":");
    return {
        host: parts[0] || "localhost",
        port: parseInt(parts[1] || "6379"),
    };
}
function startWorker(io) {
    const worker = new bullmq_1.Worker("assessment-generation", async (job) => {
        const { assessmentId } = job.data;
        console.log(`Processing job ${job.id} for assessment ${assessmentId}`);
        try {
            await Assessment_1.default.findByIdAndUpdate(assessmentId, { status: "processing" });
            await redis_1.redis.set(`assessment:${assessmentId}:status`, "processing", "EX", 3600);
            if (io) {
                io.to(assessmentId).emit("status-update", {
                    assessmentId,
                    status: "processing",
                    message: "AI is generating your question paper...",
                });
            }
            const assessment = await Assessment_1.default.findById(assessmentId);
            if (!assessment) {
                throw new Error("Assessment not found");
            }
            const generatedPaper = await (0, aiService_1.generateAssessment)(assessment.input);
            await Assessment_1.default.findByIdAndUpdate(assessmentId, {
                status: "completed",
                generatedPaper,
            });
            await redis_1.redis.set(`assessment:${assessmentId}:result`, JSON.stringify(generatedPaper), "EX", 7200);
            await redis_1.redis.set(`assessment:${assessmentId}:status`, "completed", "EX", 3600);
            if (io) {
                io.to(assessmentId).emit("status-update", {
                    assessmentId,
                    status: "completed",
                    message: "Question paper generated successfully!",
                });
            }
            return { success: true, assessmentId };
        }
        catch (err) {
            console.error(`Job failed for ${assessmentId}:`, err.message);
            await Assessment_1.default.findByIdAndUpdate(assessmentId, {
                status: "failed",
                error: err.message,
            });
            await redis_1.redis.set(`assessment:${assessmentId}:status`, "failed", "EX", 3600);
            if (io) {
                io.to(assessmentId).emit("status-update", {
                    assessmentId,
                    status: "failed",
                    message: `Generation failed: ${err.message}`,
                });
            }
            throw err;
        }
    }, {
        connection: getRedisConfig(),
        concurrency: 2,
    });
    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });
    worker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} failed:`, err.message);
    });
    return worker;
}
//# sourceMappingURL=worker.js.map