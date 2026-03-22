import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Clock,
  Award,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAssessment } from "../hooks/useAssessment";
import { regenerateAssessment, getDownloadURL } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import QuestionCard from "../components/QuestionCard";

export default function ViewAssessment() {
  const { id } = useParams<{ id: string }>();
  const { assessment, loading, statusMessage, refetch } = useAssessment(id); // <--- get refetch
  const [showAnswers, setShowAnswers] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    if (!id) return;
    try {
      setRegenerating(true);
      await regenerateAssessment(id);
      toast.success("Regeneration started!");
      
      // REFRESH assessment immediately after regeneration
      await refetch(); // <--- added
    } catch (_err: unknown) {
      void _err;
      toast.error("Failed to regenerate");
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

//   if (!assessment || !assessment.input) {
//     return (
//       <div className="max-w-6xl mx-auto px-4 py-8 text-center">
//         <h2 className="text-xl font-semibold text-gray-700">Assessment not found</h2>
//         <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
//           Back to Dashboard
//         </Link>
//       </div>
//     );
//   }
  
  if (loading || !assessment) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-700">
      {loading ? (
        <p>Loading assessment...</p>
      ) : (
        <p>Assessment is being generated, please wait...</p>
      )}
    </div>
  );
}

  const paper = assessment.generatedPaper;
  const totalQuestions =
    paper?.sections?.reduce((sum, s) => sum + s.questions.length, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {assessment.input?.title || "Untitled Assessment"}
            </h1>
            <p className="text-gray-500">
              {assessment.input?.subject || "Unknown subject"}
            </p>
          </div>
        </div>
        <StatusBadge status={assessment.status} />
      </div>

      {/* Processing State */}
      {(assessment.status === "pending" || assessment.status === "processing") && (
        <div className="card text-center py-16 mb-6">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {assessment.status === "pending"
              ? "Queued for generation..."
              : "AI is generating your paper..."}
          </h2>
          <p className="text-gray-500">
            {statusMessage || "This usually takes 15-30 seconds"}
          </p>
        </div>
      )}

      {/* Failed State */}
      {assessment.status === "failed" && (
        <div className="card text-center py-12 mb-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Generation Failed</h2>
          <p className="text-red-600 mb-4">{assessment.error || "Unknown error"}</p>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`}
            />
            Try Again
          </button>
        </div>
      )}

      {/* Completed — Show Paper */}
      {assessment.status === "completed" && paper && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-xs text-gray-500">Questions</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <Award className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{paper.totalMarks || 0}</p>
                <p className="text-xs text-gray-500">Total Marks</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{paper.duration || 0}</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{paper.sections?.length || 0}</p>
                <p className="text-xs text-gray-500">Sections</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <a
              href={getDownloadURL(id!)}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`}
              />
              Regenerate
            </button>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="btn-secondary flex items-center gap-2"
            >
              {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
          </div>

          {/* General Instructions */}
          {paper.generalInstructions?.length > 0 && (
            <div className="card mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">General Instructions</h3>
              <ul className="space-y-1">
                {paper.generalInstructions.map((inst, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections & Questions */}
          {paper.sections?.map((section, i) => (
            <div key={i} className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {section.title || "Section"}
                </h2>
                <p className="text-sm text-gray-500 italic">{section.instruction || ""}</p>
              </div>
              <div className="space-y-3">
                {section.questions.map((q) => (
                  <QuestionCard key={q.questionNumber} question={q} showAnswer={showAnswers} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}