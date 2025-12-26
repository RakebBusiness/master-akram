import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { coursesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const data = await coursesApi.getById(Number(id));
        setCourse(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/courses"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  course.niveau === 'Algo1'
                    ? 'bg-green-500'
                    : 'bg-orange-500'
                }`}
              >
                {course.niveau}
              </span>
              {course.duree && (
                <div className="flex items-center text-blue-100">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{course.duree}</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.titre}</h1>
            <p className="text-xl text-blue-100">{course.description}</p>
          </div>

          {course.topics && course.topics.length > 0 && (
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Topics Covered</h2>
              <div className="flex flex-wrap gap-2">
                {course.topics.map((topic: any) => (
                  <span
                    key={topic.idTopic}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {topic.nom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {course.content && course.content.length > 0 && (
            <div className="px-8 py-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              <div className="space-y-6">
                {course.content.map((section: any) => (
                  <div key={section.idSection} className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{section.section}</h3>
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {section.theorie}
                      </p>
                    </div>
                    {section.codeExample && (
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-100">
                          <code>{section.codeExample}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {course.contenu && !course.content && (
            <div className="px-8 py-6">
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {course.contenu}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Practice?</h3>
          <p className="text-blue-100 mb-6">
            Test your knowledge with exercises related to this course
          </p>
          <Link
            to="/exercises"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Go to Exercises
          </Link>
        </div>
      </div>
    </div>
  );
}
