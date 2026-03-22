import { Worker, Job } from "bullmq";
import { config } from "../config/env";
import Assessment from "../models/Assessment";
import { generateAssessment } from "../services/aiService";
import { redis } from "../config/redis";

function getRedisConfig() {
  const url = config.redisUrl.replace("redis://", "");
  const parts = url.split(":");
  return {
    host: parts[0] || "localhost",
    port: parseInt(parts[1] || "6379"),
  };
}

export function startWorker(io?: any) {
  const worker = new Worker(
    "assessment-generation",
    async (job: Job) => {
      const { assessmentId } = job.data;
      console.log(`Processing job ${job.id} for assessment ${assessmentId}`);

      try {
        await Assessment.findByIdAndUpdate(assessmentId, { status: "processing" });
        await redis.set(`assessment:${assessmentId}:status`, "processing", "EX", 3600);

        if (io) {
          io.to(assessmentId).emit("status-update", {
            assessmentId,
            status: "processing",
            message: "AI is generating your question paper...",
          });
        }

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
          throw new Error("Assessment not found");
        }

        const generatedPaper = await generateAssessment(assessment.input);

        await Assessment.findByIdAndUpdate(assessmentId, {
          status: "completed",
          generatedPaper,
        });

        await redis.set(
          `assessment:${assessmentId}:result`,
          JSON.stringify(generatedPaper),
          "EX",
          7200
        );
        await redis.set(`assessment:${assessmentId}:status`, "completed", "EX", 3600);

        if (io) {
          io.to(assessmentId).emit("status-update", {
            assessmentId,
            status: "completed",
            message: "Question paper generated successfully!",
          });
        }

        return { success: true, assessmentId };
      } catch (err: any) {
        console.error(`Job failed for ${assessmentId}:`, err.message);

        await Assessment.findByIdAndUpdate(assessmentId, {
          status: "failed",
          error: err.message,
        });

        await redis.set(`assessment:${assessmentId}:status`, "failed", "EX", 3600);

        if (io) {
          io.to(assessmentId).emit("status-update", {
            assessmentId,
            status: "failed",
            message: `Generation failed: ${err.message}`,
          });
        }

        throw err;
      }
    },
    {
      connection: getRedisConfig(),
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  return worker;
}