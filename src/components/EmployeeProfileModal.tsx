import { useState } from 'react';
import { Mail, Phone, Calendar as CalIcon, DollarSign, Briefcase, Building2, User, FileText, Star, Target, ChevronDown, ChevronUp } from 'lucide-react';
import type { Employee, TimelineEvent } from '../types';
import { useData } from '../context/DataContext';
import Avatar from './Avatar';
import Badge from './Badge';
import { formatCurrency } from '../utils/format';

interface Props {
  employee: Employee;
  onClose: () => void;
}

const typeLabels: Record<TimelineEvent['type'], { label: string; color: string }> = {
  hire: { label: 'Embauche', color: 'bg-green-100 text-green-700' },
  promotion: { label: 'Promotion', color: 'bg-blue-100 text-blue-700' },
  contract: { label: 'Contrat', color: 'bg-purple-100 text-purple-700' },
  review: { label: 'Évaluation', color: 'bg-indigo-100 text-indigo-700' },
  objective: { label: 'Objectif', color: 'bg-orange-100 text-orange-700' },
  certificate: { label: 'Certificat', color: 'bg-teal-100 text-teal-700' },
  other: { label: 'Autre', color: 'bg-gray-100 text-gray-700' },
};

export default function EmployeeProfileModal({ employee, onClose }: Props) {
  const { timelineEvents, performanceReviews, objectives } = useData();
  const [showTimeline, setShowTimeline] = useState(false);
  const [showContract, setShowContract] = useState(false);

  const empTimeline = (timelineEvents || [])
    .filter((e: TimelineEvent) => e.employeeId === employee.id)
    .sort((a: TimelineEvent, b: TimelineEvent) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const empReviews = (performanceReviews || []).filter((r: { employeeId: string }) => r.employeeId === employee.id);
  const empObjectives = (objectives || []).filter((o: { employeeId: string }) => o.employeeId === employee.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-primary to-primary-hover p-6 text-center relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white text-xl leading-none">&times;</button>
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Avatar firstName={employee.firstName} lastName={employee.lastName} className="w-16 h-16 text-xl" />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold">{employee.firstName} {employee.lastName}</h2>
          <p className="text-blue-200 text-sm">{employee.position}</p>
          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
            {employee.department}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</p>
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200">
                <Mail size={14} className="text-gray-400" /><span>{employee.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200">
                <Phone size={14} className="text-gray-400" /><span>{employee.phone || 'Non renseigné'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Informations</p>
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200">
                <CalIcon size={14} className="text-gray-400" /><span>Né(e) le {employee.dateOfBirth.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200">
                <Briefcase size={14} className="text-gray-400" /><span>Embauché le {employee.joinDate.toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          {employee.contract && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <button onClick={() => setShowContract(!showContract)} className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contrat</span>
                </div>
                {showContract ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showContract && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-800 dark:text-gray-200">{employee.contract.type}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Début</span><span className="font-medium text-gray-800 dark:text-gray-200">{employee.contract.startDate.toLocaleDateString('fr-FR')}</span></div>
                  {employee.contract.endDate && <div className="flex justify-between"><span className="text-gray-500">Fin</span><span className="font-medium text-gray-800 dark:text-gray-200">{employee.contract.endDate.toLocaleDateString('fr-FR')}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Poste</span><span className="font-medium text-gray-800 dark:text-gray-200">{employee.contract.position}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Salaire</span><span className="font-medium text-green-600">{formatCurrency(employee.contract.salary)}</span></div>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Salaire mensuel</span>
              </div>
              <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{formatCurrency(employee.salary)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Rôle</span>
            </div>
            <Badge>{employee.role === 'admin' ? 'Administrateur' : employee.role === 'rh' ? 'RH' : employee.role === 'manager' ? 'Manager' : 'Employé'}</Badge>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center space-x-2">
              <Building2 size={16} className="text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${employee.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
              {employee.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>

          {/* Reviews Summary */}
          {empReviews.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dernière évaluation</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= (empReviews[0]?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
                <span className="text-sm text-gray-500 ml-2">{empReviews[0]?.rating}/5</span>
              </div>
            </div>
          )}

          {/* Objectives Summary */}
          {empObjectives.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Objectifs ({empObjectives.filter((o) => o.status === 'completed').length}/{empObjectives.length})</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(empObjectives.filter((o) => o.status === 'completed').length / empObjectives.length) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Timeline */}
          {empTimeline.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <button onClick={() => setShowTimeline(!showTimeline)} className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <CalIcon size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeline ({empTimeline.length})</span>
                </div>
                {showTimeline ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showTimeline && (
                <div className="mt-3 space-y-3">
                  {empTimeline.map((event: TimelineEvent) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${typeLabels[event.type]?.color.split(' ')[0] || 'bg-gray-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeLabels[event.type]?.color || 'bg-gray-100 text-gray-600'}`}>{typeLabels[event.type]?.label || event.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
