import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Check, X } from 'lucide-react';

const rows = [
  { label: 'Employés illimités', us: true, them: false },
  { label: 'Paie multi-pays (FCFA, EUR, USD)', us: true, them: false },
  { label: 'Assistant IA inclus', us: true, them: false },
  { label: 'Signature électronique', us: true, them: false },
  { label: 'Pointage QR Code', us: true, them: false },
  { label: 'Application mobile', us: true, them: false },
  { label: 'Pas de facturation par employé', us: true, them: false },
  { label: 'Support 24/7 prioritaire', us: true, them: 'partiel' },
  { label: 'API & Intégrations', us: true, them: false },
  { label: 'Data center Europe / Afrique', us: true, them: false },
];

export default function WhyUsSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-28 bg-gradient-to-b from-white to-gray-50">
      <div ref={ref} className={`relative max-w-5xl mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 ring-1 ring-blue-200 shadow-sm mb-6">
            <span className="text-sm font-medium text-blue-600">Pourquoi nous ?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            EmployéPro vs <span className="text-gray-400">la concurrence</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Pas de frais cachés, pas de licence par tête. Une plateforme complète, transparente et adaptée à l'Afrique.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Fonctionnalité</th>
                <th className="text-center py-4 px-6">
                  <span className="text-blue-600 font-bold text-lg">EmployéPro</span>
                </th>
                <th className="text-center py-4 px-6">
                  <span className="text-gray-400 font-bold text-lg">Autres solutions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${i === rows.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="py-4 px-6 text-gray-700 font-medium">{row.label}</td>
                  <td className="py-4 px-6 text-center">
                    {row.us === true
                      ? <Check size={20} className="text-green-500 inline" />
                      : <X size={20} className="text-red-300 inline" />
                    }
                  </td>
                  <td className="py-4 px-6 text-center">
                    {row.them === 'partiel'
                      ? <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Partiel</span>
                      : row.them === true
                        ? <Check size={20} className="text-green-500 inline" />
                        : <X size={20} className="text-red-300 inline" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
