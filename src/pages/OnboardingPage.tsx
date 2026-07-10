import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Users, DollarSign, Calendar, Building2, FileText, Shield, QrCode, GraduationCap } from 'lucide-react';

const STORAGE_KEY = 'onboarding_progress';

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const STEPS: OnboardingStep[] = [
  { id: 'employees', label: 'Ajouter des employés', description: 'Créez les fiches de vos collaborateurs', icon: <Users size={20} />, link: '/admin/employees' },
  { id: 'org-chart', label: 'Organigramme', description: 'Structurez votre entreprise', icon: <Building2 size={20} />, link: '/admin/org-chart' },
  { id: 'salary', label: 'Configurer les salaires', description: 'Définissez les rémunérations', icon: <DollarSign size={20} />, link: '/admin/salary' },
  { id: 'leave-policy', label: 'Politique de congés', description: 'Configurez les droits par type', icon: <Calendar size={20} />, link: '/admin/leave-policy' },
  { id: 'payroll', label: 'Paramètres de paie', description: 'Choisissez votre pays et taux', icon: <FileText size={20} />, link: '/admin/settings' },
  { id: 'roles', label: 'Attribuer les rôles', description: 'Définissez les accès de chacun', icon: <Shield size={20} />, link: '/admin/roles' },
  { id: 'qr-pointage', label: 'Configurer le pointage QR', description: 'Ou activez le scan quotidien', icon: <QrCode size={20} />, link: '/admin/qr-settings' },
  { id: 'training', label: 'Offrir des formations', description: 'Ajoutez des cours à votre catalogue', icon: <GraduationCap size={20} />, link: '/admin/training' },
];

export default function OnboardingPage() {
  const { currentUser } = useApp();
  const { addToast } = useToast();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setCompleted(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  if (currentUser?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center h-64 text-gray-500"><p>Accès réservé aux administrateurs.</p></div>;
  }

  const totalSteps = STEPS.length;
  const doneSteps = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((doneSteps / totalSteps) * 100);

  const toggleStep = (id: string) => {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (next[id]) addToast('Étape validée', 'success');
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompleted({});
    setShowReset(false);
    addToast('Progression réinitialisée', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Onboarding</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configurez votre plateforme étape par étape</p>
        </div>
        {doneSteps > 0 && (
          <button onClick={() => setShowReset(true)} className="text-sm text-gray-400 hover:text-red-500 underline">Réinitialiser</button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Progression</h2>
          <span className="text-sm font-medium text-blue-600">{doneSteps}/{totalSteps} étapes</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && (
          <p className="text-green-600 font-medium mt-3">Toutes les étapes sont validées !</p>
        )}
      </div>

      <div className="space-y-3">
        {STEPS.map(step => {
          const isDone = !!completed[step.id];
          return (
            <div key={step.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <button onClick={() => toggleStep(step.id)} className="flex-shrink-0">
                  {isDone
                    ? <CheckCircle2 size={24} className="text-green-500" />
                    : <Circle size={24} className="text-gray-300 dark:text-gray-600" />
                  }
                </button>
                <div className="text-blue-600 dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${isDone ? 'text-green-600 dark:text-green-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{step.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
                <Link to={step.link} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">
                  Accéder
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Réinitialiser</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Voulez-vous réinitialiser votre progression onboarding ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReset(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Réinitialiser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
