import type { QuestionItem } from '../types';

interface Props {
  question: QuestionItem;
  showAnswer?: boolean;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const typeLabels: Record<string, string> = {
  mcq: 'MCQ',
  short: 'Short Answer',
  long: 'Long Answer',
  true_false: 'True/False',
  fill_blank: 'Fill in the Blank',
};

export default function QuestionCard({ question, showAnswer = false }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-500">Q{question.questionNumber}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {typeLabels[question.type] || question.type}
          </span>
        </div>
        <span className="text-sm font-medium text-blue-600 whitespace-nowrap">
          {question.marks} mark{question.marks > 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-gray-800 leading-relaxed">{question.text}</p>

      {question.type === 'mcq' && question.options && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded-md bg-gray-50 text-sm"
            >
              <span className="font-medium text-gray-500">
                {String.fromCharCode(97 + i)})
              </span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {showAnswer && question.answer && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <span className="text-xs font-medium text-green-700">Answer: </span>
          <span className="text-sm text-green-800">{question.answer}</span>
        </div>
      )}
    </div>
  );
}