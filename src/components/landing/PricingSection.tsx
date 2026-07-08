import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Check, ArrowRight, X } from 'lucide-react';

const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'Toujours',
    desc: 'Pour dÃ©couvrir EmployÃ©Pro en toute libertÃ©.',
    featured: false,
    features: [
      "Jusqu'Ã  10 employÃ©s",
      'Gestion RH de base',
      'Paie simple',
      '1 pays',
      'Support email',
    ],
  },
  {
    name: 'Pro',
    price: '99',
    period: 'â‚¬/mois',
    desc: 'Pour les PME en croissance. Pas de facturation par employÃ©.',
    featured: true,
    features: [
      'EmployÃ©s illimitÃ©s',
      'Tous les modules RH',
      'Paie multi-pays',
      'Assistant IA',
      'Signature Ã©lectronique',
      'Support prioritaire 24/7',
      'API & IntÃ©grations',
    ],
  },
  {
    name: 'Entreprise',
    price: 'Sur mesure',
    period: '',
    desc: 'Pour les grands groupes et administrations.',
    featured: false,
    features: [
      'Tout le plan Pro',
      'Multi-entreprises',
      'Data center dÃ©diÃ©',
      'SLA 99.99%',
      'Audit & ConformitÃ©',
      'Formation on-site',
      'Account manager dÃ©diÃ©',
    ],
  },
];

function PlanCard({ plan }: { plan: typeof plans[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const rotateY = ((x - rect.width / 2) / rect.width) * 6;
    const rotateX = ((rect.height / 2 - y) / rect.height) * 6;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px) scale(${plan.featured ? 1.05 : 1})`;
  }, [plan.featured]);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(800px) rotateX(0) rotateY(0) translateZ(0) scale(${plan.featured ? 1.05 : 1})`;
    el.style.transition = 'transform 0.5s ease-out';
    setTimeout(() => { if (el) el.style.transition = ''; }, 500);
  }, [plan.featured]);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative rounded-3xl p-8 border-2 transition-all duration-300 cursor-default ${
        plan.featured
          ? 'border-blue-500 shadow-xl shadow-blue-600/10 md:scale-105 bg-white'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
          RecommandÃ©
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-black text-gray-900">{plan.price}</span>
          <span className="text-gray-400 text-sm">{plan.period}</span>
        </div>
        <p className="text-sm text-gray-500">{plan.desc}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/register-company"
        className={`block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all ${
          plan.featured
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
            : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300'
        }`}
      >
        {plan.name === 'Gratuit' ? (
          'Commencer'
        ) : plan.name === 'Pro' ? (
          <span className="flex items-center justify-center gap-2">
            Essai gratuit <ArrowRight size={16} />
          </span>
        ) : (
          'Nous contacter'
        )}
      </Link>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 ring-1 ring-blue-200 shadow-sm mb-6">
            <span className="text-sm font-medium text-blue-600">Tarifs transparents</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            Pas de facturation par employÃ©
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Un prix fixe, quel que soit le nombre d'employÃ©s. Pas de surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (<PlanCard key={plan.name} plan={plan} />))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Tous les plans incluent un essai gratuit de 14 jours. Sans carte bancaire.
        </p>

        <div className="mt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 ring-1 ring-blue-200 shadow-sm mb-6">
              <span className="text-sm font-medium text-blue-600">Pourquoi EmployÃ©Pro ?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 tracking-tight">Le choix intelligent</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">ConÃ§u spÃ©cifiquement pour les besoins africains, sans les lourdeurs des logiciels occidentaux.</p>
          </div>

          {(() => {
            const competitors = [
              { name: 'SAP SuccessFactors', price: 'â‚¬100K+/an', features: [true, false, false, false, true, false, false, true], bad: 'Configuration longue, surcoÃ»t Afrique' },
              { name: 'Sage', price: 'â‚¬50K+/an', features: [true, true, true, false, false, false, false, false], bad: "LimitÃ© Ã  l'Europe, absence IA" },
              { name: 'EmployÃ©Pro Africa', price: 'Ã€ partir de 0â‚¬', features: [true, true, true, true, true, true, true, true], bad: null, isOurs: true },
            ];
            const featureLabels = ['Paie multi-pays', 'Assistant IA', 'Signature Ã©lectronique', 'Multi-devises', 'Formation & Quiz', 'Support 24/7', 'Mode hors-ligne PWA', 'Facturation fixe'];
            return (
              <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-5 px-6 text-sm font-medium text-gray-500">FonctionnalitÃ©s</th>
                      {competitors.map((c) => (
                        <th key={c.name} className={`py-5 px-6 text-left text-sm font-semibold ${c.isOurs ? 'text-blue-600' : 'text-gray-700'}`}>
                          <div className="flex items-center gap-2 mb-0.5">
                            {c.isOurs && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">EP</span>
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
                          <td key={c.name} className={`py-4 px-6 ${c.isOurs ? 'bg-blue-50/50' : ''}`}>
                            {c.features[i] ? (
                              <Check size={18} className={c.isOurs ? 'text-blue-500' : 'text-gray-300'} />
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
                        <td key={c.name} className={`py-5 px-6 ${c.isOurs ? 'bg-blue-50/50' : ''}`}>
                          <span className={`text-sm font-bold ${c.isOurs ? 'text-blue-600' : 'text-gray-500'}`}>{c.price}</span>
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
              { name: 'SAP SuccessFactors', bad: 'Configuration longue, surcoÃ»t Afrique' },
              { name: 'Sage', bad: "LimitÃ© Ã  l'Europe, absence IA" },
            ].map(c => (
              <p key={c.name} className="text-sm text-gray-400 text-right">â€” {c.name} : {c.bad}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
