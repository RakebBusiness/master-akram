import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from '../components/ens-panel/Exercise/ExerciseCard';
import Quiz from '../components/Quiz';
import CodeEditor from '../components/Exercise/MonacoEditor/MonacoEditor';
import { exercisesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Exercises() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'Multiple choice' | 'Text Answer' | 'Code'>('all');
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Reset code when changing exercise
  useEffect(() => {
    setCode('');
  }, [selectedExercise]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const data = await exercisesApi.getAll();
        setExercises(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handleExerciseClick = (exercise: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedExercise(exercise);
  };

  const handleCompleteExercise = () => {
    if (selectedExercise) {
      setCompletedExercises(new Set([...completedExercises, selectedExercise.idExercice]));
    }
  };

  // Fonction SIMPLE de soumission de code (sans ExerciseService)
  const handleCodeSubmit = async () => {
    if (!selectedExercise || !code) return;
    
    // Version simplifiée - juste pour démo
    const hasCode = code.trim().length > 0;
    
    if (hasCode) {
      // Simule un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      handleCompleteExercise();
      alert('Code soumis avec succès ! (Mode démo - aucune validation réelle)');
    } else {
      alert('Veuillez écrire du code avant de soumettre.');
    }
  };

  const filteredExercises =
    filter === 'all' ? exercises : exercises.filter((ex: any) => ex.Type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading exercises...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedExercise ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Practice Exercises
              </h1>
              <p className="text-xl text-gray-600">
                Test your knowledge with interactive exercises
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('Multiple choice')}
                className={`px-5 py-2 rounded-lg font-medium ${
                  filter === 'Multiple choice'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Multiple Choice
              </button>
              <button
                onClick={() => setFilter('Text Answer')}
                className={`px-5 py-2 rounded-lg font-medium ${
                  filter === 'Text Answer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Text Answer
              </button>
              <button
                onClick={() => setFilter('Code')}
                className={`px-5 py-2 rounded-lg font-medium ${
                  filter === 'Code'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Code
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-medium">
                Progress: {completedExercises.size} / {exercises.length}
              </p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{
                    width: `${(completedExercises.size / exercises.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise: any) => (
                <ExerciseCard
                  key={exercise.idExercice}
                  exercise={exercise}
                  onClick={() => handleExerciseClick(exercise)}
                  isCompleted={completedExercises.has(exercise.idExercice)}
                />
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <div className="text-center text-gray-600 mt-12">
                No exercises available
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedExercise(null)}
              className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              ← Back to Exercises
            </button>

            {(selectedExercise.Type === 'Multiple choice' || selectedExercise.Type === 'Text Answer') && (
              <Quiz exercise={selectedExercise} onComplete={handleCompleteExercise} />
            )}

            {selectedExercise.Type === 'Code' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedExercise.titre}
                </h2>

                <p className="text-gray-700 mb-6 whitespace-pre-wrap">
                  {selectedExercise.enonce}
                </p>

                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="javascript"
                  height="400px"
                />

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleCodeSubmit}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Submit Code
                  </button>
                  
                  <button
                    onClick={() => {
                      // Juste pour tester - exécute le code dans la console
                      try {
                        // Ne PAS utiliser eval() en production !
                        console.log('Code to execute:', code);
                        alert('Code exécuté dans la console (mode développement)');
                      } catch (err) {
                        alert('Erreur dans le code');
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Run Code
                  </button>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>💡 Mode démo : La validation réelle du code n'est pas encore implémentée.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}