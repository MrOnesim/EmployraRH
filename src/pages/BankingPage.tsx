import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import {
  Building2, Smartphone, Plus, ArrowUpRight, ArrowDownLeft,
  CreditCard, X, Banknote, FileText,
} from 'lucide-react';
import Badge from '../components/Badge';
import { cn } from '../utils/cn';
import type { BankAccount, BankTransaction } from '../types';
import { exportTransactionHistoryPdf } from '../utils/pdfExport';

const TX_TYPE_MAP: Record<BankTransaction['type'], { label: string; icon: typeof ArrowUpRight; color: string }> = {
  deposit: { label: 'Dépôt', icon: ArrowDownLeft, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  withdrawal: { label: 'Retrait', icon: ArrowUpRight, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  payment: { label: 'Paiement', icon: CreditCard, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  fee: { label: 'Frais', icon: Banknote, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  transfer: { label: 'Virement', icon: ArrowUpRight, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
};

const TX_STATUS_BADGE: Record<BankTransaction['status'], { label: string; variant: 'green' | 'red' | 'yellow' }> = {
  completed: { label: 'Complété', variant: 'green' },
  failed: { label: 'Échoué', variant: 'red' },
  pending: { label: 'En attente', variant: 'yellow' },
};

const DEFAULT_BANK_ACCOUNT: Omit<BankAccount, 'id'> = {
  companyId: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  iban: '',
  swift: '',
  currency: 'XOF',
  isMobileMoney: false,
  mobileProvider: '',
  isDefault: false,
};

export default function BankingPage() {
  const { currentCompany } = useApp();
  const { bankAccounts, transactions, addBankAccount } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_BANK_ACCOUNT);

  const resetForm = () => setForm({ ...DEFAULT_BANK_ACCOUNT, companyId: currentCompany?.id ?? '' });

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) {
      addToast('Aucune entreprise sélectionnée', 'error');
      return;
    }
    try {
      addBankAccount({ ...form, companyId: currentCompany.id });
      addToast('Compte bancaire ajouté', 'success');
      setShowModal(false);
    } catch {
      addToast("Erreur lors de l'ajout du compte", 'error');
    }
  };

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Banque</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestion des comptes bancaires et transactions</p>
        </div>
        {activeTab === 'accounts' ? (
          <button
            onClick={openModal}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Ajouter un compte</span>
          </button>
        ) : (
          <button
            onClick={() => exportTransactionHistoryPdf(transactions)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FileText size={18} />
            <span>Exporter PDF</span>
          </button>
        )}
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['accounts', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            )}
          >
            {tab === 'accounts' ? 'Comptes bancaires' : 'Transactions'}
          </button>
        ))}
      </div>

      {activeTab === 'accounts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {account.isMobileMoney ? (
                      <Smartphone className="text-blue-600 dark:text-blue-400" size={20} />
                    ) : (
                      <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{account.bankName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.accountName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {account.isDefault && <Badge variant="green">Par défaut</Badge>}
                  {account.isMobileMoney && <Badge variant="blue">Mobile Money</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Numéro</span>
                  <p className="text-gray-800 dark:text-white font-mono">{account.accountNumber}</p>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Devise</span>
                  <p className="text-gray-800 dark:text-white">{account.currency}</p>
                </div>
                {account.iban && (
                  <div className="col-span-2">
                    <span className="text-gray-400 dark:text-gray-500">IBAN</span>
                    <p className="text-gray-800 dark:text-white font-mono text-xs">{account.iban}</p>
                  </div>
                )}
                {account.swift && (
                  <div className="col-span-2">
                    <span className="text-gray-400 dark:text-gray-500">SWIFT</span>
                    <p className="text-gray-800 dark:text-white font-mono text-xs">{account.swift}</p>
                  </div>
                )}
                {account.isMobileMoney && account.mobileProvider && (
                  <div className="col-span-2">
                    <span className="text-gray-400 dark:text-gray-500">Opérateur</span>
                    <p className="text-gray-800 dark:text-white">{account.mobileProvider}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {bankAccounts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
              Aucun compte bancaire. Cliquez sur "Ajouter un compte" pour commencer.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Montant</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.map((tx) => {
                  const typeInfo = TX_TYPE_MAP[tx.type];
                  const statusInfo = TX_STATUS_BADGE[tx.status];
                  const Icon = typeInfo.icon;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={cn('p-2 rounded-lg', typeInfo.color)}>
                            <Icon size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">{typeInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-sm font-semibold',
                          tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' :
                          tx.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-800 dark:text-white',
                        )}>
                          {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(tx.date).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              Aucune transaction.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Ajouter un compte bancaire</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banque</label>
                  <input
                    type="text"
                    required
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du compte</label>
                  <input
                    type="text"
                    required
                    value={form.accountName}
                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro de compte</label>
                  <input
                    type="text"
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN</label>
                  <input
                    type="text"
                    value={form.iban}
                    onChange={(e) => setForm({ ...form, iban: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SWIFT</label>
                  <input
                    type="text"
                    value={form.swift}
                    onChange={(e) => setForm({ ...form, swift: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Devise</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="XOF">XOF</option>
                    <option value="XAF">XAF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="isMobileMoney"
                    checked={form.isMobileMoney}
                    onChange={(e) => setForm({ ...form, isMobileMoney: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isMobileMoney" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile Money
                  </label>
                </div>
              </div>
              {form.isMobileMoney && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opérateur mobile</label>
                  <select
                    value={form.mobileProvider}
                    onChange={(e) => setForm({ ...form, mobileProvider: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Wave">Wave</option>
                    <option value="Free Money">Free Money</option>
                  </select>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compte par défaut
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
