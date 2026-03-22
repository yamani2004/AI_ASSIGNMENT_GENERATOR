import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const assessmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().min(1, "Subject is required").max(100),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z.array(z.string()).min(1, "At least one question type required"),
  numberOfQuestions: z.number().int().min(1, "Must have at least 1 question").max(100),
  totalMarks: z.number().int().min(1, "Total marks must be positive").max(500),
  difficultyDistribution: z.object({
    easy: z.number().min(0).max(100),
    medium: z.number().min(0).max(100),
    hard: z.number().min(0).max(100),
  }).refine(d => d.easy + d.medium + d.hard === 100, {
    message: "Difficulty percentages must add up to 100",
  }),
  additionalInstructions: z.string().optional(),
  duration: z.string().optional(),
  fileContent: z.string().optional(),
  fileName: z.string().optional(),
});

export function validateAssessment(req: Request, res: Response, next: NextFunction) {
  try {
    assessmentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
}