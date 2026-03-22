import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IAssessment, {}, {}, {}, mongoose.Document<unknown, {}, IAssessment, {}, mongoose.DefaultSchemaOptions> & IAssessment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAssessment>;
export default _default;
//# sourceMappingURL=Assessment.d.ts.map