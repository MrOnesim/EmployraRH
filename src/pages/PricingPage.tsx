import { useState } from 'react';
import {
  Check,
  X,
  Shield,
  Zap,
  Crown,
  Users,
  Building2,
  ArrowRight,
  DollarSign,
  BarChart3,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import FooterSection from '../components/landing/FooterSection';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { usePageMeta } from '../hooks/usePageMeta';

interface Plan {
  name: string;
  icon: LucideIcon;
  price: string;
  period: string;
  annualPrice?: string;
  annualPeriod?: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
  excluded?: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
  gradient?: string;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    icon: Users,
    price: '0',
    period: '/ mois',
    description: "Pour démarrer en toute liberté. Jusqu'à 5 employés.",
    badge: 'Sans engagement',
    badgeColor: 'bg-gray-500',
    features: [
      "Jusqu'à 5 employés",
      'Gestion des présences',
      'Bulletins de paie (PDF)',
      'Gestion des congés',
      'Documents RH',
    ],
    excluded: ['Assistant IA', 'API & Intégrations', 'Rapports avancés', 'Support prioritaire'],
    cta: 'Commencer',
    ctaLink: '/register-company',
  },
  {
    name: 'Pro',
    icon: Zap,
    price: '6',
    period: '/employé/mois',
    annualPrice: '5',
    annualPeriod: '/employé/mois, facturé annuellement',
    description: 'Pour les PME en croissance',
    badge: 'Populaire',
    badgeColor: 'bg-primary',
    features: [
      'Employés sans limite',
      'Gestion des présences',
      'Bulletins de paie (PDF)',
      'Gestion des congés',
      'Messages internes',
      'Documents RH',
      'Assistant IA',
      'Rapports avancés',
      'Performance & Évaluations',
      'API & Intégrations',
      'Support email prioritaire',
    ],
    cta: 'Essai gratuit 14 jours',
    ctaLink: '/register-company',
    highlighted: true,
  },
  {
    name: 'Business',
    icon: Building2,
    price: '250',
    period: '/mois',
    annualPrice: '208',
    annualPeriod: '/mois, facturé annuellement',
    description: '50 employés inclus, +4€/supplémentaire',
    badge: 'Économisez 17%',
    badgeColor: 'bg-green-500',
    features: [
      '50 employés inclus',
      'Tout le plan Pro',
      'SSO & Audits',
      'BI & Tableaux de bord',
      'Support dédié 24/7',
      'Account Manager',
    ],
    cta: 'Essai gratuit 14 jours',
    ctaLink: '/register-company',
    gradient: 'from-gray-900 to-gray-800',
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: 'Sur mesure',
    period: '',
    description: 'Pour les grands groupes',
    features: [
      'Tout le plan Business',
      'Multi-entreprises',
      'SLA 99.99%',
      'Data center dédié',
      'On-premise possible',
      'Formation on-site',
    ],
    cta: 'WhatsApp',
    ctaLink: 'https://wa.me/2290141969208',
  },
];

const features = [
  {
    icon: DollarSign,
    title: 'Multi-devises',
    desc: 'FCFA, EUR, USD, MAD...',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Shield,
    title: 'Sécurité maximale',
    desc: 'SSL, 2FA, chiffrement',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Zap,
    title: 'Assistant IA',
    desc: 'Analyses intelligentes',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: MessageSquare,
    title: 'Support 24/7',
    desc: 'Français, Anglais, Arabe',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Rapports avancés',
    desc: 'Visualisations interactives',
    color: 'bg-indigo-100 text-indigo-600',
  },
  { icon: Users, title: '60+ pays', desc: 'Conformité locale', color: 'bg-teal-100 text-teal-600' },
  {
    icon: HelpCircle,
    title: 'Formation',
    desc: 'Guides et tutoriels',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Crown,
    title: 'SLA garanti',
    desc: '99.9% disponibilité',
    color: 'bg-yellow-100 text-yellow-600',
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-200/50 transition-all duration-500 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
      >
        <feature.icon size={24} />
      </div>
      <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
      <p className="text-sm text-gray-500">{feature.desc}</p>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  usePageMeta({
    title: 'Tarifs EmployéPro Africa — Des forfaits adaptés à chaque PME',
    description:
      "Découvrez les offres Starter, Pro, Business et Enterprise d'EmployéPro Africa. Multi-devises, sans engagement, avec essai gratuit.",
  });
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 bg-dot-pattern">
      <PublicNav />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full animate-pulse" />
          <div
            className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Un plan pour chaque entreprise
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            De la startup de 2 employés à l'entreprise de 500+, EmployraRH s'adapte à vos besoins.
          </p>
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              aria-pressed={billing === 'monthly'}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              aria-pressed={billing === 'annual'}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === 'annual'
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Annuel <span className="text-emerald-300 font-bold">−2 mois</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? 'bg-white border-2 border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10 ring-1 ring-primary/30'
                  : plan.gradient
                    ? `bg-gradient-to-br ${plan.gradient} text-white shadow-xl`
                    : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center justify-center mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.highlighted
                      ? 'bg-primary/10'
                      : plan.gradient
                        ? 'bg-white/10'
                        : 'bg-gray-100'
                  }`}
                >
                  <plan.icon
                    size={24}
                    className={
                      plan.highlighted
                        ? 'text-primary'
                        : plan.gradient
                          ? 'text-white'
                          : 'text-gray-600'
                    }
                  />
                </div>
              </div>

              <h3
                className={`text-xl font-bold text-center mb-1 ${plan.gradient ? 'text-white' : 'text-gray-800'}`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-center text-sm mb-4 ${plan.gradient ? 'text-gray-300' : 'text-gray-500'}`}
              >
                {plan.description}
              </p>

              <div className="text-center mb-6">
                {(() => {
                  const isCustom = plan.price === 'Sur mesure';
                  const price =
                    billing === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price;
                  const period =
                    billing === 'annual' && plan.annualPeriod ? plan.annualPeriod : plan.period;
                  return (
                    <>
                      <span
                        className={`text-4xl font-black ${plan.gradient ? 'text-white' : 'text-gray-800'}`}
                      >
                        {isCustom ? 'Sur mesure' : `${price} €`}
                      </span>
                      {!isCustom && (
                        <span
                          className={`text-sm ${plan.gradient ? 'text-gray-400' : 'text-gray-400'}`}
                        >
                          {period}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              <a
                href={plan.ctaLink}
                className={`block text-center w-full py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 mb-6 ${
                  plan.highlighted
                    ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                    : plan.gradient
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {plan.cta}
              </a>

              <div className="space-y-2.5">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className={`shrink-0 mt-0.5 ${plan.gradient ? 'text-green-400' : 'text-green-500'}`}
                    />
                    <span
                      className={`text-sm ${plan.gradient ? 'text-gray-200' : 'text-gray-700'}`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.excluded?.map((feature, j) => (
                  <div key={`x-${j}`} className="flex items-start gap-2.5">
                    <X
                      size={14}
                      className={`shrink-0 mt-0.5 ${plan.gradient ? 'text-gray-500' : 'text-gray-300'}`}
                    />
                    <span
                      className={`text-sm ${plan.gradient ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Comparison */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-800 mb-4">Pourquoi choisir EmployraRH ?</h2>
          <p className="text-gray-500 text-lg">
            Des fonctionnalités puissantes pour gérer votre entreprise
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-5 right-10 w-20 h-20 bg-white/5 rounded-full animate-pulse" />
            <div
              className="absolute bottom-5 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </div>
          <div className="relative">
            <h3 className="text-3xl font-black mb-4">Prêt à transformer votre gestion RH ?</h3>
            <p className="text-blue-100 text-lg mb-8">
              Essayez EmployraRH gratuitement pendant 14 jours. Aucune carte de crédit requise.
            </p>
            <a
              href="/register-company"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg group"
            >
              Commencer maintenant
              <ArrowRight
                size={20}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
}
