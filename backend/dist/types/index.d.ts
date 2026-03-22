export interface QuestionItem {
    questionNumber: number;
    text: string;
    type: "mcq" | "short" | "long" | "true_false" | "fill_blank";
    difficulty: "easy" | "medium" | "hard";
    marks: number;
    options?: string[];
    answer?: string;
}
export interface Section {
    title: string;
    instruction: string;
    questions: QuestionItem[];
}
export interface GeneratedPaper {
    title: string;
    subject: string;
    duration: string;
    totalMarks: number;
    generalInstructions: string[];
    sections: Section[];
}
export interface AssessmentInput {
    title: string;
    subject: string;
    dueDate: string;
    questionTypes: string[];
    numberOfQuestions: number;
    totalMarks: number;
    difficultyDistribution: {
        easy: number;
        medium: number;
        hard: number;
    };
    additionalInstructions?: string;
    duration?: string;
    fileContent?: string;
    fileName?: string;
}
export type JobStatus = "pending" | "processing" | "completed" | "failed";
//# sourceMappingURL=index.d.ts.map