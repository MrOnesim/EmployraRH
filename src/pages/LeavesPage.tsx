import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, Calendar, CheckCircle, XCircle, Clock,
  AlertCircle, Filter
} from 'lucide-react';

export default function LeavesPage() {
  const { employees, leaves, approveLeave, rejectLeave } = useApp();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionModal, setActionModal] = useState<{ leaveId: string; action: 'approve' | 'reject' } | null>(null);
  const [actionComment, setActionComment] = useState('');

  const filteredLeaves = leaves.filter(leave => {
    const employee = employees.find(e => e.id === leave.employeeId);
    if (!employee) return false;
    
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesType = typeFilter === 'all' || leave.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
  const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      annual: 'Congé annuel',
      sick: 'Congé maladie',
      maternity: 'Congé maternité',
      special: 'Permission spéciale'
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || '';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Refusé'
    };
    return labels[status] || status;
  };

  const calculateDays = (start: Date, end: Date) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gestion des congés</h1>
        <p className="text-gray-500">Gérez les demandes de congé de vos employés</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total demandes</p>
              <p className="text-2xl font-bold text-gray-800">{leaves.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingLeaves}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Approuvés</p>
              <p className="text-2xl font-bold text-green-600">{approvedLeaves}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Refusés</p>
              <p className="text-2xl font-bold text-red-600">{rejectedLeaves}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Refusés</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Tous les types</option>
              <option value="annual">Congé annuel</option>
              <option value="sick">Congé maladie</option>
              <option value="maternity">Congé maternité</option>
              <option value="special">Permission spéciale</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 font-medium text-gray-600">Employé</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Type</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Période</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Durée</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Raison</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Statut</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeaves.map((leave) => {
                const employee = employees.find(e => e.id === leave.employeeId);
                if (!employee) return null;
                
                return (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{employee.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {getLeaveTypeLabel(leave.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {calculateDays(leave.startDate, leave.endDate)} jour(s)
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                        {getStatusLabel(leave.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => { setActionModal({ leaveId: leave.id, action: 'approve' }); setActionComment(''); }}
                            className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle size={16} />
                            <span>Approuver</span>
                          </button>
                          <button
                            onClick={() => { setActionModal({ leaveId: leave.id, action: 'reject' }); setActionComment(''); }}
                            className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            <XCircle size={16} />
                            <span>Refuser</span>
                          </button>
                        </div>
                      )}
                      {leave.status !== 'pending' && (
                        <div className="text-sm">
                          <span className="text-gray-400">{leave.status === 'approved' ? 'Approuvé' : 'Refusé'}</span>
                          {leave.approvalComment && (
                            <p className="text-gray-500 text-xs mt-1 italic">"{leave.approvalComment}"</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredLeaves.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Aucune demande de congé trouvée</p>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Calendrier des absences</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + 1 + i);
            const dayLeaves = leaves.filter(l => {
              const start = new Date(l.startDate);
              const end = new Date(l.endDate);
              return date >= start && date <= end && l.status === 'approved';
            });
            
            return (
              <div 
                key={i} 
                className={`text-center py-3 rounded-lg ${
                  dayLeaves.length > 0 ? 'bg-red-50 border border-red-200' :
                  date.toDateString() === new Date().toDateString() ? 'bg-blue-50 border border-blue-200' :
                  'hover:bg-gray-50'
                }`}
              >
                <span className="text-sm text-gray-700">{date.getDate()}</span>
                {dayLeaves.length > 0 && (
                  <div className="mt-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {actionModal.action === 'approve' ? 'Approuver la demande' : 'Refuser la demande'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {actionModal.action === 'approve' 
                ? 'Ajoutez un commentaire (optionnel) ou confirmez directement.'
                : 'Veuillez indiquer la raison du refus.'}
            </p>
            <textarea
              value={actionComment}
              onChange={e => setActionComment(e.target.value)}
              placeholder="Commentaire..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none h-24"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  try {
                    if (actionModal.action === 'approve') {
                      approveLeave(actionModal.leaveId, actionComment || undefined);
                      addToast('Congé approuvé', 'success');
                    } else {
                      rejectLeave(actionModal.leaveId, actionComment || undefined);
                      addToast('Congé refusé', 'info');
                    }
                  } catch { addToast('Erreur lors du traitement', 'error'); }
                  setActionModal(null);
                }}
                className={`px-4 py-2 rounded-lg text-white ${
                  actionModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
