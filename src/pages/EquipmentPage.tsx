import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import { Monitor, Smartphone, Car, CreditCard, Wrench, Plus, Search } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { cn } from '../utils/cn';
import type { Equipment } from '../types';

const TYPE_CONFIG: Record<
  Equipment['type'],
  { label: string; icon: typeof Monitor; color: string }
> = {
  computer: {
    label: 'Ordinateur',
    icon: Monitor,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  },
  phone: {
    label: 'Téléphone',
    icon: Smartphone,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
  vehicle: {
    label: 'Véhicule',
    icon: Car,
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  },
  access_card: {
    label: 'Badge',
    icon: CreditCard,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  },
  other: { label: 'Autre', icon: Wrench, color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
};

const STATUS_BADGE: Record<
  Equipment['status'],
  { label: string; variant: 'green' | 'blue' | 'yellow' | 'gray' }
> = {
  available: { label: 'Disponible', variant: 'green' },
  assigned: { label: 'Assigné', variant: 'blue' },
  maintenance: { label: 'En maintenance', variant: 'yellow' },
  retired: { label: 'Retiré', variant: 'gray' },
};

const CONDITION_LABELS: Record<Equipment['condition'], string> = {
  good: 'Bon état',
  fair: 'État correct',
  damaged: 'Endommagé',
};

const CONDITION_VARIANTS: Record<Equipment['condition'], 'green' | 'yellow' | 'red'> = {
  good: 'green',
  fair: 'yellow',
  damaged: 'red',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'available', label: 'Disponibles' },
  { value: 'assigned', label: 'Assignés' },
  { value: 'maintenance', label: 'En maintenance' },
  { value: 'retired', label: 'Retirés' },
] as const;

const TYPE_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'computer', label: 'Ordinateurs' },
  { value: 'phone', label: 'Téléphones' },
  { value: 'vehicle', label: 'Véhicules' },
  { value: 'access_card', label: 'Badges' },
  { value: 'other', label: 'Autre' },
] as const;

const DEFAULT_FORM: Omit<Equipment, 'id'> = {
  companyId: '',
  name: '',
  type: 'computer',
  serialNumber: '',
  purchaseDate: undefined,
  purchasePrice: undefined,
  status: 'available',
  condition: 'good',
  notes: '',
};

export default function EquipmentPage() {
  const { currentUser } = useApp();
  const {
    equipment,
    equipmentAssignments,
    addEquipment,
    assignEquipment,
    returnEquipment,
    employees,
  } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [returnCondition, setReturnCondition] = useState<Equipment['condition']>('good');
  const [showReturnForm, setShowReturnForm] = useState(false);

  const getEmployeeName = (id?: string) => {
    if (!id) return '-';
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : '-';
  };

  const getAssignmentsForEquipment = (eqId: string) =>
    equipmentAssignments
      .filter((a) => a.equipmentId === eqId)
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

  const filtered = equipment.filter((eq) => {
    if (statusFilter !== 'all' && eq.status !== statusFilter) return false;
    if (typeFilter !== 'all' && eq.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = eq.name.toLowerCase().includes(q);
      const matchSerial = eq.serialNumber?.toLowerCase().includes(q) ?? false;
      const matchAssignee = getEmployeeName(eq.assigneeId).toLowerCase().includes(q);
      return matchName || matchSerial || matchAssignee;
    }
    return true;
  });

  const resetForm = () => setForm({ ...DEFAULT_FORM, companyId: currentUser?.id ?? '' });

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Veuillez saisir un nom', 'error');
      return;
    }
    try {
      addEquipment({ ...form, companyId: '' });
      addToast('Équipement ajouté', 'success');
      setShowAddModal(false);
      resetForm();
    } catch {
      addToast("Erreur lors de l'ajout de l'équipement", 'error');
    }
  };

  const handleAssign = () => {
    if (!selectedEq || !assignEmployeeId) return;
    try {
      assignEquipment(selectedEq.id, assignEmployeeId);
      addToast('Équipement assigné', 'success');
      setShowAssignModal(false);
      setAssignEmployeeId('');
      setSelectedEq(null);
    } catch {
      addToast("Erreur lors de l'assignation", 'error');
    }
  };

  const handleReturn = () => {
    if (!selectedEq) return;
    try {
      returnEquipment(selectedEq.id, returnCondition);
      addToast('Équipement retourné', 'success');
      setSelectedEq(null);
      setReturnCondition('good');
    } catch {
      addToast('Erreur lors du retour', 'error');
    }
  };

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion du matériel</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Suivez et gérez les équipements de l'entreprise
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Ajouter un équipement</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              statusFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              typeFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Équipement
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  N° Série
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assigné à
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  État
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((eq) => {
                const typeCfg = TYPE_CONFIG[eq.type];
                const statusCfg = STATUS_BADGE[eq.status];
                const TypeIcon = typeCfg.icon;
                return (
                  <tr
                    key={eq.id}
                    onClick={() => setSelectedEq(eq)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className={cn('p-2 rounded-lg', typeCfg.color)}>
                          <TypeIcon size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {eq.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {eq.serialNumber || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {getEmployeeName(eq.assigneeId)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={CONDITION_VARIANTS[eq.condition]}>
                        {CONDITION_LABELS[eq.condition]}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            Aucun équipement trouvé.
          </div>
        )}
      </div>

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un équipement"
        maxWidth="lg"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nom de l'équipement"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Equipment['type'] })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="computer">Ordinateur</option>
                <option value="phone">Téléphone</option>
                <option value="vehicle">Véhicule</option>
                <option value="access_card">Badge d'accès</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro de série
              </label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                placeholder="N° de série"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'achat
              </label>
              <input
                type="date"
                value={
                  form.purchaseDate ? new Date(form.purchaseDate).toISOString().split('T')[0] : ''
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    purchaseDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prix d'achat (FCFA)
              </label>
              <input
                type="number"
                value={form.purchasePrice ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purchasePrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                min={0}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              État
            </label>
            <select
              value={form.condition}
              onChange={(e) =>
                setForm({ ...form, condition: e.target.value as Equipment['condition'] })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="good">Bon état</option>
              <option value="fair">État correct</option>
              <option value="damaged">Endommagé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Notes supplémentaires..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
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
      </Modal>

      <Modal
        open={!!selectedEq && !showAssignModal}
        onClose={() => {
          setSelectedEq(null);
          setShowReturnForm(false);
        }}
        title={selectedEq?.name ?? ''}
        maxWidth="lg"
      >
        {selectedEq && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 dark:text-gray-500">Type</span>
                <p className="text-gray-800 dark:text-white font-medium">
                  {TYPE_CONFIG[selectedEq.type].label}
                </p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">N° de série</span>
                <p className="text-gray-800 dark:text-white font-mono">
                  {selectedEq.serialNumber || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Statut</span>
                <div className="mt-1">
                  <Badge variant={STATUS_BADGE[selectedEq.status].variant}>
                    {STATUS_BADGE[selectedEq.status].label}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">État</span>
                <div className="mt-1">
                  <Badge variant={CONDITION_VARIANTS[selectedEq.condition]}>
                    {CONDITION_LABELS[selectedEq.condition]}
                  </Badge>
                </div>
              </div>
              {selectedEq.purchaseDate && (
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Date d'achat</span>
                  <p className="text-gray-800 dark:text-white">
                    {new Date(selectedEq.purchaseDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {selectedEq.purchasePrice != null && (
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Prix d'achat</span>
                  <p className="text-gray-800 dark:text-white">
                    {selectedEq.purchasePrice.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              )}
              {selectedEq.assigneeId && (
                <div className="col-span-2">
                  <span className="text-gray-400 dark:text-gray-500">Assigné à</span>
                  <p className="text-gray-800 dark:text-white font-medium">
                    {getEmployeeName(selectedEq.assigneeId)}
                  </p>
                </div>
              )}
              {selectedEq.notes && (
                <div className="col-span-2">
                  <span className="text-gray-400 dark:text-gray-500">Notes</span>
                  <p className="text-gray-800 dark:text-white">{selectedEq.notes}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Historique des assignations
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getAssignmentsForEquipment(selectedEq.id).length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Aucun historique</p>
                )}
                {getAssignmentsForEquipment(selectedEq.id).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2"
                  >
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {getEmployeeName(a.employeeId)}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(a.assignedAt).toLocaleDateString('fr-FR')}
                        {a.returnedAt && ` → ${new Date(a.returnedAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={CONDITION_VARIANTS[a.conditionAtAssignment]}>
                        {CONDITION_LABELS[a.conditionAtAssignment]}
                      </Badge>
                      {a.conditionAtReturn && (
                        <span className="text-gray-400 dark:text-gray-500 ml-1">
                          →{' '}
                          <Badge variant={CONDITION_VARIANTS[a.conditionAtReturn]}>
                            {CONDITION_LABELS[a.conditionAtReturn]}
                          </Badge>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              {selectedEq.status === 'available' && (
                <button
                  onClick={() => {
                    setAssignEmployeeId('');
                    setShowAssignModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Assigner à un employé
                </button>
              )}
              {selectedEq.status === 'assigned' && !showReturnForm && (
                <button
                  onClick={() => {
                    setReturnCondition('good');
                    setShowReturnForm(true);
                  }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Marquer comme retourné
                </button>
              )}
              {selectedEq.status === 'assigned' && showReturnForm && (
                <div className="col-span-full space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      État au retour
                    </label>
                    <select
                      value={returnCondition}
                      onChange={(e) => setReturnCondition(e.target.value as Equipment['condition'])}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="good">Bon état</option>
                      <option value="fair">État correct</option>
                      <option value="damaged">Endommagé</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowReturnForm(false)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        handleReturn();
                        setShowReturnForm(false);
                      }}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Confirmer le retour
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedEq(null);
                  setShowReturnForm(false);
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assigner un équipement"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employé
            </label>
            <select
              value={assignEmployeeId}
              onChange={(e) => setAssignEmployeeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Sélectionner un employé</option>
              {employees
                .filter((e) => e.status === 'active')
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setShowAssignModal(false)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAssign}
              disabled={!assignEmployeeId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Assigner
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
