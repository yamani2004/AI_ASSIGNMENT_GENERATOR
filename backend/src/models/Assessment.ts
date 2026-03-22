import mongoose, { Schema, Document } from "mongoose";
import { GeneratedPaper, AssessmentInput, JobStatus } from "../types";

export interface IAssessment extends Document {
  input: AssessmentInput;
  status: JobStatus;
  generatedPaper?: GeneratedPaper;
  jobId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ["mcq", "short", "long", "true_false", "fill_blank"], required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  marks: { type: Number, required: true },
  options: [String],
  answer: String,
}, { _id: false });

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
}, { _id: false });

const GeneratedPaperSchema = new Schema({
  title: String,
  subject: String,
  duration: String,
  totalMarks: Number,
  generalInstructions: [String],
  sections: [SectionSchema],
}, { _id: false });

const AssessmentSchema = new Schema({
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

export default mongoose.model<IAssessment>("Assessment", AssessmentSchema);