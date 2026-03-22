"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const QuestionSchema = new mongoose_1.Schema({
    questionNumber: { type: Number, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ["mcq", "short", "long", "true_false", "fill_blank"], required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    marks: { type: Number, required: true },
    options: [String],
    answer: String,
}, { _id: false });
const SectionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: [QuestionSchema],
}, { _id: false });
const GeneratedPaperSchema = new mongoose_1.Schema({
    title: String,
    subject: String,
    duration: String,
    totalMarks: Number,
    generalInstructions: [String],
    sections: [SectionSchema],
}, { _id: false });
const AssessmentSchema = new mongoose_1.Schema({
    input: {
        title: { type: String, required: true },
        subject: { type: String, required: true },
        dueDate: { type: String, required: true },
        questionTypes: [{ type: String }],
        numberOfQuestions: { type: Number, required: true },
        totalMarks: { type: Number, required: true },
        difficultyDistribution: {
            easy: { type: Number, default: 30 },
            medium: { type: Number, default: 50 },
            hard: { type: Number, default: 20 },
        },
        additionalInstructions: String,
        duration: String,
        fileContent: String,
        fileName: String,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
    },
    generatedPaper: GeneratedPaperSchema,
    jobId: String,
    error: String,
}, { timestamps: true });
exports.default = mongoose_1.default.model("Assessment", AssessmentSchema);
//# sourceMappingURL=Assessment.js.map