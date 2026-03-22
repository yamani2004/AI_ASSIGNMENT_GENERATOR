import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, X, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAssessment, uploadFile } from '../services/api';
import type { QuestionType } from '../types';

const questionTypeOptions: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'short', label: 'Short Answer' },
  { value: 'long', label: 'Long Answer' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
];

export default function CreateAssessment() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    subject: '',
    dueDate: '',
    duration: '3 Hours',
    questionTypes: ['mcq'] as string[],
    numberOfQuestions: 10,
    totalMarks: 50,
    difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
    additionalInstructions: '',
    fileContent: '',
    fileName: '',
  });

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateDifficulty(level: 'easy' | 'medium' | 'hard', value: number) {
    setForm((prev) => ({
      ...prev,
      difficultyDistribution: { ...prev.difficultyDistribution, [level]: value },
    }));
  }

  function toggleQuestionType(type: string) {
    setForm((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
    }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadFile(file);
      if (res.success) {
        updateField('fileContent', res.data.content);
        updateField('fileName', res.data.fileName);
        toast.success(`File "${res.data.fileName}" uploaded successfully`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'File upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { easy, medium, hard } = form.difficultyDistribution;
    if (easy + medium + hard !== 100) {
      toast.error('Difficulty percentages must add up to 100');
      return;
    }

    if (form.questionTypes.length === 0) {
      toast.error('Select at least one question type');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAssessment(form);
      if (res.success) {
        toast.success('Assessment queued for generation!');
        navigate(`/assessment/${res.data.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; details?: Array<{ field: string; message: string }> } } };
      const details = error.response?.data?.details;
      if (details && Array.isArray(details)) {
        details.forEach((d) => toast.error(`${d.field}: ${d.message}`));
      } else {
        toast.error(error.response?.data?.error || 'Failed to create assessment');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const diffTotal =
    form.difficultyDistribution.easy +
    form.difficultyDistribution.medium +
    form.difficultyDistribution.hard;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Assessment</h1>
      <p className="text-gray-500 mb-8">Configure your AI-generated question paper</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Mid-Term Physics Exam"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Physics"
                value={form.subject}
                onChange={(e) => updateField('subject', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                className="input-field"
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 3 Hours"
                value={form.duration}
                onChange={(e) => updateField('duration', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Question Config */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Question Configuration</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Types *</label>
            <div className="flex flex-wrap gap-2">
              {questionTypeOptions.map((qt) => (
                <button
                  type="button"
                  key={qt.value}
                  onClick={() => toggleQuestionType(qt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.questionTypes.includes(qt.value)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions: {form.numberOfQuestions}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={form.numberOfQuestions}
                onChange={(e) => updateField('numberOfQuestions', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span>
                <span>50</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks: {form.totalMarks}
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={form.totalMarks}
                onChange={(e) => updateField('totalMarks', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>10</span>
                <span>200</span>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Difficulty Distribution</h2>
            <span className={`text-sm font-medium ${diffTotal === 100 ? 'text-green-600' : 'text-red-600'}`}>
              Total: {diffTotal}%
            </span>
          </div>

          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <div key={level}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {level}: {form.difficultyDistribution[level]}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.difficultyDistribution[level]}
                onChange={(e) => updateDifficulty(level, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          ))}

          {diffTotal !== 100 && (
            <p className="text-sm text-red-500">⚠ Percentages must add up to 100%</p>
          )}
        </div>

        {/* File Upload */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Reference Material (Optional)</h2>
          <p className="text-sm text-gray-500">Upload a PDF or text file to generate questions from</p>

          {form.fileName ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{form.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateField('fileContent', '');
                  updateField('fileName', '');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {uploading ? 'Uploading...' : 'Click to upload PDF or TXT'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Additional Instructions */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Additional Instructions (Optional)</h2>
          <textarea
            className="input-field h-24 resize-none"
            placeholder="e.g. Focus on Chapter 5-8, include real-world applications..."
            value={form.additionalInstructions}
            onChange={(e) => updateField('additionalInstructions', e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || diffTotal !== 100}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Assessment
            </>
          )}
        </button>
      </form>
    </div>
  );
}