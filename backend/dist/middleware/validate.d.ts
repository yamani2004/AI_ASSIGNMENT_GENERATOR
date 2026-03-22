import { Request, Response, NextFunction } from "express";
import { z } from "zod";
export declare const assessmentSchema: z.ZodObject<{
    title: z.ZodString;
    subject: z.ZodString;
    dueDate: z.ZodString;
    questionTypes: z.ZodArray<z.ZodString>;
    numberOfQuestions: z.ZodNumber;
    totalMarks: z.ZodNumber;
    difficultyDistribution: z.ZodObject<{
        easy: z.ZodNumber;
        medium: z.ZodNumber;
        hard: z.ZodNumber;
    }, z.core.$strip>;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodString>;
    fileContent: z.ZodOptional<z.ZodString>;
    fileName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare function validateAssessment(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validate.d.ts.map