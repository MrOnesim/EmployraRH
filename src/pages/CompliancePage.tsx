import { useState } from 'react';
import {
  getSupportedCountries,
  simulatePayslip,
  simulatePayslipPdf,
  type PayrollResult,
  type ContributionBreakdown,
} from '../services/complianceService';
import { useToast } from '../context/ToastContext';
import { MONTHS } from '../constants';
import {
  ShieldCheck,
  Play,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Globe,
  Coins,
  Receipt,
  TrendingDown,
  Wallet,
} from 'lucide-react';

const COUNTRY_LABELS: Record<string, { name: string; currency: string; flag: string }> = {
  FR: { name: 'France', currency: 'EUR', flag: 'FR' },
  BJ: { name: 'Benin', currency: 'XOF', flag: 'BJ' },
  CI: { name: "Cote d'Ivoire", currency: 'XOF', flag: 'CI' },
  SN: { name: 'Senegal', currency: 'XOF', flag: 'SN' },
};

function fmt(v: number, currency: string) {
  return (
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      v,
    ) +
    ' ' +
    currency
  );
}

export default function CompliancePage() {
  const { addToast } = useToast();
  const [countries, setCountries] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [countryCode, setCountryCode] = useState('FR');
  const [grossSalary, setGrossSalary] = useState('500000');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PayrollResult | null>(null);
  const [showContributions, setShowContributions] = useState(false);
  const [showTaxBrackets, setShowTaxBrackets] = useState(false);

  const loadCountries = async () => {
    if (loaded) return;
    try {
      const c = await getSupportedCountries();
      setCountries(c);
      setLoaded(true);
    } catch {
      setCountries(['FR', 'BJ', 'CI', 'SN']);
      setLoaded(true);
    }
  };
  loadCountries();

  const handleSimulate = async () => {
    if (!grossSalary || +grossSalary <= 0) {
      addToast('Entrez un salaire brut valide', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await simulatePayslip({
        grossSalary: +grossSalary,
        countryCode,
        month,
        year,
      });
      setResult(res.result);
      addToast('Simulation calculee', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur de simulation';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!grossSalary || +grossSalary <= 0) return;
    setLoading(true);
    try {
      const blob = await simulatePayslipPdf({
        grossSalary: +grossSalary,
        countryCode,
        month,
        year,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-paie-${countryCode}-${month}-${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('PDF telecharge', 'success');
    } catch {
      addToast('Erreur lors du telechargement du PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const info = COUNTRY_LABELS[countryCode] ?? { name: countryCode, currency: '', flag: '' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck size={28} className="text-blue-600" />
            Conformite legale
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Simulation de bulletin de paie multi-pays
          </p>
        </div>
      </div>

      {/* Country cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {countries.map((code) => {
          const c = COUNTRY_LABELS[code] ?? { name: code, currency: '', flag: '' };
          const active = countryCode === code;
          return (
            <button
              key={code}
              onClick={() => {
                setCountryCode(code);
                setResult(null);
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                active
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
              }`}
            >
              <p className="text-2xl mb-1">{c.flag}</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{c.name}</p>
              <p className="text-xs text-gray-500">
                {code} - {c.currency}
              </p>
            </button>
          );
        })}
      </div>

      {/* Simulation form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Simulation rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Country select */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              <Globe size={14} className="inline mr-1" />
              Pays
            </label>
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {COUNTRY_LABELS[c]?.name ?? c}
                </option>
              ))}
            </select>
          </div>

          {/* Gross salary */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              <Coins size={14} className="inline mr-1" />
              Salaire brut
            </label>
            <input
              type="number"
              value={grossSalary}
              onChange={(e) => {
                setGrossSalary(e.target.value);
                setResult(null);
              }}
              placeholder="500000"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Mois
            </label>
            <select
              value={month}
              onChange={(e) => {
                setMonth(+e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Annee
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => {
                setYear(+e.target.value);
                setResult(null);
              }}
              min={2020}
              max={2100}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {loading ? 'Calcul en cours...' : 'Simuler'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={loading || !result}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <Coins size={14} />
                Brut
              </div>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {fmt(result.grossSalary, info.currency)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <TrendingDown size={14} />
                Cotisations sal.
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                -{fmt(result.totalEmployeeContributions, info.currency)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <Receipt size={14} />
                Impot
              </div>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                -{fmt(result.incomeTax, info.currency)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <Wallet size={14} />
                Net a payer
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {fmt(result.netPayable, info.currency)}
              </p>
            </div>
          </div>

          {/* Contributions detail */}
          {result.contributions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowContributions(!showContributions)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Cotisations sociales ({result.contributions.length})
                </h3>
                {showContributions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {showContributions && (
                <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-750">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                          Cotisation
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                          Salarie
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                          Employeur
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                          Plafond
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {result.contributions.map((c: ContributionBreakdown) => (
                        <tr key={c.code} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{c.label}</td>
                          <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">
                            {c.employeeAmount > 0
                              ? `-${fmt(c.employeeAmount, info.currency)}`
                              : '-'}
                          </td>
                          <td className="px-4 py-2 text-right text-blue-600 dark:text-blue-400">
                            {c.employerAmount > 0 ? fmt(c.employerAmount, info.currency) : '-'}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400">
                            {c.cap != null ? fmt(c.cap, info.currency) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tax brackets */}
          {result.taxBracketsApplied.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowTaxBrackets(!showTaxBrackets)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Tranches d'impot ({result.taxBracketsApplied.length})
                </h3>
                {showTaxBrackets ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {showTaxBrackets && (
                <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-750">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                          Tranche
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                          Taux
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                          Montant
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {result.taxBracketsApplied.map((b, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-4 py-2 text-gray-800 dark:text-gray-100">
                            {fmt(b.min, info.currency)}{' '}
                            {b.max != null ? `- ${fmt(b.max, info.currency)}` : '+'}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">
                            {(b.rate * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-right text-orange-600 dark:text-orange-400">
                            {b.amount > 0 ? `-${fmt(b.amount, info.currency)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
            Regles{' '}
            {COUNTRY_LABELS[result.metadata.countryCode]?.name ?? result.metadata.countryCode} v
            {result.metadata.rulesVersion} ({result.metadata.effectiveDate})
          </div>
        </div>
      )}
    </div>
  );
}
