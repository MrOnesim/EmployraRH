import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'EmployéPro est-il adapté à mon entreprise ?',
    a: "EmployéPro convient aux PME, grandes entreprises, ONG et administrations publiques. Notre plateforme s'adapte à toutes les tailles d'organisation avec des fonctionnalités modulaires.",
  },
  {
    q: 'Comment fonctionne la facturation ?',
    a: "Nous ne facturons pas par employé. Vous payez un abonnement fixe mensuel ou annuel, quel que soit le nombre d'employés gérés sur la plateforme.",
  },
  {
    q: 'Quels sont les pays supportés ?',
    a: "Nous supportons actuellement 16+ pays en Afrique de l'Ouest, Centrale, Australe, du Nord et en Europe. Nous ajoutons régulièrement de nouveaux pays.",
  },
  {
    q: 'Les données sont-elles stockées en Afrique ?',
    a: 'Nous proposons des data centers en Europe et en Afrique. Vous pouvez choisir la localisation de vos données. Tout est conforme RGPD et aux réglementations locales.',
  },
  {
    q: 'Puis-je payer les salaires depuis la plateforme ?',
    a: 'Oui, notre module Paie intègre les systèmes de paiement locaux (Mobile Money, virements bancaires) et internationaux (Flutterwave, Paystack, SWIFT).',
  },
  {
    q: 'Comment fonctionne la signature électronique ?',
    a: 'Vous importez un document, définissez les signataires, et chacun signe en ligne depuis son navigateur ou mobile. La signature a valeur juridique.',
  },
  {
    q: "Est-ce que l'assistant IA est vraiment utile ?",
    a: 'Notre IA analyse vos données RH, génère des rapports, répond à vos questions et fait des recommandations. Les utilisateurs rapportent un gain de temps de 40%.',
  },
  {
    q: 'Puis-je exporter mes données ?',
    a: 'Oui, vous pouvez exporter toutes vos données en PDF, Excel, CSV à tout moment. Nous proposons aussi une API pour vos intégrations personnalisées.',
  },
  {
    q: "Quel est le délai d'implémentation ?",
    a: "Comptez quelques minutes pour créer votre compte et importer vos premiers employés. L'implémentation complète prend généralement 1 à 2 jours.",
  },
  {
    q: "Proposez-vous une version d'essai ?",
    a: 'Oui, un essai gratuit de 14 jours sans engagement et sans carte bancaire. Toutes les fonctionnalités sont accessibles.',
  },
  {
    q: 'Le support est-il disponible en français ?',
    a: 'Oui, notre support est disponible en français, anglais, arabe et portugais. Assistance par chat, email et téléphone 24/7.',
  },
];

function FAQItem({ faq }: { faq: (typeof faqs)[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-150 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group outline-none cursor-pointer"
      >
        <span className={`text-base font-semibold transition-colors pr-4 ${open ? 'text-blue-700 font-bold' : 'text-gray-700 group-hover:text-gray-900'}`}>
          {faq.q}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-350 ${open ? 'rotate-180 text-blue-600' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-gray-500 text-sm leading-relaxed pb-5">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="faq" className="py-28 bg-gradient-to-b from-gray-50 to-white">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 ring-1 ring-gray-300 shadow-sm mb-6">
            <span className="text-sm font-medium text-gray-600">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            Questions fréquentes
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur EmployéPro Africa.
          </p>
        </div>

        <div className="bg-white rounded-3xl px-6 border border-gray-100 shadow-sm">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
