import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import type { UserRole } from '../types';
import { hasPermission, type Permission } from '../utils/permissions';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  RH: 'RH',
  MANAGER: 'Manager',
  DEPARTMENT_HEAD: 'Chef de Département',
  EMPLOYEE: 'Employé',
  SECURITY_GUARD: 'Agent de Sécurité',
};

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  RH: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  MANAGER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  DEPARTMENT_HEAD: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  EMPLOYEE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  SECURITY_GUARD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
};

const ALL_PERMISSION_GROUPS: { label: string; perms: Permission[] }[] = [
  { label: 'Employés', perms: ['view_employees', 'manage_employees'] },
  { label: 'Salaires', perms: ['view_salary', 'manage_salary'] },
  { label: 'Présences', perms: ['view_attendance', 'manage_attendance'] },
  { label: 'Congés', perms: ['view_leaves', 'manage_leaves'] },
  { label: 'Bulletins de paie', perms: ['view_payslips', 'manage_payslips'] },
  { label: 'Recrutement', perms: ['view_recruitment', 'manage_recruitment'] },
  { label: 'Objectifs', perms: ['view_objectives', 'manage_objectives'] },
  { label: 'Performance', perms: ['view_performance', 'manage_performance'] },
  { label: 'Documents', perms: ['view_documents', 'manage_documents'] },
  { label: 'Banque', perms: ['view_banking', 'manage_banking'] },
  { label: 'Fiscal', perms: ['view_tax', 'manage_tax'] },
  { label: 'Formations', perms: ['view_training', 'manage_training'] },
  { label: 'Missions', perms: ['view_missions', 'manage_missions'] },
  { label: 'Marketplace', perms: ['view_marketplace', 'manage_marketplace'] },
  { label: 'Équipes', perms: ['view_teams', 'manage_teams'] },
  { label: 'Fil d\'actualité', perms: ['view_feed', 'manage_feed'] },
  { label: 'Import', perms: ['view_import', 'manage_import'] },
  { label: 'Récompenses', perms: ['view_rewards', 'manage_rewards'] },
  { label: 'Équipements', perms: ['view_equipment', 'manage_equipment'] },
  { label: 'Bien-être', perms: ['view_wellness', 'manage_wellness'] },
  { label: 'Fintech', perms: ['view_fintech', 'manage_fintech'] },
  { label: 'Quiz', perms: ['view_quizzes', 'manage_quizzes'] },
  { label: 'Signatures', perms: ['view_signatures', 'manage_signatures'] },
  { label: 'Rapports', perms: ['view_reports', 'manage_reports'] },
  { label: 'Paramètres', perms: ['view_settings', 'manage_settings'] },
  { label: 'Organigramme', perms: ['view_orgchart'] },
  { label: 'Assistant IA', perms: ['view_ai_assistant'] },
  { label: 'Messages', perms: ['view_messages'] },
  { label: 'Calendrier', perms: ['view_calendar'] },
  { label: 'Coffre-fort', perms: ['view_vault'] },
];

export default function RolesPage() {
  const { currentUser, updateEmployee } = useApp();
  const { employees } = useData();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p>Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  const filtered = employees.filter(e => {
    if (selectedRole !== 'all' && e.role !== selectedRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
    }
    return true;
  });

  const handleRoleChange = (employeeId: string, newRole: UserRole) => {
    updateEmployee(employeeId, { role: newRole });
    addToast('Rôle mis à jour avec succès', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestion des rôles & permissions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Attribuez des rôles aux employés et gérez leurs accès</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher un employé..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
        </div>
        <select
          value={selectedRole} onChange={e => setSelectedRole(e.target.value as UserRole | 'all')}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
          <option value="all">Tous les rôles</option>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(emp => {
          const isExpanded = expandedEmployee === emp.id;
          return (
            <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-medium">{emp.firstName[0]}{emp.lastName[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{emp.firstName} {emp.lastName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emp.position} · {emp.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[emp.role] || ROLE_COLORS.EMPLOYEE}`}>
                    {ROLE_LABELS[emp.role] || emp.role}
                  </span>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Changer le rôle</label>
                    <select
                      value={emp.role}
                      onChange={e => handleRoleChange(emp.id, e.target.value as UserRole)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Permissions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {ALL_PERMISSION_GROUPS.map(group => {
                        const hasAll = group.perms.every(p => hasPermission(emp.role, p));
                        return (
                          <div
                            key={group.label}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                              hasAll
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'bg-gray-50 dark:bg-gray-900/20 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${hasAll ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <span>{group.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">Aucun employé trouvé.</p>
        )}
      </div>
    </div>
  );
}
