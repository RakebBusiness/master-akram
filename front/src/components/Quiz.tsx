import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Exercise } from '../data/exercises';

interface QuizProps {
  exercise: Exercise;
  onComplete: () => void;
}

export default function Quiz({ exercise, onComplete }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const exerciseType = (exercise as any).Type || exercise.type;
  const exerciseTitle = (exercise as any).titre || exercise.title;
  const exerciseStatement = (exercise as any).Contenu || exercise.statement;

  const handleSubmit = () => {
    if (exerciseType === 'Multiple choice' || exerciseType === 'qcm') {
      const correct = selectedAnswer === exercise.correctAnswer;
      setIsCorrect(correct);
      setSubmitted(true);
      if (correct) {
        setTimeout(onComplete, 1500);
      }
    } else if (exerciseType === 'Text Answer' || exerciseType === 'quiz') {
      const correct = textAnswer.trim().toLowerCase() === String(exercise.correctAnswer).toLowerCase();
      setIsCorrect(correct);
      setSubmitted(true);
      if (correct) {
        setTimeout(onComplete, 1500);
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setTextAnswer('');
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{exerciseTitle}</h2>
      <div className="mb-6">
        <p className="text-gray-700 whitespace-pre-wrap">{exerciseStatement}</p>
      </div>

      {(exerciseType === 'Multiple choice' || exerciseType === 'qcm') && exercise.options && (
        <div className="space-y-3 mb-6">
          {exercise.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !submitted && setSelectedAnswer(index)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? submitted
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-900">{option}</span>
                {submitted && selectedAnswer === index && (
                  isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {(exerciseType === 'Text Answer' || exerciseType === 'quiz') && (
        <div className="mb-6">
          <input
            type="text"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={submitted}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      )}

      {submitted && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <p className="font-medium">
            {isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!'}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={
              ((exerciseType === 'Multiple choice' || exerciseType === 'qcm') && selectedAnswer === null) ||
              ((exerciseType === 'Text Answer' || exerciseType === 'quiz') && !textAnswer.trim())
            }
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
