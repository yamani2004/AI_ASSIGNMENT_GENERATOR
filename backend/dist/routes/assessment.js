"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const assessmentController_1 = require("../controllers/assessmentController");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF and text files allowed"));
        }
    },
});
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }
        let content = "";
        if (req.file.mimetype === "application/pdf") {
            const pdfParseFn = pdf_parse_1.default.default || pdf_parse_1.default;
            const pdfData = await pdfParseFn(req.file.buffer);
            content = pdfData.text;
        }
        else {
            content = req.file.buffer.toString("utf-8");
        }
        res.json({
            success: true,
            data: {
                fileName: req.file.originalname,
                content: content.substring(0, 5000),
                size: req.file.size,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.post("/", validate_1.validateAssessment, assessmentController_1.createAssessment);
router.get("/", assessmentController_1.listAssessments);
router.get("/:id", assessmentController_1.getAssessment);
router.get("/:id/status", assessmentController_1.getAssessmentStatus);
router.post("/:id/regenerate", assessmentController_1.regenerateAssessment);
router.get("/:id/pdf", assessmentController_1.downloadPDF);
exports.default = router;
//# sourceMappingURL=assessment.js.map