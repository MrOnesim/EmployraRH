import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getGuards, assignGuard, removeGuard } from '../services/securityGuardService';
import { Shield, ShieldOff, Plus, Search, UserCheck } from 'lucide-react';
import type { Employee } from '../types';

export default function SecurityGuardsPage() {
  const { currentCompany, employees } = useApp();
  const [guards, setGuards] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGuards = async () => {
    if (!currentCompany) return;
    try {
      const data = await getGuards(currentCompany.id);
      setGuards(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuards();
  }, [currentCompany]);

  const handleAssign = async (employeeId: string) => {
    if (!currentCompany) return;
    try {
      await assignGuard(employeeId, currentCompany.id);
      await fetchGuards();
    } catch {}
  };

  const handleRemove = async (id: string) => {
    try {
      await removeGuard(id);
      setGuards(prev => prev.filter(g => g.id !== id));
    } catch {}
  };

  const guardIds = new Set(guards.map(g => g.employeeId));
  const availableEmployees = employees.filter(
    (e: Employee) => !guardIds.has(e.id) &&
    (e.firstName.toLowerCase().includes(search.toLowerCase()) ||
     e.lastName.toLowerCase().includes(search.toLowerCase()) ||
     e.position?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100">Agents de Sécurité</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les agents autorisés à scanner les badges de pointage</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Agents actifs ({guards.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : guards.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Shield size={40} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium">Aucun agent de sécurité désigné</p>
            <p className="text-sm">Sélectionnez des employés ci-dessous pour les autoriser à scanner</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {guards.map((guard) => (
              <div key={guard.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserCheck size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                      {guard.employee.firstName} {guard.employee.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{guard.employee.position || 'Agent de sécurité'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(guard.id)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                  title="Révoquer"
                >
                  <ShieldOff size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Ajouter un agent
          </h2>
          <div className="relative mt-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un employé..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            />
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
          {availableEmployees.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">Tous les employés sont déjà agents</div>
          ) : (
            availableEmployees.map((emp: Employee) => (
              <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-gray-400">{emp.position || '—'}</p>
                </div>
                <button
                  onClick={() => handleAssign(emp.id)}
                  className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20"
                >
                  Désigner agent
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
