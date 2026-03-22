import { Request, Response } from "express";
import Assessment from "../models/Assessment";
import { generationQueue } from "../queues/generationQueue";
import { redis } from "../config/redis";
import { generatePDF } from "../services/pdfService";

export async function createAssessment(req: Request, res: Response) {
  try {
    const assessment = new Assessment({
      input: req.body,
      status: "pending",
    });

    await assessment.save();

    const job = await generationQueue.add("generate", {
      assessmentId: assessment._id.toString(),
    });

    assessment.jobId = job.id;
    await assessment.save();

    await redis.set(`assessment:${assessment._id}:status`, "pending", "EX", 3600);

    res.status(201).json({
      success: true,
      data: {
        id: assessment._id,
        status: assessment.status,
        jobId: job.id,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAssessment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const cachedResult = await redis.get(`assessment:${id}:result`);
    const cachedStatus = await redis.get(`assessment:${id}:status`);

    if (cachedResult && cachedStatus === "completed") {
      return res.json({
        success: true,
        data: {
          id,
          status: "completed",
          generatedPaper: JSON.parse(cachedResult),
        },
      });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, error: "Assessment not found" });
    }

    res.json({
      success: true,
      data: {
        id: assessment._id,
        status: assessment.status,
        input: assessment.input,
        generatedPaper: assessment.generatedPaper,
        error: assessment.error,
        createdAt: assessment.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAssessmentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const cachedStatus = await redis.get(`assessment:${id}:status`);
    if (cachedStatus) {
      return res.json({ success: true, status: cachedStatus });
    }

    const assessment = await Assessment.findById(id).select("status");
    if (!assessment) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    res.json({ success: true, status: assessment.status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function listAssessments(req: Request, res: Response) {
  try {
    const assessments = await Assessment.find()
      .select("input.title input.subject status createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: assessments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function regenerateAssessment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    assessment.status = "pending";
    assessment.generatedPaper = undefined;
    assessment.error = undefined;
    await assessment.save();

    await redis.del(`assessment:${id}:result`);
    await redis.del(`assessment:${id}:status`);

    const job = await generationQueue.add("generate", {
      assessmentId: id,
    });

    assessment.jobId = job.id;
    await assessment.save();

    res.json({
      success: true,
      data: { id, status: "pending", jobId: job.id },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function downloadPDF(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);
    if (!assessment || !assessment.generatedPaper) {
      return res.status(404).json({ success: false, error: "Paper not found or not generated yet" });
    }

    const pdfBuffer = await generatePDF(assessment.generatedPaper);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${assessment.input.title.replace(/\s+/g, "_")}_paper.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}