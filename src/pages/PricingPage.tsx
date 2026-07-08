import { Check, X, Shield, Zap, Crown, Users, DollarSign, BarChart3, MessageSquare, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import FooterSection from '../components/landing/FooterSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Plan {
  name: string;
  icon: LucideIcon;
  price: string;
  period: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  features: { text: string; included: boolean }[];
  cta: string;
  highlighted?: boolean;
  gradient?: string;
}

const plans: Plan[] = [
  {
    name: 'À l’employé',
    icon: Users,
    price: '6',
    period: '/employé/mois',
    description: 'Vous ne payez que pour vos employés actifs',
    badge: 'Sans engagement',
    badgeColor: 'bg-blue-500',
    features: [
      { text: "Employés sans limite", included: true },
      { text: 'Gestion des présences', included: true },
      { text: 'Bulletins de paie (PDF)', included: true },
      { text: 'Gestion des congés', included: true },
      { text: 'Messages internes', included: true },
      { text: 'Documents RH', included: true },
      { text: 'Assistant IA', included: true },
      { text: 'Rapports avancés', included: true },
      { text: 'Performance & Évaluations', included: true },
      { text: 'Support email prioritaire', included: true },
      { text: 'API & Intégrations', included: false },
      { text: 'Support dédié 24/7', included: false },
    ],
    cta: 'Commencer',
    highlighted: true,
  },
  {
    name: 'PME 10',
    icon: Crown,
    price: '79',
    period: '/mois',
    description: 'Forfait 10 employés, tout inclus',
    badge: 'Économisez 15%',
    badgeColor: 'bg-green-500',
    features: [
      { text: "10 employés inclus", included: true },
      { text: 'Gestion des présences', included: true },
      { text: 'Bulletins de paie (PDF)', included: true },
      { text: 'Gestion des congés', included: true },
      { text: 'Messages internes', included: true },
      { text: 'Documents RH', included: true },
      { text: 'Assistant IA', included: true },
      { text: 'Rapports avancés', included: true },
      { text: 'Performance & Évaluations', included: true },
      { text: 'API & Intégrations', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Account Manager dédié', included: false },
    ],
    cta: 'Choisir PME 10',
    gradient: 'from-gray-900 to-gray-800',
  },
];

const features = [
  { icon: DollarSign, title: 'Multi-devises', desc: 'FCFA, EUR, USD, MAD...', color: 'bg-green-100 text-green-600' },
  { icon: Shield, title: 'Sécurité maximale', desc: 'SSL, 2FA, chiffrement', color: 'bg-blue-100 text-blue-600' },
  { icon: Zap, title: 'Assistant IA', desc: 'Analyses intelligentes', color: 'bg-purple-100 text-purple-600' },
  { icon: MessageSquare, title: 'Support 24/7', desc: 'Français, Anglais, Arabe', color: 'bg-orange-100 text-orange-600' },
  { icon: BarChart3, title: 'Rapports avancés', desc: 'Visualisations interactives', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Users, title: '60+ pays', desc: 'Conformité locale', color: 'bg-teal-100 text-teal-600' },
  { icon: HelpCircle, title: 'Formation', desc: 'Guides et tutoriels', color: 'bg-pink-100 text-pink-600' },
  { icon: Crown, title: 'SLA garanti', desc: '99.9% disponibilité', color: 'bg-yellow-100 text-yellow-600' },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-200/50 transition-all duration-500 group ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: `${index * 80}ms` }}>
      <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <feature.icon size={24} />
      </div>
      <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
      <p className="text-sm text-gray-500">{feature.desc}</p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 bg-dot-pattern">
      <PublicNav />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles size={16} className="mr-2 text-yellow-300" />
            <span className="text-sm font-medium text-white">Tarification simple et transparente</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Un plan pour chaque entreprise
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            De la startup de 2 employés à l'entreprise de 500+, EmployePro s'adapte à vos besoins.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? 'bg-white border-2 border-blue-500 shadow-2xl shadow-blue-200 scale-105 z-10'
                  : plan.gradient
                  ? `bg-gradient-to-br ${plan.gradient} text-white shadow-xl`
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-gray-900 text-sm font-bold px-4 py-1.5 rounded-full shadow-lg`}>
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center justify-center mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  plan.highlighted ? 'bg-blue-100' : plan.gradient ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  <plan.icon size={28} className={plan.highlighted ? 'text-blue-600' : plan.gradient ? 'text-white' : 'text-gray-600'} />
                </div>
              </div>

              <h3 className={`text-2xl font-bold text-center mb-2 ${plan.gradient ? 'text-white' : 'text-gray-800'}`}>
                {plan.name}
              </h3>
              <p className={`text-center mb-6 ${plan.gradient ? 'text-gray-300' : 'text-gray-500'}`}>
                {plan.description}
              </p>

              <div className="text-center mb-6">
                <span className={`text-5xl font-black ${plan.gradient ? 'text-white' : 'text-gray-800'}`}>
                  {plan.price}€
                </span>
                <span className={plan.gradient ? 'text-gray-400' : 'text-gray-400'}>{plan.period}</span>
              </div>

              <button className={`w-full py-3.5 px-4 rounded-xl font-bold text-lg transition-all active:scale-95 mb-8 ${
                plan.highlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                  : plan.gradient
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}>
                {plan.cta}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      feature.included
                        ? plan.gradient ? 'bg-green-400/20' : 'bg-green-100'
                        : plan.gradient ? 'bg-gray-500/20' : 'bg-gray-100'
                    }`}>
                      {feature.included ? (
                        <Check size={12} className={plan.gradient ? 'text-green-400' : 'text-green-600'} />
                      ) : (
                        <X size={12} className={plan.gradient ? 'text-gray-400' : 'text-gray-400'} />
                      )}
                    </div>
                    <span className={`text-sm ${
                      feature.included
                        ? plan.gradient ? 'text-gray-200' : 'text-gray-700'
                        : plan.gradient ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {feature.text}
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
          <h2 className="text-3xl font-black text-gray-800 mb-4">Pourquoi choisir EmployePro ?</h2>
          <p className="text-gray-500 text-lg">Des fonctionnalités puissantes pour gérer votre entreprise</p>
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
            <div className="absolute bottom-5 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative">
            <h3 className="text-3xl font-black mb-4">Prêt à transformer votre gestion RH ?</h3>
            <p className="text-blue-100 text-lg mb-8">Essayez EmployePro gratuitement pendant 14 jours. Aucune carte de crédit requise.</p>
            <a href="/register-company" className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg group">
              Commencer maintenant
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
}
