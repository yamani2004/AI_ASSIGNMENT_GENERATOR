"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentSchema = void 0;
exports.validateAssessment = validateAssessment;
const zod_1 = require("zod");
exports.assessmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(200),
    subject: zod_1.z.string().min(1, "Subject is required").max(100),
    dueDate: zod_1.z.string().min(1, "Due date is required"),
    questionTypes: zod_1.z.array(zod_1.z.string()).min(1, "At least one question type required"),
    numberOfQuestions: zod_1.z.number().int().min(1, "Must have at least 1 question").max(100),
    totalMarks: zod_1.z.number().int().min(1, "Total marks must be positive").max(500),
    difficultyDistribution: zod_1.z.object({
        easy: zod_1.z.number().min(0).max(100),
        medium: zod_1.z.number().min(0).max(100),
        hard: zod_1.z.number().min(0).max(100),
    }).refine(d => d.easy + d.medium + d.hard === 100, {
        message: "Difficulty percentages must add up to 100",
    }),
    additionalInstructions: zod_1.z.string().optional(),
    duration: zod_1.z.string().optional(),
    fileContent: zod_1.z.string().optional(),
    fileName: zod_1.z.string().optional(),
});
function validateAssessment(req, res, next) {
    try {
        exports.assessmentSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
//# sourceMappingURL=validate.js.map