import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  Plane, Receipt, Plus, CheckCircle, XCircle, MapPin, Calendar, DollarSign, FileText
} from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { exportMissionsPdf, exportExpensesPdf } from '../utils/pdfExport';

const missionStatusConfig: Record<string, { label: string; variant: 'yellow' | 'green' | 'red' | 'blue' }> = {
  pending: { label: 'En attente', variant: 'yellow' },
  approved: { label: 'Approuvée', variant: 'green' },
  rejected: { label: 'Refusée', variant: 'red' },
  completed: { label: 'Terminée', variant: 'blue' },
};

const expenseStatusConfig: Record<string, { label: string; variant: 'yellow' | 'green' | 'red' }> = {
  pending: { label: 'En attente', variant: 'yellow' },
  approved: { label: 'Approuvée', variant: 'green' },
  rejected: { label: 'Refusée', variant: 'red' },
};

const defaultMissionForm = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  objectives: '',
  transportType: 'Avion',
  budget: 0,
};

const defaultExpenseForm = {
  category: '',
  amount: 0,
  currency: 'XOF',
  date: '',
  description: '',
  missionId: '',
};

const transportTypes = ['Avion', 'Train', 'Voiture', 'Bus', 'Bateau', 'Autre'];

const expenseCategories = [
  'Transport', 'Hébergement', 'Restauration', 'Carburant', 'Péage',
  'Communication', 'Fournitures', 'Autre',
];

export default function MissionsPage() {
  const { currentUser } = useApp();
  const { employees, missions, expenses, addMission, updateMission, addExpense, updateExpense } = useData();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'missions' | 'expenses'>('missions');

  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missionForm, setMissionForm] = useState(defaultMissionForm);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState(defaultExpenseForm);

  const isAdmin = currentUser?.role === 'ADMIN';
  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : '-';
  };

  const formatDate = (d: Date | string) => new Date(d).toLocaleDateString('fr-FR');
  const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  const openCreateMission = () => {
    setMissionForm(defaultMissionForm);
    setShowMissionModal(true);
  };

  const handleSaveMission = () => {
    if (!missionForm.title.trim() || !missionForm.destination.trim() || !missionForm.startDate || !missionForm.endDate) {
      addToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    addMission({
      employeeId: currentUser?.id || '',
      title: missionForm.title,
      destination: missionForm.destination,
      startDate: new Date(missionForm.startDate),
      endDate: new Date(missionForm.endDate),
      objectives: missionForm.objectives,
      transportType: missionForm.transportType,
      budget: missionForm.budget,
      status: 'pending',
    });

    addToast('Mission créée', 'success');
    setShowMissionModal(false);
    setMissionForm(defaultMissionForm);
  };

  const handleMissionAction = (id: string, status: 'approved' | 'rejected') => {
    updateMission(id, { status, approvedBy: currentUser?.id });
    addToast(status === 'approved' ? 'Mission approuvée' : 'Mission refusée', 'success');
  };

  const openCreateExpense = () => {
    setExpenseForm(defaultExpenseForm);
    setShowExpenseModal(true);
  };

  const handleSaveExpense = () => {
    if (!expenseForm.category.trim() || !expenseForm.amount || !expenseForm.date) {
      addToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    addExpense({
      missionId: expenseForm.missionId || undefined,
      employeeId: currentUser?.id || '',
      category: expenseForm.category,
      amount: expenseForm.amount,
      currency: expenseForm.currency,
      date: new Date(expenseForm.date),
      description: expenseForm.description,
      status: 'pending',
    });

    addToast('Note de frais créée', 'success');
    setShowExpenseModal(false);
    setExpenseForm(defaultExpenseForm);
  };

  const handleExpenseAction = (id: string, status: 'approved' | 'rejected') => {
    updateExpense(id, { status, approvedBy: currentUser?.id });
    addToast(status === 'approved' ? 'Note de frais approuvée' : 'Note de frais refusée', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Missions & Notes de frais</h1>
        <p className="text-gray-500 dark:text-gray-400">Gérez les missions et les notes de frais</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('missions')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'missions'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Plane size={18} />
          <span>Missions</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'expenses'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Receipt size={18} />
          <span>Notes de frais</span>
        </button>
      </div>

      {activeTab === 'missions' && (
        <>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => exportMissionsPdf(missions)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <FileText size={18} />
              <span>PDF</span>
            </button>
            <button
              onClick={openCreateMission}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Nouvelle mission</span>
            </button>
          </div>

          <div className="space-y-3">
            {missions.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
                <Plane size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Aucune mission pour le moment</p>
              </div>
            )}
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{mission.title}</h3>
                      <Badge variant={missionStatusConfig[mission.status].variant}>
                        {missionStatusConfig[mission.status].label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{mission.destination}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(mission.startDate)} - {formatDate(mission.endDate)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign size={14} />
                        <span>{formatCurrency(mission.budget)} FCFA</span>
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        {mission.transportType}
                      </span>
                    </div>
                    {mission.objectives && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{mission.objectives}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {getEmployeeName(mission.employeeId)}
                    </p>
                  </div>
                  {isAdmin && mission.status === 'pending' && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleMissionAction(mission.id, 'approved')}
                        className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle size={16} />
                        <span>Approuver</span>
                      </button>
                      <button
                        onClick={() => handleMissionAction(mission.id, 'rejected')}
                        className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        <XCircle size={16} />
                        <span>Refuser</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Modal
            open={showMissionModal}
            onClose={() => setShowMissionModal(false)}
            title="Nouvelle mission"
            maxWidth="lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
                <input
                  type="text"
                  value={missionForm.title}
                  onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
                  placeholder="Titre de la mission"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination *</label>
                <input
                  type="text"
                  value={missionForm.destination}
                  onChange={(e) => setMissionForm({ ...missionForm, destination: e.target.value })}
                  placeholder="Ville, pays"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début *</label>
                  <input
                    type="date"
                    value={missionForm.startDate}
                    onChange={(e) => setMissionForm({ ...missionForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin *</label>
                  <input
                    type="date"
                    value={missionForm.endDate}
                    onChange={(e) => setMissionForm({ ...missionForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectifs</label>
                <textarea
                  value={missionForm.objectives}
                  onChange={(e) => setMissionForm({ ...missionForm, objectives: e.target.value })}
                  rows={3}
                  placeholder="Objectifs de la mission..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de transport</label>
                  <select
                    value={missionForm.transportType}
                    onChange={(e) => setMissionForm({ ...missionForm, transportType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {transportTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (FCFA)</label>
                  <input
                    type="number"
                    value={missionForm.budget}
                    onChange={(e) => setMissionForm({ ...missionForm, budget: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowMissionModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveMission}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
                >
                  Créer la mission
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}

      {activeTab === 'expenses' && (
        <>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => exportExpensesPdf(expenses)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <FileText size={18} />
              <span>PDF</span>
            </button>
            <button
              onClick={openCreateExpense}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Nouvelle note de frais</span>
            </button>
          </div>

          <div className="space-y-3">
            {expenses.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700">
                <Receipt size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Aucune note de frais pour le moment</p>
              </div>
            )}
            {expenses.map((expense) => {
              const linkedMission = missions.find((m) => m.id === expense.missionId);
              return (
                <div
                  key={expense.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{expense.category}</h3>
                        <Badge variant={expenseStatusConfig[expense.status].variant}>
                          {expenseStatusConfig[expense.status].label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span className="flex items-center space-x-1">
                          <DollarSign size={14} />
                          <span>{formatCurrency(expense.amount)} {expense.currency}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDate(expense.date)}</span>
                        </span>
                        {linkedMission && (
                          <span className="flex items-center space-x-1">
                            <Plane size={14} />
                            <span>{linkedMission.title}</span>
                          </span>
                        )}
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{expense.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {getEmployeeName(expense.employeeId)}
                      </p>
                    </div>
                    {isAdmin && expense.status === 'pending' && (
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleExpenseAction(expense.id, 'approved')}
                          className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle size={16} />
                          <span>Approuver</span>
                        </button>
                        <button
                          onClick={() => handleExpenseAction(expense.id, 'rejected')}
                          className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          <XCircle size={16} />
                          <span>Refuser</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Modal
            open={showExpenseModal}
            onClose={() => setShowExpenseModal(false)}
            title="Nouvelle note de frais"
            maxWidth="lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant *</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    min={0}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Devise</label>
                  <select
                    value={expenseForm.currency}
                    onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar (USD)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mission liée</label>
                <select
                  value={expenseForm.missionId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, missionId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Aucune</option>
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>{m.title} - {m.destination}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  rows={3}
                  placeholder="Description de la dépense..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
                >
                  Créer la note de frais
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
