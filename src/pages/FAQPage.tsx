import { useState, type ElementType } from 'react';
import { ChevronDown, Globe, Users, DollarSign, Calendar, Bot, Shield, Headphones, BookOpen, Mail, Phone, Search } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import FooterSection from '../components/landing/FooterSection';

interface FAQItem {
  category: string;
  icon: ElementType;
  items: { question: string; answer: string }[];
}

const faqData: FAQItem[] = [
  {
    category: 'Général',
    icon: Globe,
    items: [
      { question: 'Qu\'est-ce que EmployePro ?', answer: 'EmployePro est une plateforme RH globale qui permet aux entreprises de gérer leurs employés, salaires, présences, congés et communication interne depuis une seule interface. Disponible dans 60+ pays avec support multilingue.' },
      { question: 'Quels types d\'entreprises peuvent utiliser EmployePro ?', answer: 'EmployePro convient à tous types d\'entreprises : PME, startups, grandes entreprises, ONG, et organisations de toute taille. Que vous ayez 5 ou 5000 employés, notre plateforme s\'adapte à vos besoins.' },
      { question: 'EmployePro est-il disponible dans mon pays ?', answer: 'Oui ! EmployePro supporte plus de 60 pays incluant la France, les pays africains francophones et anglophones, l\'Amérique latine, le Moyen-Orient, l\'Asie et l\'Europe. Chaque pays a ses indicateurs téléphoniques et formats adaptés.' },
      { question: 'Est-ce que EmployePro est gratuit ?', answer: 'Nous offrons un plan gratuit pour les entreprises de moins de 10 employés. Pour les équipes plus grandes, nous avons des plans Premium et Entreprise avec toutes les fonctionnalités avancées.' },
    ]
  },
  {
    category: 'Gestion des Employés',
    icon: Users,
    items: [
      { question: 'Comment ajouter des employés sur la plateforme ?', answer: 'Vous pouvez ajouter des employés de deux façons : 1) En les invitant par email depuis votre tableau de bord, 2) En ajoutant manuellement leurs profils. Chaque employé reçoit un email d\'invitation avec un lien sécurisé pour créer son compte.' },
      { question: 'Puis-je modifier les informations d\'un employé ?', answer: 'Oui, les administrateurs peuvent modifier toutes les informations des employés : poste, département, salaire, coordonnées, etc. Les employés peuvent aussi mettre à jour leurs propres informations de profil.' },
      { question: 'Comment fonctionne le système de départements ?', answer: 'Vous pouvez créer et organiser vos employés par départements personnalisés. Chaque département peut avoir ses propres statistiques, salaires moyens et taux de présence. Les départements par défaut incluent : RH, Finance, IT, Marketing, etc.' },
    ]
  },
  {
    category: 'Salaires & Paie',
    icon: DollarSign,
    items: [
      { question: 'Comment fonctionne le calcul des salaires ?', answer: 'EmployePro calcule automatiquement les salaires en tenant compte du salaire de base, des primes, des bonus et des déductions (CNSS, IR, etc.). Vous pouvez personnaliser les règles de calcul selon les réglementations locales de chaque pays.' },
      { question: 'Puis-je générer des bulletins de paie ?', answer: 'Oui ! Les bulletins de paie sont générés automatiquement chaque mois. Vous pouvez les télécharger en PDF, les imprimer ou les envoyer par email aux employés. Les bulletins incluent toutes les informations légales requises.' },
      { question: 'EmployePro supporte-t-il plusieurs devises ?', answer: 'Absolument ! EmployePro supporte toutes les devises majeures : FCFA (XOF, XAF), EUR, USD, MAD, GBP, JPY, CNY, et bien d\'autres. Vous pouvez configurer la devise selon le pays de votre entreprise.' },
      { question: 'Comment fonctionnent les paiements des salaires ?', answer: 'Vous pouvez traiter les paiements directement depuis la plateforme. EmployePro est compatible avec les systèmes de paiement locaux (Mobile Money, virements bancaires, etc.) et les solutions internationales comme Flutterwave et Paystack.' },
    ]
  },
  {
    category: 'Présences & Congés',
    icon: Calendar,
    items: [
      { question: 'Comment les employés pointent-ils leurs heures ?', answer: 'Les employés peuvent pointer leur arrivée, pause, et départ directement depuis leur tableau de bord. Le système calcule automatiquement le temps de travail, les retards, les absences et les heures supplémentaires.' },
      { question: 'Comment fonctionne la gestion des congés ?', answer: 'Les employés peuvent soumettre des demandes de congé (annuel, maladie, maternité, spécial). Les administrateurs reçoivent une notification et peuvent approuver ou refuser les demandes. Un calendrier visuel montre toutes les absences.' },
      { question: 'Quels types de congés sont supportés ?', answer: 'EmployePro supporte les congés annuels, maladie, maternité/paternité, mariage, décès, permission spéciale, et des types personnalisés que vous pouvez configurer selon les lois locales.' },
    ]
  },
  {
    category: 'Intelligence Artificielle',
    icon: Bot,
    items: [
      { question: 'Que peut faire l\'assistant IA ?', answer: 'Notre assistant IA peut analyser vos données RH, détecter des anomalies, faire des recommandations, répondre à des questions sur les employés, salaires, présences, et congés. Il fournit aussi des insights stratégiques pour améliorer la productivité.' },
      { question: 'Comment poser des questions à l\'IA ?', answer: 'Rendez-vous dans la section "Assistant IA" de votre tableau de bord. Tapez votre question en langage naturel, par exemple : "Qui est absent aujourd\'hui ?", "Analyse la masse salariale", ou "Détection d\'anomalies".' },
      { question: 'L\'IA est-elle sûre pour mes données ?', answer: 'Oui, l\'IA fonctionne uniquement avec vos données internes. Aucune donnée n\'est partagée avec des tiers. Toutes les communications sont chiffrées de bout en bout.' },
    ]
  },
  {
    category: 'Sécurité & Confidentialité',
    icon: Shield,
    items: [
      { question: 'Mes données sont-elles sécurisées ?', answer: 'Absolument. EmployePro utilise le chiffrement SSL/TLS, l\'authentification JWT, et propose l\'authentification à deux facteurs (2FA). Les données sont stockées sur des serveurs sécurisés avec des sauvegardes automatiques quotidiennes.' },
      { question: 'Qui peut accéder à mes données ?', answer: 'Seuls les membres de votre entreprise ont accès à vos données. Les administrateurs voient toutes les informations, tandis que les employés ne voient que leurs propres données et les informations générales de l\'entreprise.' },
      { question: 'EmployePro est-il conforme au RGPD ?', answer: 'Oui, EmployePro est conforme au RGPD et aux réglementations de protection des données des pays supportés. Vous pouvez demander la suppression de vos données à tout moment.' },
    ]
  },
  {
    category: 'Support & Assistance',
    icon: Headphones,
    items: [
      { question: 'Comment obtenir de l\'aide ?', answer: 'Vous pouvez nous contacter par email à support@employepro.com, par téléphone, ou via le chat en direct sur notre site. Notre équipe est disponible 24/7 dans plusieurs langues.' },
      { question: 'Y a-t-il une formation disponible ?', answer: 'Oui ! Nous offrons des guides en ligne, des tutoriels vidéo, et des sessions de formation personnalisées pour les entreprises. Chaque nouvelle fonctionnalité inclut une documentation détaillée.' },
      { question: 'Comment passer à un plan supérieur ?', answer: 'Vous pouvez changer de plan à tout moment depuis les Paramètres > Abonnement. La mise à niveau est instantanée et le prix est prorata pour le reste de la période de facturation.' },
    ]
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFAQ = faqData.filter(cat => {
    const matchesSearch = searchQuery === '' || 
      cat.items.some(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory = activeCategory === 'all' || cat.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalQuestions = faqData.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      <PublicNav />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <BookOpen size={16} className="mr-1" />
            <span className="text-sm font-medium text-white">{totalQuestions} questions répondues</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Questions Fréquentes
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur EmployePro. Ne trouvez pas votre réponse ? Contactez-nous !
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Toutes ({totalQuestions})
          </button>
          {faqData.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <cat.icon size={16} className="inline mr-1" /> {cat.category} ({cat.items.length})
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-8">
          {filteredFAQ.map(cat => (
            <div key={cat.category}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <cat.icon size={24} className="text-blue-600" />
                {cat.category}
              </h2>
              <div className="space-y-3">
                {cat.items.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  const isOpen = openItems[key];
                  return (
                    <div
                      key={key}
                      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                        isOpen ? 'border-blue-200 shadow-lg shadow-blue-100' : 'border-gray-100 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <span className="font-semibold text-gray-800 pr-4">{item.question}</span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-blue-500' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredFAQ.length === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500 mb-6">Essayez une autre recherche ou contactez notre équipe.</p>
            <a
              href="mailto:support@employepro.com"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-blue-100 mb-6">Notre équipe est disponible 24/7 pour vous aider.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:support@employepro.com" className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 active:scale-95 transition-all">
              <Mail size={18} className="mr-2" /> support@employepro.com
            </a>
            <a href="tel:+33123456789" className="inline-flex items-center bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 active:scale-95 transition-all border border-white/20">
              <Phone size={18} className="mr-2" /> +33 1 23 45 67 89
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse-bg {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
      <FooterSection />
    </div>
  );
}
