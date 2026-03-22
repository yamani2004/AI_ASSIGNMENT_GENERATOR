"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssessment = createAssessment;
exports.getAssessment = getAssessment;
exports.getAssessmentStatus = getAssessmentStatus;
exports.listAssessments = listAssessments;
exports.regenerateAssessment = regenerateAssessment;
exports.downloadPDF = downloadPDF;
const Assessment_1 = __importDefault(require("../models/Assessment"));
const generationQueue_1 = require("../queues/generationQueue");
const redis_1 = require("../config/redis");
const pdfService_1 = require("../services/pdfService");
async function createAssessment(req, res) {
    try {
        const assessment = new Assessment_1.default({
            input: req.body,
            status: "pending",
        });
        await assessment.save();
        const job = await generationQueue_1.generationQueue.add("generate", {
            assessmentId: assessment._id.toString(),
        });
        assessment.jobId = job.id;
        await assessment.save();
        await redis_1.redis.set(`assessment:${assessment._id}:status`, "pending", "EX", 3600);
        res.status(201).json({
            success: true,
            data: {
                id: assessment._id,
                status: assessment.status,
                jobId: job.id,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
async function getAssessment(req, res) {
    try {
        const { id } = req.params;
        const cachedResult = await redis_1.redis.get(`assessment:${id}:result`);
        const cachedStatus = await redis_1.redis.get(`assessment:${id}:status`);
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
        const assessment = await Assessment_1.default.findById(id);
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
async function getAssessmentStatus(req, res) {
    try {
        const { id } = req.params;
        const cachedStatus = await redis_1.redis.get(`assessment:${id}:status`);
        if (cachedStatus) {
            return res.json({ success: true, status: cachedStatus });
        }
        const assessment = await Assessment_1.default.findById(id).select("status");
        if (!assessment) {
            return res.status(404).json({ success: false, error: "Not found" });
        }
        res.json({ success: true, status: assessment.status });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
async function listAssessments(req, res) {
    try {
        const assessments = await Assessment_1.default.find()
            .select("input.title input.subject status createdAt")
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ success: true, data: assessments });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
async function regenerateAssessment(req, res) {
    try {
        const { id } = req.params;
        const assessment = await Assessment_1.default.findById(id);
        if (!assessment) {
            return res.status(404).json({ success: false, error: "Not found" });
        }
        assessment.status = "pending";
        assessment.generatedPaper = undefined;
        assessment.error = undefined;
        await assessment.save();
        await redis_1.redis.del(`assessment:${id}:result`);
        await redis_1.redis.del(`assessment:${id}:status`);
        const job = await generationQueue_1.generationQueue.add("generate", {
            assessmentId: id,
        });
        assessment.jobId = job.id;
        await assessment.save();
        res.json({
            success: true,
            data: { id, status: "pending", jobId: job.id },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
async function downloadPDF(req, res) {
    try {
        const { id } = req.params;
        const assessment = await Assessment_1.default.findById(id);
        if (!assessment || !assessment.generatedPaper) {
            return res.status(404).json({ success: false, error: "Paper not found or not generated yet" });
        }
        const pdfBuffer = await (0, pdfService_1.generatePDF)(assessment.generatedPaper);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${assessment.input.title.replace(/\s+/g, "_")}_paper.pdf"`);
        res.send(pdfBuffer);
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
//# sourceMappingURL=assessmentController.js.map