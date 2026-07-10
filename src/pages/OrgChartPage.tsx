import { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Building2, Users, Search, ChevronDown, ChevronRight, Star, Crown, Mail, Phone } from 'lucide-react';
import type { Employee } from '../types';
import Avatar from '../components/Avatar';
import { cn } from '../utils/cn';

const ROLE_ORDER: Record<string, number> = { admin: 0, manager: 1, rh: 2, employee: 3 };

function getDepartmentIcon() {
  return <Building2 className="w-5 h-5 text-blue-400" />;
}

export default function OrgChartPage() {
  const { employees } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [popoverEmployee, setPopoverEmployee] = useState<Employee | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const filtered = employees.filter((emp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.position.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    );
  });

  const grouped: Record<string, Employee[]> = {};
  for (const emp of filtered) {
    const dept = emp.department || 'Autre';
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(emp);
  }

  const sortedDepts = Object.keys(grouped).sort();

  useEffect(() => {
    if (expandedDepts.size === 0 && sortedDepts.length > 0) {
      setExpandedDepts(new Set(sortedDepts));
    }
  }, [sortedDepts.join(',')]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverEmployee(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDept = (dept: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Organigramme
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Structure hiérarchique de l'entreprise
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="w-4 h-4" />
          <span>{employees.length} employés</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un employé, département ou poste..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-4">
        {sortedDepts.map((dept) => {
          const emps = grouped[dept];
          const isExpanded = expandedDepts.has(dept);
          const sortedEmps = [...emps].sort(
            (a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9),
          );

          return (
            <div
              key={dept}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleDept(dept)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                {getDepartmentIcon()}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {dept}
                </span>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {emps.length} employé{emps.length > 1 ? 's' : ''}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
                    {sortedEmps.map((emp) => (
                      <div
                        key={emp.id}
                        className="relative group"
                      >
                        <button
                          onClick={() =>
                            setPopoverEmployee(
                              popoverEmployee?.id === emp.id ? null : emp,
                            )
                          }
                          className={cn(
                            'w-full text-left p-4 rounded-lg border transition-all',
                            'bg-gray-50 dark:bg-gray-900/50',
                            'border-gray-200 dark:border-gray-700',
                            'hover:border-blue-400 dark:hover:border-blue-500',
                            'hover:shadow-md hover:-translate-y-0.5',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              firstName={emp.firstName}
                              lastName={emp.lastName}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                  {emp.firstName} {emp.lastName}
                                </span>
                                {(emp.role === 'ADMIN' || emp.role === 'MANAGER') && (
                                  emp.role === 'ADMIN' ? (
                                    <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                                  ) : (
                                    <Star className="w-4 h-4 text-blue-500 shrink-0" />
                                  )
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {emp.position}
                              </p>
                            </div>
                          </div>
                        </button>

                        {popoverEmployee?.id === emp.id && (
                          <div
                            ref={popoverRef}
                            className="absolute z-50 mt-2 w-72 p-4 rounded-xl shadow-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 left-0"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar
                                firstName={emp.firstName}
                                lastName={emp.lastName}
                                size="lg"
                              />
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {emp.firstName} {emp.lastName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {emp.position}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{emp.email}</span>
                              </div>
                              {emp.phone && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{emp.phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Département: <span className="font-medium">{emp.department}</span>
                              </p>
                              {(emp.role === 'ADMIN' || emp.role === 'MANAGER') && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Rôle: <span className="font-medium capitalize">{emp.role === 'ADMIN' ? 'Administrateur' : 'Manager'}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedDepts.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">
            {searchQuery ? 'Aucun résultat trouvé' : 'Aucun employé à afficher'}
          </p>
          {searchQuery && (
            <p className="text-sm mt-1">
              Essayez de modifier votre recherche
            </p>
          )}
        </div>
      )}
    </div>
  );
}
