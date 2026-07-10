import type { PayrollConfig } from './types';

export const PAYROLL = {
  BONUS_RATE: 0.1,
  DEDUCTION_RATE: 0.15,
  OVERTIME_THRESHOLD: 8,
  MIN_SALARY_RATIO: 3,
} as const;

export const ROUTES = {
  ADMIN: '/admin',
  EMPLOYEE: '/employee',
  LOGIN: '/login',
  REGISTER: '/register-company',
  PRICING: '/pricing',
  ABOUT: '/about',
  FAQ: '/faq',
} as const;

export const LEAVE_TYPES = {
  annual: 'Congé annuel',
  sick: 'Congé maladie',
  maternity: 'Congé maternité',
  special: 'Permission spéciale',
} as const;

export const LEAVE_STATUS = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
} as const;

export const DEPARTMENTS = [
  'Direction', 'Ressources Humaines', 'Finance', 'Informatique',
  'Marketing', 'Ventes', 'Operations', 'Juridique', 'Autre',
] as const;

export const PAYROLL_COUNTRIES: PayrollConfig[] = [
  { id: '', companyId: '', country: 'FR', countryName: 'France', bonusRate: 0.08, deductionRate: 0.22, taxRate: 0.22, socialChargesRate: 0.08, paymentDay: 5, overtimeRate: 1.5, currency: '€', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'CI', countryName: "Côte d'Ivoire", bonusRate: 0.1, deductionRate: 0.07, taxRate: 0.07, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'SN', countryName: 'Sénégal', bonusRate: 0.1, deductionRate: 0.07, taxRate: 0.07, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'CM', countryName: 'Cameroun', bonusRate: 0.1, deductionRate: 0.065, taxRate: 0.065, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'TG', countryName: 'Togo', bonusRate: 0.1, deductionRate: 0.07, taxRate: 0.07, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'BF', countryName: 'Burkina Faso', bonusRate: 0.1, deductionRate: 0.07, taxRate: 0.07, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'BJ', countryName: 'Bénin', bonusRate: 0.1, deductionRate: 0.066, taxRate: 0.066, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'ML', countryName: 'Mali', bonusRate: 0.1, deductionRate: 0.07, taxRate: 0.07, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'NE', countryName: 'Niger', bonusRate: 0.1, deductionRate: 0.07, taxRate: 0.07, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'FCFA', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'GN', countryName: 'Guinée', bonusRate: 0.1, deductionRate: 0.06, taxRate: 0.06, socialChargesRate: 0.1, paymentDay: 5, overtimeRate: 1.5, currency: 'GNF', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'MA', countryName: 'Maroc', bonusRate: 0.06, deductionRate: 0.18, taxRate: 0.18, socialChargesRate: 0.06, paymentDay: 5, overtimeRate: 1.5, currency: 'MAD', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'TN', countryName: 'Tunisie', bonusRate: 0.07, deductionRate: 0.16, taxRate: 0.16, socialChargesRate: 0.07, paymentDay: 5, overtimeRate: 1.5, currency: 'TND', currencyLocale: 'fr-FR' },
  { id: '', companyId: '', country: 'KE', countryName: 'Kenya', bonusRate: 0.05, deductionRate: 0.08, taxRate: 0.08, socialChargesRate: 0.05, paymentDay: 5, overtimeRate: 1.5, currency: 'KES', currencyLocale: 'en-KE' },
  { id: '', companyId: '', country: 'NG', countryName: 'Nigeria', bonusRate: 0.05, deductionRate: 0.1, taxRate: 0.1, socialChargesRate: 0.05, paymentDay: 5, overtimeRate: 1.5, currency: '₦', currencyLocale: 'en-NG' },
  { id: '', companyId: '', country: 'ZA', countryName: 'Afrique du Sud', bonusRate: 0.05, deductionRate: 0.12, taxRate: 0.12, socialChargesRate: 0.05, paymentDay: 5, overtimeRate: 1.5, currency: 'R', currencyLocale: 'en-ZA' },
  { id: '', companyId: '', country: 'GH', countryName: 'Ghana', bonusRate: 0.05, deductionRate: 0.08, taxRate: 0.08, socialChargesRate: 0.05, paymentDay: 5, overtimeRate: 1.5, currency: '₵', currencyLocale: 'en-GH' },
];

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const;

export const QUICK_QUESTIONS = [
  { icon: 'BarChart3', text: 'Résumé complet de l\'entreprise', color: 'text-blue-600' },
  { icon: 'Users', text: 'Qui est absent aujourd\'hui ?', color: 'text-red-600' },
  { icon: 'DollarSign', text: 'Analyse complète de la masse salariale', color: 'text-green-600' },
  { icon: 'TrendingUp', text: 'Top 3 des meilleurs employés', color: 'text-purple-600' },
  { icon: 'Clock', text: 'Quel employé fait le plus d\'heures sup. ?', color: 'text-orange-600' },
  { icon: 'AlertTriangle', text: 'Y a-t-il des congés en attente ?', color: 'text-yellow-600' },
  { icon: 'Globe', text: 'Statistiques par département', color: 'text-indigo-600' },
  { icon: 'Lightbulb', text: 'Recommandations pour améliorer la productivité', color: 'text-teal-600' },
  { icon: 'Zap', text: 'Détection d\'anomalies dans les données', color: 'text-rose-600' },
  { icon: 'Search', text: 'Quel est le turnover de l\'entreprise ?', color: 'text-cyan-600' },
] as const;
