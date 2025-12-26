import React from 'react';

interface ExerciseCardProps {
  exercise: {
    idExercice: string;
    titre: string;
    enonce: string;
    Type: string;
    difficulte?: string;
    dureeEstimee?: number;
  };
  onClick: () => void;
  isCompleted: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick, isCompleted }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Multiple choice':
        return 'bg-teal-100 text-teal-800';
      case 'Text Answer':
        return 'bg-blue-100 text-blue-800';
      case 'Code':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulte?: string) => {
    switch (difficulte?.toLowerCase()) {
      case 'facile':
        return 'bg-green-100 text-green-800';
      case 'moyen':
        return 'bg-yellow-100 text-yellow-800';
      case 'difficile':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        isCompleted ? 'border-2 border-green-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{exercise.titre}</h3>
            <p className="text-gray-600 line-clamp-2">{exercise.enonce}</p>
          </div>
          {isCompleted && (
            <div className="ml-4">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Completed
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(exercise.Type)}`}>
            {exercise.Type}
          </span>
          
          {exercise.difficulte && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulte)}`}>
              {exercise.difficulte}
            </span>
          )}
          
          {exercise.dureeEstimee && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              {exercise.dureeEstimee} min
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;