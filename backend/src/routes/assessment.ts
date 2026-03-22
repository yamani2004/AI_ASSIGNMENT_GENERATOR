import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";

import {
  createAssessment,
  getAssessment,
  getAssessmentStatus,
  listAssessments,
  regenerateAssessment,
  downloadPDF,
} from "../controllers/assessmentController";
import { validateAssessment } from "../middleware/validate";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
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
      const pdfParseFn = (pdfParse as any).default || pdfParse;
      const pdfData = await pdfParseFn(req.file.buffer);
      content = pdfData.text;
    } else {
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", validateAssessment, createAssessment);
router.get("/", listAssessments);
router.get("/:id", getAssessment);
router.get("/:id/status", getAssessmentStatus);
router.post("/:id/regenerate", regenerateAssessment);
router.get("/:id/pdf", downloadPDF);

export default router;