import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import { FileText, Landmark, Plus, Download, CheckCircle, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { PAYROLL_COUNTRIES } from '../constants';
import type { TaxDeclaration } from '../types';
import { exportTaxDeclarationPdf } from '../utils/pdfExport';

const TAX_TYPE_LABELS: Record<string, string> = {
  IS: 'Impôt sur les Sociétés',
  IR: 'Impôt sur le Revenu',
  TVA: 'Taxe sur la Valeur Ajoutée',
  CNSS: 'Caisse Nationale de Sécurité Sociale',
  IRPP: 'Impôt sur le Revenu des Personnes Physiques',
  CET: 'Contribution Économique Territoriale',
};

const TAX_TYPE_VARIANTS: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  IS: 'blue',
  IR: 'red',
  TVA: 'green',
  CNSS: 'yellow',
  IRPP: 'gray',
  CET: 'blue',
};

const STATUS_CONFIG: Record<TaxDeclaration['status'], { label: string; variant: 'yellow' | 'blue' | 'green' }> = {
  draft: { label: 'Brouillon', variant: 'yellow' },
  submitted: { label: 'Soumis', variant: 'blue' },
  paid: { label: 'Payé', variant: 'green' },
};

const PERIODS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DEFAULT_FORM = {
  country: '',
  period: '',
  type: 'IS' as TaxDeclaration['type'],
};

function formatCurrency(amount: number, countryCode: string): string {
  const cfg = PAYROLL_COUNTRIES.find((c) => c.country === countryCode);
  if (!cfg) return amount.toLocaleString('fr-FR');
  try {
    return new Intl.NumberFormat(cfg.currencyLocale, { style: 'currency', currency: cfg.currency }).format(amount);
  } catch {
    return `${amount.toLocaleString('fr-FR')} ${cfg.currency}`;
  }
}

function generateCsv(declaration: TaxDeclaration): string {
  const rows = [
    ['ID', 'Pays', 'Période', 'Type', 'Masse Salariale', 'Montant Taxe', 'Statut', 'Date d\'échéance'],
    [
      declaration.id,
      declaration.country,
      declaration.period,
      declaration.type,
      String(declaration.totalSalary),
      String(declaration.totalTax),
      declaration.status,
      new Date(declaration.dueDate).toLocaleDateString('fr-FR'),
    ],
  ];
  return rows.map((r) => r.join(',')).join('\n');
}

function downloadCsv(declaration: TaxDeclaration) {
  const csv = generateCsv(declaration);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `declaration-${declaration.type}-${declaration.period}-${declaration.id.slice(0, 6)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TaxPage() {
  const { currentCompany } = useApp();
  const { taxDeclarations, employees, addTaxDeclaration } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => setForm(DEFAULT_FORM);

  const autoCalculated = useMemo(() => {
    const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    const countryConfig = PAYROLL_COUNTRIES.find((c) => c.country === form.country);
    const totalTax = countryConfig ? totalSalary * (countryConfig.deductionRate + countryConfig.bonusRate) : 0;
    return { totalSalary, totalTax };
  }, [form.country, employees]);

  const filteredDeclarations = useMemo(() => {
    return taxDeclarations.filter((d) => {
      const matchCountry = !filterCountry || d.country === filterCountry;
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchSearch = !searchQuery || d.type.toLowerCase().includes(searchQuery.toLowerCase()) || d.period.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCountry && matchStatus && matchSearch;
    });
  }, [taxDeclarations, filterCountry, filterStatus, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.country || !form.period || !currentCompany) {
      addToast('Veuillez remplir tous les champs', 'error');
      return;
    }
    try {
      addTaxDeclaration({
        companyId: currentCompany.id,
        country: form.country,
        period: form.period,
        type: form.type,
        totalSalary: autoCalculated.totalSalary,
        totalTax: autoCalculated.totalTax,
        status: 'draft',
        dueDate: new Date(),
      });
      addToast('Déclaration fiscale créée', 'success');
      setShowModal(false);
      resetForm();
    } catch {
      addToast('Erreur lors de la création de la déclaration', 'error');
    }
  };

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Déclarations Fiscales</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestion automatisée des déclarations par pays</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Nouvelle déclaration</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par type ou période..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tous les pays</option>
            {PAYROLL_COUNTRIES.map((c) => (
              <option key={c.country} value={c.country}>{c.countryName}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="submitted">Soumis</option>
            <option value="paid">Payé</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Pays</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Période</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Masse salariale</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Montant taxe</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredDeclarations.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                    Aucune déclaration fiscale
                  </td>
                </tr>
              )}
              {filteredDeclarations.map((declaration) => {
                const statusCfg = STATUS_CONFIG[declaration.status];
                const countryCfg = PAYROLL_COUNTRIES.find((c) => c.country === declaration.country);
                return (
                  <tr key={declaration.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <Badge variant={TAX_TYPE_VARIANTS[declaration.type] || 'gray'}>{declaration.type}</Badge>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{TAX_TYPE_LABELS[declaration.type] || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Landmark size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-800 dark:text-gray-100">{countryCfg?.countryName || declaration.country}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{declaration.period}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-800 dark:text-gray-100">
                      {formatCurrency(declaration.totalSalary, declaration.country)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(declaration.totalTax, declaration.country)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {declaration.status === 'draft' && <AlertTriangle size={14} className="text-yellow-500" />}
                        {declaration.status === 'submitted' && <Clock size={14} className="text-blue-500" />}
                        {declaration.status === 'paid' && <CheckCircle size={14} className="text-green-500" />}
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => downloadCsv(declaration)}
                          className="inline-flex items-center space-x-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <Download size={16} />
                          <span>CSV</span>
                        </button>
                        <button
                          onClick={() => exportTaxDeclarationPdf(declaration)}
                          className="inline-flex items-center space-x-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                        >
                          <FileText size={16} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvelle déclaration fiscale" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pays</label>
            <select
              required
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Sélectionner un pays</option>
              {PAYROLL_COUNTRIES.map((c) => (
                <option key={c.country} value={c.country}>{c.countryName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Période</label>
            <select
              required
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Sélectionner une période</option>
              {PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type de déclaration</label>
            <select
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as TaxDeclaration['type'] })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(TAX_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{key} - {label}</option>
              ))}
            </select>
          </div>

          {form.country && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Masse salariale totale</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {formatCurrency(autoCalculated.totalSalary, form.country)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Taxe estimée</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(autoCalculated.totalTax, form.country)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total employés</span>
                <span className="font-semibold text-gray-800 dark:text-white">{employees.length}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Créer la déclaration
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
