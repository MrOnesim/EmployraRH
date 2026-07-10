import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { FileText, GraduationCap, IdCard, DollarSign, Award, ClipboardList, Plus, Trash2, Upload } from 'lucide-react';
import type { EmployeeVaultItem } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const typeFilters = ['all', 'contract', 'diploma', 'id_card', 'payslip', 'certificate', 'evaluation'] as const;

const typeIcons: Record<string, React.ReactNode> = {
  contract: <FileText size={24} />,
  diploma: <GraduationCap size={24} />,
  id_card: <IdCard size={24} />,
  payslip: <DollarSign size={24} />,
  certificate: <Award size={24} />,
  evaluation: <ClipboardList size={24} />,
};

const typeLabels: Record<string, string> = {
  contract: 'Contrat',
  diploma: 'Diplôme',
  id_card: 'Carte d\'identité',
  payslip: 'Bulletin de paie',
  certificate: 'Certificat',
  evaluation: 'Évaluation',
};

const typeColors: Record<string, string> = {
  contract: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
  diploma: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
  id_card: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
  payslip: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300',
  certificate: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300',
  evaluation: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300',
};

const statusVariant: Record<string, 'green' | 'red' | 'gray'> = {
  active: 'green',
  expired: 'red',
  archived: 'gray',
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  expired: 'Expiré',
  archived: 'Archivé',
};

export default function EmployeeVaultPage() {
  const { currentUser } = useApp();
  const { vaultItems, addVaultItem, deleteVaultItem } = useData();
  const { addToast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'contract' as EmployeeVaultItem['type'], name: '', fileUrl: '', expiresAt: '' });

  const isAdmin = currentUser?.role === 'ADMIN';
  const visibleItems = vaultItems.filter(item => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesUser = isAdmin || item.employeeId === currentUser?.id;
    return matchesType && matchesUser;
  });

  const handleSubmit = () => {
    if (!form.name) return;
    addVaultItem({
      employeeId: currentUser!.id,
      type: form.type,
      name: form.name,
      fileUrl: form.fileUrl || undefined,
      uploadedAt: new Date(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
      status: 'active',
    });
    setForm({ type: 'contract', name: '', fileUrl: '', expiresAt: '' });
    setShowModal(false);
    addToast('Document ajouté au coffre-fort', 'success');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    deleteVaultItem(id);
    addToast('Document supprimé', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Coffre-fort numérique</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez vos documents personnels</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={18} /><span>Ajouter</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeFilters.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === t
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            {t === 'all' ? 'Tous' : typeLabels[t]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleItems.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${typeColors[item.type]}`}>
                {typeIcons[item.type]}
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1 truncate">{item.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{typeLabels[item.type]}</p>
            <div className="flex items-center justify-between mb-2">
              <Badge variant={statusVariant[item.status]}>{statusLabels[item.status]}</Badge>
            </div>
            <div className="flex flex-col gap-1 text-xs text-gray-400 dark:text-gray-500">
              <span>Ajouté le {new Date(item.uploadedAt).toLocaleDateString('fr-FR')}</span>
              {item.expiresAt && (
                <span>Expire le {new Date(item.expiresAt).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
            {item.fileUrl && (
              <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                <Upload size={12} /><span>Voir le fichier</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {visibleItems.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucun document dans le coffre-fort</p>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ajouter un document">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as EmployeeVaultItem['type'] })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              {typeFilters.filter(t => t !== 'all').map(t => (
                <option key={t} value={t}>{typeLabels[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du document *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Contrat de travail 2026"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL du fichier</label>
            <input type="text" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://example.com/document.pdf"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'expiration</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <button onClick={handleSubmit} disabled={!form.name}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Ajouter au coffre-fort
          </button>
        </div>
      </Modal>
    </div>
  );
}
