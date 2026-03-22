import { Request, Response } from "express";
export declare function createAssessment(req: Request, res: Response): Promise<void>;
export declare function getAssessment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getAssessmentStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listAssessments(req: Request, res: Response): Promise<void>;
export declare function regenerateAssessment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function downloadPDF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=assessmentController.d.ts.map