import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Check, ArrowRight, X, Users, Zap, Building2, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    period: '/ mois',
    desc: "Pour démarrer en toute liberté. Jusqu'à 5 employés.",
    featured: false,
    icon: Users,
    features: [
      "Jusqu'à 5 employés",
      'Gestion des présences',
      'Bulletins de paie',
      'Congés & Documents',
    ],
  },
  {
    name: 'Pro',
    price: '6',
    period: '/employé/mois',
    desc: "Pas de limite d'employés. 14 jours gratuits.",
    featured: true,
    icon: Zap,
    features: [
      'Employés sans limite',
      'Assistant IA & Rapports',
      'Paie multi-pays',
      'API & Intégrations',
      'Support prioritaire',
    ],
  },
  {
    name: 'Business',
    price: '250',
    period: '/mois (50 employés)',
    desc: '+4€/employé supplémentaire',
    featured: false,
    icon: Building2,
    features: [
      '50 employés inclus',
      'SSO & Audit log',
      'BI & Tableaux de bord',
      'Support dédié 24/7',
      'Account Manager',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    desc: 'Pour les grands groupes',
    featured: false,
    icon: Crown,
    features: [
      'Multi-entreprises',
      'SLA 99.99%',
      'Data center dédié',
      'On-premise possible',
      'Formation on-site',
    ],
  },
];

function PlanCard({ plan }: { plan: (typeof plans)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      const rotateY = ((x - rect.width / 2) / rect.width) * 6;
      const rotateX = ((rect.height / 2 - y) / rect.height) * 6;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px) scale(${plan.featured ? 1.05 : 1})`;
    },
    [plan.featured],
  );
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(800px) rotateX(0) rotateY(0) translateZ(0) scale(${plan.featured ? 1.05 : 1})`;
    el.style.transition = 'transform 0.5s ease-out';
    setTimeout(() => {
      if (el) el.style.transition = '';
    }, 500);
  }, [plan.featured]);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative rounded-3xl p-8 border-2 transition-all duration-300 cursor-default ${
        plan.featured
          ? 'border-primary shadow-xl shadow-primary/10 md:scale-105 bg-white'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
          Recommandé
        </div>
      )}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <plan.icon size={20} className="text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-black text-gray-900">
            {plan.price === 'Sur mesure' ? 'Sur mesure' : `${plan.price} €`}
          </span>
          <span className="text-gray-400 text-sm">{plan.period}</span>
        </div>
        <p className="text-sm text-gray-500">{plan.desc}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={16} className="text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{f}</span>
          </li>
        ))}
      </ul>
      {plan.name === 'Enterprise' ? (
        <a
          href="https://wa.me/2290141969208"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all border-2 border-gray-200 text-gray-700 hover:border-gray-300"
        >
          WhatsApp
        </a>
      ) : (
        <Link
          to="/register-company"
          className={`block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all ${
            plan.featured
              ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
              : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          {plan.name === 'Starter' ? (
            'Commencer'
          ) : (
            <span className="flex items-center justify-center gap-2">
              Essai gratuit <ArrowRight size={16} />
            </span>
          )}
        </Link>
      )}
    </div>
  );
}

export default function PricingSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="pricing" className="py-28 bg-white relative overflow-hidden">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 ring-1 ring-primary/20 shadow-sm mb-6">
            <span className="text-sm font-medium text-primary">Tarifs transparents</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            Des plans pour chaque entreprise
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Gratuit jusqu'à 5 employés. Pas de surprise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Tous les plans incluent un essai gratuit de 14 jours. Sans carte bancaire.
        </p>

        <div className="mt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 ring-1 ring-primary/20 shadow-sm mb-6">
              <span className="text-sm font-medium text-primary">Pourquoi EmployraRH ?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 tracking-tight">
              Le choix intelligent
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Optimisez la gestion de vos ressources humaines grâce à une plateforme intuitive,
              sécurisée et évolutive.
            </p>
          </div>

          {(() => {
            const competitors = [
              {
                name: 'SAP SuccessFactors',
                price: '€100K+/an',
                features: [true, false, false, false, true, false, false, true],
                bad: 'Configuration longue, surcoût international',
              },
              {
                name: 'Sage',
                price: '€50K+/an',
                features: [true, true, true, false, false, false, false, false],
                bad: "Limité à l'Europe, absence IA",
              },
              {
                name: 'EmployraRH',
                price: 'À partir de 0€',
                features: [true, true, true, true, true, true, true, true],
                bad: null,
                isOurs: true,
              },
            ];
            const featureLabels = [
              'Paie multi-pays',
              'Assistant IA',
              'Signature électronique',
              'Multi-devises',
              'Formation & Quiz',
              'Support 24/7',
              'Mode hors-ligne PWA',
              'Facturation employé',
            ];
            return (
              <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-5 px-6 text-sm font-medium text-gray-500">
                        Fonctionnalités
                      </th>
                      {competitors.map((c) => (
                        <th
                          key={c.name}
                          className={`py-5 px-6 text-left text-sm font-semibold ${c.isOurs ? 'text-primary' : 'text-gray-700'}`}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            {c.isOurs && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">ER</span>
                              </div>
                            )}
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-400 font-normal">{c.price}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {featureLabels.map((label, i) => (
                      <tr key={label} className="border-b border-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-600">{label}</td>
                        {competitors.map((c) => (
                          <td
                            key={c.name}
                            className={`py-4 px-6 ${c.isOurs ? 'bg-primary/[0.04]' : ''}`}
                          >
                            {c.features[i] ? (
                              <Check
                                size={18}
                                className={c.isOurs ? 'text-primary' : 'text-gray-300'}
                              />
                            ) : (
                              <X size={18} className="text-red-300" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="py-5 px-6 text-sm text-gray-500 font-medium">Prix</td>
                      {competitors.map((c) => (
                        <td
                          key={c.name}
                          className={`py-5 px-6 ${c.isOurs ? 'bg-primary/[0.04]' : ''}`}
                        >
                          <span
                            className={`text-sm font-bold ${c.isOurs ? 'text-primary' : 'text-gray-500'}`}
                          >
                            {c.price}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}

          <div className="mt-6 space-y-1">
            {[
              { name: 'SAP SuccessFactors', bad: 'Configuration longue, surcoût international' },
              { name: 'Sage', bad: "Limité à l'Europe, absence IA" },
            ].map((c) => (
              <p key={c.name} className="text-sm text-gray-400 text-right">
                — {c.name} : {c.bad}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
