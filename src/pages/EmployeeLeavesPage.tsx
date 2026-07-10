import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, Plus, Clock, CheckCircle,
  AlertCircle
} from 'lucide-react';
import { usePageLoading } from '../hooks/usePageLoading';
import { useToast } from '../context/ToastContext';
import { LoadingScreen } from '../components/ui';

export default function EmployeeLeavesPage() {
  const { currentUser, leaves, requestLeave } = useApp();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const loading = usePageLoading();
  const { addToast } = useToast();

  const STORAGE_KEY = 'leave_policy';
  const DEFAULT_POLICY = { annual: 22, sick: 10, maternity: 90, special: 5 };
  const leavePolicy = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_POLICY;
    } catch { return DEFAULT_POLICY; }
  })();

  const myLeaves = leaves
    .filter((l: { employeeId: string | undefined; }) => l.employeeId === currentUser?.id)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;

  const calcUsed = (type: string) => myLeaves
    .filter(l => l.status === 'approved' && l.type === type)
    .reduce((sum: number, l) => {
      const diff = new Date(l.endDate).getTime() - new Date(l.startDate).getTime();
      return sum + Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }, 0);

  const usedAnnual = calcUsed('annual');
  const usedSick = calcUsed('sick');
  const usedMaternity = calcUsed('maternity');
  const usedSpecial = calcUsed('special');
  const usedLeaveDays = usedAnnual + usedSick + usedMaternity + usedSpecial;
  const remainingDays = leavePolicy.annual - usedAnnual;

  const handleSubmitLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
    
    try {
      requestLeave({
        employeeId: currentUser?.id || '',
        type: newLeave.type as 'annual' | 'sick' | 'maternity' | 'special',
        startDate: new Date(newLeave.startDate),
        endDate: new Date(newLeave.endDate),
        reason: newLeave.reason,
        status: 'pending'
      });
      setNewLeave({ type: 'annual', startDate: '', endDate: '', reason: '' });
      setShowRequestModal(false);
    } catch {
      addToast("Erreur lors de la demande de congé", 'error');
    }
  };

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

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes congés</h1>
          <p className="text-gray-500">Gérez vos demandes de congé</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Nouvelle demande</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Jours restants</p>
              <p className="text-2xl font-bold text-gray-800">{remainingDays}j</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Jours utilisés</p>
              <p className="text-2xl font-bold text-green-600">{usedLeaveDays}j</p>
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
            <div className="bg-purple-100 p-3 rounded-xl">
              <Calendar size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total demandes</p>
              <p className="text-2xl font-bold text-gray-800">{myLeaves.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Soldes de congés</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Annuel', used: usedAnnual, total: leavePolicy.annual, color: 'bg-blue-500' },
            { label: 'Maladie', used: usedSick, total: leavePolicy.sick, color: 'bg-yellow-500' },
            { label: 'Maternité', used: usedMaternity, total: leavePolicy.maternity, color: 'bg-pink-500' },
            { label: 'Spécial', used: usedSpecial, total: leavePolicy.special, color: 'bg-purple-500' },
          ].map(b => (
            <div key={b.label}>
              <p className="text-sm text-gray-500 mb-1">{b.label}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`${b.color} h-3 rounded-full transition-all`}
                    style={{ width: `${Math.min(100, (b.used / b.total) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {b.used}/{b.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Historique des demandes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Type</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Période</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Durée</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Raison</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {myLeaves.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Vous n'avez pas encore de demande de congé</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Nouvelle demande</h2>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de congé *</label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="annual">Congé annuel</option>
                  <option value="sick">Congé maladie</option>
                  <option value="maternity">Congé maternité</option>
                  <option value="special">Permission spéciale</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison *</label>
                <textarea
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  placeholder="Décrivez la raison de votre demande..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSubmitLeave}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Soumettre la demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
