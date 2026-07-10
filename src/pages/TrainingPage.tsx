import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import { BookOpen, Play, CheckCircle, Clock, User, BarChart3, Plus, Search, ClipboardCheck, Award, GraduationCap, ChevronRight, FileDown, XCircle } from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import type { Course, Enrollment, Quiz, QuizAttempt } from '../types';

const statusConfig: Record<string, { label: string; variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }> = {
  enrolled: { label: 'Inscrit', variant: 'blue' },
  in_progress: { label: 'En cours', variant: 'yellow' },
  completed: { label: 'Terminé', variant: 'green' },
};

const categoryVariants: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  Développement: 'blue',
  Design: 'yellow',
  Management: 'green',
  Finance: 'red',
  RH: 'gray',
};

function getCategoryVariant(category: string): 'blue' | 'green' | 'yellow' | 'red' | 'gray' {
  return categoryVariants[category] || 'blue';
}

export default function TrainingPage() {
  const { currentUser } = useApp();
  const { courses, enrollments, enrollCourse, updateLessonProgress, quizzes, certificates, submitQuizAttempt } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();

  const [activeTab, setActiveTab] = useState<'catalogue' | 'my' | 'quiz' | 'certificates'>('catalogue');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, []);

  const userEnrollments = enrollments.filter((e) => e.employeeId === currentUser?.id);

  const getCourseEnrollment = (courseId: string) =>
    userEnrollments.find((e) => e.courseId === courseId);

  const isEnrolled = (courseId: string) => !!getCourseEnrollment(courseId);

  const getEnrolledCourse = (enrollment: Enrollment) =>
    courses.find((c) => c.id === enrollment.courseId);

  const handleEnroll = (courseId: string) => {
    if (!currentUser) return;
    try {
      enrollCourse(currentUser.id, courseId);
      addToast('Inscription réussie', 'success');
    } catch {
      addToast("Erreur lors de l'inscription", 'error');
    }
  };

  const handleMarkLesson = (enrollmentId: string, lessonId: string) => {
    try {
      updateLessonProgress(enrollmentId, lessonId);
      addToast('Leçon marquée comme terminée', 'success');
    } catch {
      addToast('Erreur lors du marquage de la leçon', 'error');
    }
  };

  const handleContinue = (enrollment: Enrollment) => {
    const course = getEnrolledCourse(enrollment);
    if (course) setSelectedCourse(course);
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz || !currentUser) return;
    try {
      const result = submitQuizAttempt({
        quizId: selectedQuiz.id,
        courseId: selectedQuiz.courseId,
        employeeId: currentUser.id,
        answers: quizAnswers,
        score: 0,
        totalPoints: 0,
      });
      setQuizResult(result);
      if (result.passed) {
        setShowConfetti(true);
        addToast('Félicitations ! Certificat émis avec succès', 'success');
        confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch {
      addToast('Erreur lors de la soumission du quiz', 'error');
    }
  };

  const handleCloseQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setQuizResult(null);
    setShowConfetti(false);
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEnrollments = [...userEnrollments].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const selectedEnrollment = selectedCourse ? getCourseEnrollment(selectedCourse.id) : null;

  const userCertificates = certificates.filter((c) => c.employeeId === currentUser?.id);

  const catalogTab = (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
          <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aucune formation disponible</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col"
            onClick={() => setSelectedCourse(course)}
          >
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={getCategoryVariant(course.category)}>{course.category}</Badge>
                {isEnrolled(course.id) && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center space-x-1">
                    <CheckCircle size={14} />
                    <span>Inscrit</span>
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <User size={14} />
                  <span>{course.instructor}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{course.duration}h</span>
                </span>
                <span className="flex items-center space-x-1">
                  <BarChart3 size={14} />
                  <span>{course.enrolledCount} inscrits</span>
                </span>
              </div>
            </div>
            <div className="px-5 pb-4">
              {isEnrolled(course.id) ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Play size={16} />
                  <span>Continuer</span>
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleEnroll(course.id); }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>S'inscrire</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const myTab = (
    <div className="space-y-3">
      {sortedEnrollments.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
          <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Vous n'êtes inscrit à aucune formation</p>
        </div>
      )}
      {sortedEnrollments.map((enrollment) => {
        const course = getEnrolledCourse(enrollment);
        if (!course) return null;
        const cfg = statusConfig[enrollment.status];
        return (
          <div
            key={enrollment.id}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{course.title}</h3>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center space-x-1">
                    <User size={14} />
                    <span>{course.instructor}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{course.duration}h</span>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden max-w-xs">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${enrollment.progress}%`,
                        background: enrollment.progress === 100
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                    {enrollment.progress}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleContinue(enrollment)}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <Play size={16} />
                <span>Continuer</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const quizTab = (
    <div className="space-y-3">
      {quizzes.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
          <ClipboardCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aucun quiz disponible</p>
        </div>
      )}
      {quizzes.map((quiz) => {
        const course = courses.find((c) => c.id === quiz.courseId);
        return (
          <div
            key={quiz.id}
            onClick={() => {
              setSelectedQuiz(quiz);
              setCurrentQuestionIndex(0);
              setQuizAnswers([]);
              setQuizResult(null);
            }}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ClipboardCheck size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{quiz.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <BookOpen size={14} />
                    <span>{course?.title || 'Formation inconnue'}</span>
                  </span>
                  <span>{quiz.questions.length} questions</span>
                  <span>Score requis: {quiz.passingScore} pts</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );

  const certificatesTab = (
    <div className="space-y-3">
      {userCertificates.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
          <Award size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aucun certificat obtenu</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Réussissez un quiz pour obtenir un certificat</p>
        </div>
      )}
      {userCertificates.map((cert) => {
        const course = courses.find((c) => c.id === cert.courseId);
        return (
          <div
            key={cert.id}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <GraduationCap size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{course?.title || 'Formation inconnue'}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>Délivré le {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}</span>
                  {cert.expiresAt && (
                    <span>Expire le {new Date(cert.expiresAt).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </div>
            </div>
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <FileDown size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          <style>{`@keyframes confetti-fall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#ec4899'][i % 6],
                animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Formations & E-learning</h1>
        <p className="text-gray-500 dark:text-gray-400">Développez vos compétences avec nos formations</p>
      </div>

      <div className="flex flex-wrap space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'catalogue'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <BookOpen size={18} />
          <span>Catalogue</span>
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'my'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Play size={18} />
          <span>Mes formations</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'quiz'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <ClipboardCheck size={18} />
          <span>Quiz</span>
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'certificates'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Award size={18} />
          <span>Certificats</span>
        </button>
      </div>

      {activeTab === 'catalogue' && catalogTab}
      {activeTab === 'my' && myTab}
      {activeTab === 'quiz' && quizTab}
      {activeTab === 'certificates' && certificatesTab}

      <Modal
        open={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title || 'Détails de la formation'}
        maxWidth="lg"
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getCategoryVariant(selectedCourse.category)}>{selectedCourse.category}</Badge>
              <span className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <User size={14} />
                <span>{selectedCourse.instructor}</span>
              </span>
              <span className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock size={14} />
                <span>{selectedCourse.duration}h</span>
              </span>
              <span className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <BarChart3 size={14} />
                <span>{selectedCourse.enrolledCount} inscrits</span>
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedCourse.description}</p>

            {selectedEnrollment && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progression</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedEnrollment.progress}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedEnrollment.progress}%`,
                      background: selectedEnrollment.progress === 100
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <BookOpen size={18} />
                <span>Leçons ({selectedCourse.lessons.length})</span>
              </h4>
              <div className="space-y-2">
                {selectedCourse.lessons
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => {
                    const isCompleted = selectedEnrollment?.completedLessons.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isCompleted
                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {isCompleted ? (
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
                              {lesson.title}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{lesson.duration} min</span>
                            </span>
                          </div>
                        </div>
                        {selectedEnrollment && !isCompleted && (
                          <button
                            onClick={() => handleMarkLesson(selectedEnrollment.id, lesson.id)}
                            className="flex items-center space-x-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 ml-3"
                          >
                            <CheckCircle size={14} />
                            <span>Marquer comme terminé</span>
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium flex-shrink-0 ml-3">Terminé</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {!selectedEnrollment && (
              <button
                onClick={() => { handleEnroll(selectedCourse.id); setSelectedCourse(null); }}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span>S'inscrire à cette formation</span>
              </button>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!selectedQuiz}
        onClose={handleCloseQuiz}
        title={selectedQuiz?.title || 'Quiz'}
        maxWidth="lg"
      >
        {selectedQuiz && !quizResult && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100)}%
                </span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {selectedQuiz.questions[currentQuestionIndex].text}
              </h3>
              <div className="space-y-3">
                {selectedQuiz.questions[currentQuestionIndex].options.map((option, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      quizAnswers[currentQuestionIndex] === oi
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      checked={quizAnswers[currentQuestionIndex] === oi}
                      onChange={() => handleSelectAnswer(currentQuestionIndex, oi)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                        quizAnswers[currentQuestionIndex] === oi
                          ? 'border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {quizAnswers[currentQuestionIndex] === oi && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        quizAnswers[currentQuestionIndex] === oi
                          ? 'text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={quizAnswers[currentQuestionIndex] === undefined}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedQuiz.questions.some((_, i) => quizAnswers[i] === undefined)}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Soumettre
                </button>
              )}
            </div>
          </div>
        )}

        {selectedQuiz && quizResult && (
          <div className="text-center space-y-5 py-6">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                quizResult.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              {quizResult.passed ? (
                <Award size={40} className="text-green-600 dark:text-green-400" />
              ) : (
                <XCircle size={40} className="text-red-600 dark:text-red-400" />
              )}
            </div>
            <h3
              className={`text-2xl font-bold ${
                quizResult.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {quizResult.passed ? 'Félicitations !' : 'Échoué'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Score: {quizResult.score} / {quizResult.totalPoints} pts
            </p>
            {quizResult.passed && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300 flex items-center justify-center space-x-2">
                <GraduationCap size={20} />
                <span>Certificat émis avec succès ! Vérifiez l'onglet Certificats.</span>
              </div>
            )}
            <button
              onClick={handleCloseQuiz}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
