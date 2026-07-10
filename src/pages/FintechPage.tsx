import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  Landmark, Wallet, ArrowUpRight, ArrowDownLeft,
  CheckCircle, XCircle, Plus, History, X,
} from 'lucide-react';
import Badge from '../components/Badge';
import { cn } from '../utils/cn';
import { formatCurrency, formatDate } from '../utils/format';

const STATUS_ADVANCE: Record<string, { label: string; variant: 'yellow' | 'blue' | 'green' | 'red' }> = {
  requested: { label: 'Demandé', variant: 'yellow' },
  approved: { label: 'Approuvé', variant: 'blue' },
  paid: { label: 'Payé', variant: 'green' },
  rejected: { label: 'Rejeté', variant: 'red' },
};

const REPAYMENT_STATUS: Record<string, { label: string; variant: 'yellow' | 'green' | 'blue' }> = {
  pending: { label: 'En attente', variant: 'yellow' },
  partial: { label: 'Partiel', variant: 'blue' },
  repaid: { label: 'Remboursé', variant: 'green' },
};

const TRANSFER_STATUS: Record<string, { label: string; variant: 'yellow' | 'green' | 'red' }> = {
  pending: { label: 'En attente', variant: 'yellow' },
  completed: { label: 'Complété', variant: 'green' },
  failed: { label: 'Échoué', variant: 'red' },
};

const TRANSFER_TYPES: Record<string, { label: string }> = {
  salary: { label: 'Salaire' },
  advance: { label: 'Avance' },
  bonus: { label: 'Prime' },
  transfer: { label: 'Virement' },
};

export default function FintechPage() {
  const { currentUser } = useApp();
  const {
    salaryAdvances, salaryTransfers, requestSalaryAdvance,
    approveSalaryAdvance, paySalaryAdvance, rejectSalaryAdvance,
    employees,
  } = useData();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'advances' | 'transfers'>('advances');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'RH';
  const userAdvances = salaryAdvances.filter((a) => a.employeeId === currentUser?.id);
  const allAdvances = salaryAdvances;

  const userEmployee = employees.find((e) => e.id === currentUser?.id);
  const maxAdvance = userEmployee ? userEmployee.salary * 0.3 : 0;
  const userCurrentBalance = userAdvances
    .filter((a) => a.status === 'paid')
    .reduce((sum, a) => sum + a.amount, 0);
  const userOutstanding = userAdvances
    .filter((a) => a.status === 'paid' && a.repaymentStatus !== 'repaid')
    .reduce((sum, a) => sum + a.amount - (a.repaymentAmount || 0), 0);
  const totalAdvancesGiven = allAdvances
    .filter((a) => a.status === 'paid')
    .reduce((sum, a) => sum + a.amount, 0);

  const handleRequestAdvance = () => {
    const amount = parseFloat(requestAmount);
    if (!amount || amount <= 0) {
      addToast('Montant invalide', 'error');
      return;
    }
    if (amount > maxAdvance) {
      addToast(`Le montant maximum autorisé est de ${formatCurrency(maxAdvance)}`, 'error');
      return;
    }
    if (!currentUser) return;
    requestSalaryAdvance({
      employeeId: currentUser.id,
      amount,
      currency: 'FCFA',
      reason: requestReason,
      approvedBy: undefined,
      repaymentDate: undefined,
      repaymentAmount: undefined,
    });
    addToast('Demande d\'avance soumise', 'success');
    setShowRequestModal(false);
    setRequestAmount('');
    setRequestReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            <span className="inline-flex items-center space-x-2">
              <Landmark className="text-blue-600" size={28} />
              <span>Banque salariale</span>
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Avances sur salaire et transferts financiers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total avances versées</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {formatCurrency(totalAdvancesGiven, 'FCFA')}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Solde avances en cours</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {formatCurrency(userOutstanding, 'FCFA')}
              </p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
              <ArrowUpRight className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Plafond disponible</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {formatCurrency(Math.max(0, maxAdvance - userCurrentBalance), 'FCFA')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Max 30% du salaire ({formatCurrency(maxAdvance, 'FCFA')})
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
              <ArrowDownLeft className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {([
          { key: 'advances', label: 'Avances sur salaire', icon: History },
          { key: 'transfers', label: 'Transferts', icon: ArrowUpRight },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'advances' | 'transfers')}
              className={cn(
                'flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'advances' ? (
        <div className="space-y-6">
          {!isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
                <span>Demander une avance</span>
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {isAdmin ? 'Toutes les demandes' : 'Mes avances'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {isAdmin && <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Employé</th>}
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Montant</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Remboursement</th>
                    {isAdmin && <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(isAdmin ? allAdvances : userAdvances).map((advance) => {
                    const statusInfo = STATUS_ADVANCE[advance.status];
                    const repaymentInfo = REPAYMENT_STATUS[advance.repaymentStatus];
                    const employee = employees.find((e) => e.id === advance.employeeId);
                    return (
                      <tr key={advance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {employee ? `${employee.firstName} ${employee.lastName}` : 'Inconnu'}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white">
                          {formatCurrency(advance.amount, advance.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(advance.requestedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={repaymentInfo.variant}>{repaymentInfo.label}</Badge>
                        </td>
                        {isAdmin && advance.status === 'requested' && (
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => { approveSalaryAdvance(advance.id); addToast('Avance approuvée', 'success'); }}
                                className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                title="Approuver"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => { rejectSalaryAdvance(advance.id); addToast('Avance rejetée', 'error'); }}
                                className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                title="Rejeter"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                        {isAdmin && advance.status === 'approved' && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { paySalaryAdvance(advance.id); addToast('Avance payée', 'success'); }}
                              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              <Wallet size={14} />
                              <span>Payer</span>
                            </button>
                          </td>
                        )}
                        {isAdmin && advance.status !== 'requested' && advance.status !== 'approved' && (
                          <td className="px-4 py-3 text-sm text-gray-400">-</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {((isAdmin ? allAdvances : userAdvances).length === 0) && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                Aucune demande d'avance.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {isAdmin && <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Employé</th>}
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Montant</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {salaryTransfers.map((transfer) => {
                  const typeInfo = TRANSFER_TYPES[transfer.type];
                  const statusInfo = TRANSFER_STATUS[transfer.status];
                  const employee = employees.find((e) => e.id === transfer.employeeId);
                  return (
                    <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {employee ? `${employee.firstName} ${employee.lastName}` : 'Inconnu'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(transfer.amount, transfer.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-800 dark:text-white">{typeInfo.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transfer.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {salaryTransfers.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              Aucun transfert.
            </div>
          )}
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Demander une avance</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="Montant souhaité"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Maximum : {formatCurrency(maxAdvance, 'FCFA')} (30% du salaire)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motif
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Raison de la demande..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRequestAdvance}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Envoyer la demande
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
