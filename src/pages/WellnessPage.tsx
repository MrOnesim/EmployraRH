import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import { Heart, Smile, Frown, Brain, Activity, Plus, BarChart3 } from 'lucide-react';
import Modal from '../components/Modal';
import type { WellnessSurvey, WellnessQuestion, WellnessResponse } from '../types';

const categoryIcons: Record<string, typeof Heart> = {
  satisfaction: Smile,
  stress: Frown,
  motivation: Brain,
  workload: Activity,
  environment: Heart,
};

const categoryLabels: Record<string, string> = {
  satisfaction: 'Satisfaction',
  stress: 'Stress',
  motivation: 'Motivation',
  workload: 'Charge de travail',
  environment: 'Environnement',
};

const categoryColors: Record<string, string> = {
  satisfaction: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  stress: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  motivation: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  workload: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  environment: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Heart
            size={20}
            className={star <= value ? 'text-red-500 fill-red-500' : 'text-gray-300 dark:text-gray-600'}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500">{value}/5</span>
    </div>
  );
}

const questionTypeDefault = { text: '', type: 'rating' as WellnessQuestion['type'], category: 'satisfaction' as WellnessQuestion['category'], options: '' };

export default function WellnessPage() {
  const { currentUser } = useApp();
  const { wellnessSurveys, wellnessResponses, addWellnessSurvey, submitWellnessResponse, employees } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();

  const [activeTab, setActiveTab] = useState<'surveys' | 'dashboard'>('surveys');
  const [selectedSurvey, setSelectedSurvey] = useState<WellnessSurvey | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | string | boolean>>({});
  const [anonymous, setAnonymous] = useState(true);

  // New survey modal
  const [showNewSurvey, setShowNewSurvey] = useState(false);
  const [surveyForm, setSurveyForm] = useState({ title: '', description: '', expiresAt: '', active: true });
  const [surveyQuestions, setSurveyQuestions] = useState<{ text: string; type: WellnessQuestion['type']; category: WellnessQuestion['category']; options: string }[]>([]);

  const activeSurveys = wellnessSurveys.filter((s) => s.active);
  const inactiveSurveys = wellnessSurveys.filter((s) => !s.active);

  const handleOpenSurvey = (survey: WellnessSurvey) => {
    setSelectedSurvey(survey);
    setAnswers({});
    setAnonymous(true);
  };

  const handleAnswer = (questionId: string, value: number | string | boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitResponse = () => {
    if (!selectedSurvey || !currentUser) return;
    const allQuestions = selectedSurvey.questions;
    const missing = allQuestions.filter((q) => answers[q.id] === undefined);
    if (missing.length > 0) {
      addToast('Veuillez répondre à toutes les questions', 'error');
      return;
    }
    try {
      submitWellnessResponse({
        surveyId: selectedSurvey.id,
        employeeId: currentUser.id,
        answers: Object.fromEntries(allQuestions.map((q) => [q.id, answers[q.id]])) as Record<string, string | number | boolean>,
        submittedAt: new Date(),
        anonymous,
      });
      addToast('Réponse soumise anonymement', 'success');
      setSelectedSurvey(null);
    } catch {
      addToast('Erreur lors de la soumission des réponses', 'error');
    }
  };

  const addQuestion = () => {
    setSurveyQuestions((prev) => [...prev, { ...questionTypeDefault }]);
  };

  const removeQuestion = (index: number) => {
    setSurveyQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    setSurveyQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCreateSurvey = () => {
    if (!surveyForm.title.trim()) {
      addToast('Veuillez saisir un titre', 'error');
      return;
    }
    if (surveyQuestions.length === 0) {
      addToast('Ajoutez au moins une question', 'error');
      return;
    }
    const hasEmpty = surveyQuestions.some((q) => !q.text.trim());
    if (hasEmpty) {
      addToast('Toutes les questions doivent avoir un texte', 'error');
      return;
    }
    const hasInvalidMultiple = surveyQuestions.some((q) => q.type === 'multiple' && !q.options.trim());
    if (hasInvalidMultiple) {
      addToast('Les questions à choix multiples doivent avoir des options', 'error');
      return;
    }
    try {
      addWellnessSurvey({
        title: surveyForm.title,
        description: surveyForm.description,
        questions: surveyQuestions.map((q) => ({
          id: crypto.randomUUID(),
          text: q.text,
          type: q.type,
          category: q.category,
          options: q.type === 'multiple' ? q.options.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
        })),
        active: surveyForm.active,
        expiresAt: surveyForm.expiresAt ? new Date(surveyForm.expiresAt) : undefined,
      });
      addToast('Sondage créé avec succès', 'success');
      setShowNewSurvey(false);
      setSurveyForm({ title: '', description: '', expiresAt: '', active: true });
      setSurveyQuestions([]);
    } catch {
      addToast('Erreur lors de la création du sondage', 'error');
    }
  };

  const getResponsesForSurvey = (surveyId: string) => wellnessResponses.filter((r) => r.surveyId === surveyId);

  const calcAverage = (responses: WellnessResponse[], questionId: string): number => {
    const vals = responses
      .map((r) => r.answers[questionId])
      .filter((v): v is number => typeof v === 'number');
    if (vals.length === 0) return 0;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  };

  const getCategoryAverages = (survey: WellnessSurvey) => {
    const responses = getResponsesForSurvey(survey.id);
    const categories = [...new Set(survey.questions.filter((q) => q.type === 'rating').map((q) => q.category))];
    return categories.map((cat) => {
      const catQuestions = survey.questions.filter((q) => q.category === cat && q.type === 'rating');
      const averages = catQuestions.map((q) => calcAverage(responses, q.id));
      const avg = averages.length > 0 ? averages.reduce((s, v) => s + v, 0) / averages.length : 0;
      return { category: cat, label: categoryLabels[cat] || cat, average: avg, icon: categoryIcons[cat] || Heart };
    });
  };

  const getParticipationRate = (survey: WellnessSurvey) => {
    const uniqueRespondents = new Set(getResponsesForSurvey(survey.id).map((r) => r.employeeId));
    const total = employees.filter((e) => e.status === 'active').length;
    return total > 0 ? (uniqueRespondents.size / total) * 100 : 0;
  };

  const getResponseSummaryText = (question: WellnessQuestion, responses: WellnessResponse[]) => {
    const answers = responses.map((r) => r.answers[question.id]).filter((v) => v !== undefined);
    if (answers.length === 0) return 'Aucune réponse';
    if (question.type === 'rating') {
      const nums = answers.filter((v): v is number => typeof v === 'number');
      const avg = nums.length > 0 ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
      return `Moyenne: ${avg.toFixed(1)}/5`;
    }
    if (question.type === 'yesno') {
      const yes = answers.filter((v) => v === true).length;
      const no = answers.filter((v) => v === false).length;
      return `Oui: ${yes} | Non: ${no}`;
    }
    if (question.type === 'multiple') {
      const counts: Record<string, number> = {};
      answers.forEach((v) => { const k = String(v); counts[k] = (counts[k] || 0) + 1; });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
    }
    return `${answers.length} réponses textuelles`;
  };

  const renderQuestionInput = (q: WellnessQuestion) => {
    if (q.type === 'rating') {
      return <StarRating value={Number(answers[q.id] || 0)} onChange={(v) => handleAnswer(q.id, v)} />;
    }
    if (q.type === 'yesno') {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleAnswer(q.id, true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              answers[q.id] === true
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            <Smile size={18} />
            <span>Oui</span>
          </button>
          <button
            onClick={() => handleAnswer(q.id, false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              answers[q.id] === false
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            <Frown size={18} />
            <span>Non</span>
          </button>
        </div>
      );
    }
    if (q.type === 'text') {
      return (
        <textarea
          value={String(answers[q.id] || '')}
          onChange={(e) => handleAnswer(q.id, e.target.value)}
          rows={3}
          placeholder="Votre réponse..."
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      );
    }
    if (q.type === 'multiple' && q.options) {
      return (
        <div className="space-y-2">
          {q.options.map((opt) => (
            <label
              key={opt}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                answers[q.id] === opt
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[q.id] === opt}
                onChange={() => handleAnswer(q.id, opt)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                answers[q.id] === opt ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    return null;
  };

  const surveyCard = (survey: WellnessSurvey) => {
    const CatIcon = categoryIcons[survey.questions[0]?.category] || Heart;
    return (
      <div
        key={survey.id}
        onClick={() => handleOpenSurvey(survey)}
        className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${categoryColors[survey.questions[0]?.category] || 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'}`}>
            <CatIcon size={22} />
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            survey.active
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {survey.active ? 'Actif' : 'Inactif'}
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{survey.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{survey.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">{survey.questions.length} question{survey.questions.length > 1 ? 's' : ''}</span>
          <span className="text-gray-400">{getResponsesForSurvey(survey.id).length} réponse{getResponsesForSurvey(survey.id).length > 1 ? 's' : ''}</span>
        </div>
      </div>
    );
  };

  const adminDashboard = currentUser?.role === 'ADMIN' && (
    <div className="space-y-6">
      {wellnessSurveys.map((survey) => {
        const responses = getResponsesForSurvey(survey.id);
        const categoryAverages = getCategoryAverages(survey);
        const participationRate = getParticipationRate(survey);
        return (
          <div key={survey.id} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-1">{survey.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{survey.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Taux de participation</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{participationRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">{responses.length} réponse{responses.length > 1 ? 's' : ''} sur {employees.filter((e) => e.status === 'active').length} employés</p>
              </div>
              {categoryAverages.map((ca) => {
                const Icon = ca.icon;
                return (
                  <div key={ca.category} className={`rounded-xl p-4 ${categoryColors[ca.category]}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon size={16} />
                      <p className="text-sm font-medium">{ca.label}</p>
                    </div>
                    <p className="text-2xl font-bold">{ca.average.toFixed(1)}<span className="text-sm font-normal">/5</span></p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">Résumé des réponses</h4>
              {survey.questions.map((q) => (
                <div key={q.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{q.text}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{q.type}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getResponseSummaryText(q, responses)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {wellnessSurveys.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
          <BarChart3 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aucun sondage disponible pour le tableau de bord</p>
        </div>
      )}
    </div>
  );

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bien-être des employés</h1>
          <p className="text-gray-500 dark:text-gray-400">Sondages anonymes de satisfaction, stress et motivation</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setShowNewSurvey(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Nouveau sondage</span>
          </button>
        )}
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('surveys')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'surveys'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Heart size={18} />
          <span>Sondages</span>
        </button>
        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 size={18} />
            <span>Tableau de bord</span>
          </button>
        )}
      </div>

      {activeTab === 'surveys' && (
        <>
          {activeSurveys.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Sondages actifs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeSurveys.map(surveyCard)}
              </div>
            </div>
          )}
          {inactiveSurveys.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Sondages passés</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {inactiveSurveys.map(surveyCard)}
              </div>
            </div>
          )}
          {wellnessSurveys.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
              <Heart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucun sondage disponible</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'dashboard' && adminDashboard}

      <Modal
        open={!!selectedSurvey}
        onClose={() => setSelectedSurvey(null)}
        title={selectedSurvey?.title || 'Sondage'}
        maxWidth="lg"
      >
        {selectedSurvey && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSurvey.description}</p>

            <div className="space-y-5">
              {selectedSurvey.questions.map((q, idx) => {
                const CatIcon = categoryIcons[q.category] || Heart;
                return (
                  <div key={q.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{idx + 1}.</span>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{q.text}</p>
                      <span className={`p-1 rounded ${categoryColors[q.category]}`}>
                        <CatIcon size={14} />
                      </span>
                    </div>
                    {renderQuestionInput(q)}
                  </div>
                );
              })}
            </div>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Soumettre anonymement</span>
            </label>

            <button
              onClick={handleSubmitResponse}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Heart size={18} />
              <span>Envoyer mes réponses</span>
            </button>
          </div>
        )}
      </Modal>

      <Modal
        open={showNewSurvey}
        onClose={() => { setShowNewSurvey(false); setSurveyQuestions([]); }}
        title="Nouveau sondage bien-être"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input
              type="text"
              value={surveyForm.title}
              onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
              placeholder="Titre du sondage"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={surveyForm.description}
              onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
              rows={2}
              placeholder="Description du sondage..."
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'expiration</label>
              <input
                type="date"
                value={surveyForm.expiresAt}
                onChange={(e) => setSurveyForm({ ...surveyForm, expiresAt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select
                value={surveyForm.active ? 'active' : 'inactive'}
                onChange={(e) => setSurveyForm({ ...surveyForm, active: e.target.value === 'active' })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Questions</label>
              <button
                onClick={addQuestion}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} />
                <span>Ajouter une question</span>
              </button>
            </div>
            <div className="space-y-3">
              {surveyQuestions.map((q, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Question {i + 1}</span>
                    <button
                      onClick={() => removeQuestion(i)}
                      className="text-red-400 hover:text-red-500 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                    placeholder="Texte de la question"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-3"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</label>
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="rating">Note (1-5)</option>
                        <option value="yesno">Oui / Non</option>
                        <option value="text">Texte libre</option>
                        <option value="multiple">Choix multiples</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Catégorie</label>
                      <select
                        value={q.category}
                        onChange={(e) => updateQuestion(i, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="satisfaction">Satisfaction</option>
                        <option value="stress">Stress</option>
                        <option value="motivation">Motivation</option>
                        <option value="workload">Charge de travail</option>
                        <option value="environment">Environnement</option>
                      </select>
                    </div>
                  </div>
                  {q.type === 'multiple' && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Options (séparées par des virgules)</label>
                      <input
                        type="text"
                        value={q.options}
                        onChange={(e) => updateQuestion(i, 'options', e.target.value)}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => { setShowNewSurvey(false); setSurveyQuestions([]); }}
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateSurvey}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
            >
              Créer le sondage
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
