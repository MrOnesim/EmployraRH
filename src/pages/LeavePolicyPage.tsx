import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import type { LeavePolicy } from '../types';
import { Save, RotateCcw, Umbrella, HeartPulse, Baby, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const STORAGE_KEY = 'leave_policy';

const DEFAULT_POLICY: LeavePolicy = {
  annual: 22,
  sick: 10,
  maternity: 90,
  special: 5,
};

export default function LeavePolicyPage() {
  const { currentUser } = useApp();
  const { addToast } = useToast();
  const [policy, setPolicy] = useState<LeavePolicy>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_POLICY;
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POLICY));
    }
  }, []);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
    setHasChanges(false);
    addToast('Politique de congés mise à jour', 'success');
  };

  const handleReset = () => {
    setPolicy(DEFAULT_POLICY);
    setHasChanges(true);
  };

  const update = (key: keyof LeavePolicy, val: number) => {
    setPolicy((prev) => ({ ...prev, [key]: Math.max(0, val) }));
    setHasChanges(true);
  };

  const fields: { key: keyof LeavePolicy; label: string; desc: string; icon: LucideIcon }[] = [
    {
      key: 'annual',
      label: 'Congés annuels',
      desc: 'Jours de congés payés par an',
      icon: Umbrella,
    },
    {
      key: 'sick',
      label: 'Congés maladie',
      desc: 'Jours de maladie rémunérés par an',
      icon: HeartPulse,
    },
    { key: 'maternity', label: 'Congé maternité', desc: 'Jours de congé maternité', icon: Baby },
    {
      key: 'special',
      label: 'Permissions spéciales',
      desc: 'Jours pour événements familiaux',
      icon: ClipboardList,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Politique de congés
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configurez les droits de congés par type
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex-1 sm:flex-none"
          >
            <RotateCcw size={16} />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors flex-1 sm:flex-none ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            Enregistrer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div
            key={f.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <f.icon size={28} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-2">
                  {f.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => update(f.key, policy[f.key] - 1)}
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-lg font-medium"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={365}
                value={policy[f.key]}
                onChange={(e) => update(f.key, parseInt(e.target.value) || 0)}
                className="w-20 text-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold text-lg"
              />
              <button
                onClick={() => update(f.key, policy[f.key] + 1)}
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-lg font-medium"
              >
                +
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">jours</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
