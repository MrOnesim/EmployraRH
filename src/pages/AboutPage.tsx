import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  Clock,
  Heart,
  Target,
  ArrowRight,
  MapPin,
  CheckCircle,
  CreditCard,
  Building2,
  BookOpen,
  HeadphonesIcon,
  BarChart3,
  Briefcase,
  DollarSign,
  FileText,
  MessageSquare,
  Gift,
  Monitor,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import PublicNav from '../components/PublicNav';
import FooterSection from '../components/landing/FooterSection';
import CountUp from '../components/ui/CountUp';
import { usePageMeta } from '../hooks/usePageMeta';

// ─── Data ────────────────────────────────────────────────────────────────────

const team = [
  {
    name: 'Amadou Diallo',
    initials: 'AD',
    avatar: 'https://i.pravatar.cc/150?u=amadou@employrarh.com',
    role: 'CEO & Co-fondateur',
    bio: 'Ex-directeur RH chez Orange, expert en transformation RH',
    location: 'Sénégal',
    from: 'from-blue-500',
    to: 'to-indigo-600',
  },
  {
    name: 'Marie Dubois',
    initials: 'MD',
    avatar: 'https://i.pravatar.cc/150?u=marie@employrarh.com',
    role: 'CTO & Co-fondatrice',
    bio: "15 ans d'expérience en SaaS, ex-Tech Lead Microsoft",
    location: 'France',
    from: 'from-purple-500',
    to: 'to-pink-600',
  },
  {
    name: 'Carlos Rodriguez',
    initials: 'CR',
    avatar: 'https://i.pravatar.cc/150?u=carlos@employrarh.com',
    role: 'VP Produit',
    bio: 'Expert UX & Data Science, ex-Meta',
    location: 'Pérou',
    from: 'from-rose-500',
    to: 'to-orange-500',
  },
  {
    name: 'Aisha Mohammed',
    initials: 'AM',
    avatar: 'https://i.pravatar.cc/150?u=aisha@employrarh.com',
    role: "VP d'Ingénierie",
    bio: 'Ex-Google, leader tech spécialiste infrastructure',
    location: 'Nigeria',
    from: 'from-emerald-500',
    to: 'to-teal-600',
  },
  {
    name: 'Jean-Pierre Kamga',
    initials: 'JK',
    avatar: 'https://i.pravatar.cc/150?u=jp@employrarh.com',
    role: 'Directeur Financier',
    bio: 'Expert en fintech et paiements africains',
    location: 'Cameroun',
    from: 'from-amber-500',
    to: 'to-yellow-500',
  },
  {
    name: 'Fatima El Amrani',
    initials: 'FE',
    avatar: 'https://i.pravatar.cc/150?u=fatima@employrarh.com',
    role: 'VP Marketing',
    bio: 'Growth & expansion Afrique, ex-Jumia',
    location: 'Maroc',
    from: 'from-sky-500',
    to: 'to-blue-600',
  },
];

const modules = [
  {
    icon: Users,
    title: 'Gestion RH',
    desc: 'Employés, équipes, organigramme, import CSV',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: DollarSign,
    title: 'Paie multi-pays',
    desc: 'Salaire, fiches de paie, banque, fiscalité',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: Clock,
    title: 'Temps & Présences',
    desc: 'Pointage, congés, calendrier, planning',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: Briefcase,
    title: 'Recrutement',
    desc: 'Offres, candidatures, pipeline de recrutement',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Performance',
    desc: 'Objectifs, évaluations, suivi des compétences',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: FileText,
    title: 'Documents',
    desc: 'Gestion documentaire, signatures, coffre-fort',
    color: 'from-sky-500 to-cyan-600',
  },
  {
    icon: MessageSquare,
    title: 'Communication',
    desc: "Messagerie, réunions, fil d'actualité social",
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: BookOpen,
    title: 'Formation',
    desc: 'Catalogue, quiz, certificats, parcours',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    icon: Gift,
    title: 'Récompenses',
    desc: "Points, badges, catalogue d'avantages",
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Monitor,
    title: 'Matériel',
    desc: 'Inventaire, affectations, maintenance',
    color: 'from-gray-600 to-slate-700',
  },
  {
    icon: Heart,
    title: 'Bien-être',
    desc: 'Sondages anonymes, analyse de climat social',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: Zap,
    title: 'Assistant IA',
    desc: 'NLP, analyses prédictives, recommandations',
    color: 'from-violet-500 to-purple-600',
  },
];

const paymentMethods = [
  {
    name: 'Carte bancaire',
    desc: 'Visa, Mastercard, American Express',
    regions: 'Monde',
    icon: CreditCard,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    name: 'Mobile Money',
    desc: 'Orange Money, MTN, M-Pesa, Airtel, Moov, Wave',
    regions: 'Afrique',
    icon: Globe,
    color: 'from-orange-500 to-amber-600',
  },
  {
    name: 'Virement bancaire',
    desc: 'SEPA, SWIFT, virement local',
    regions: 'Monde',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Flutterwave',
    desc: 'Paiement via Flutterwave (50+ pays africains)',
    regions: 'Afrique',
    icon: TrendingUp,
    color: 'from-rose-500 to-pink-600',
  },
  {
    name: 'PayPal',
    desc: 'Standard et Business',
    regions: 'Monde',
    icon: Shield,
    color: 'from-blue-500 to-sky-600',
  },
  {
    name: 'Bitcoin / USDT',
    desc: 'Crypto et stablecoins via partenaires certifiés',
    regions: 'Monde',
    icon: Lock,
    color: 'from-yellow-500 to-amber-600',
  },
];

const steps = [
  {
    step: 1,
    title: 'Créez votre compte',
    desc: "Inscrivez-vous en 2 minutes. Aucune carte bancaire requise pour l'essai.",
    detail: 'Informations entreprise, politiques RH, cycle de paie.',
  },
  {
    step: 2,
    title: 'Importez vos données',
    desc: 'Importez vos employés via CSV ou manuellement.',
    detail: 'Colonnes auto-détectées, validation temps réel, mapping intelligent.',
  },
  {
    step: 3,
    title: 'Configurez la paie',
    desc: 'Grilles salariales, taux de cotisation, règles de calcul par pays.',
    detail: 'Barème progressif, heures sup, primes, congés payés, avantages en nature.',
  },
  {
    step: 4,
    title: 'Démarrez la gestion RH',
    desc: 'Présences, congés, documents, performances, recrutement.',
    detail: 'Dashboard centralisé, notifications auto, workflow de validation intégré.',
  },
  {
    step: 5,
    title: 'Générez les bulletins',
    desc: 'Fiches de paie conformes à la législation de chaque pays.',
    detail: 'Export PDF, archivage automatique, intégration bancaire.',
  },
  {
    step: 6,
    title: "Pilotez avec l'IA",
    desc: 'Analysez les tendances, anticipez les départs.',
    detail: 'Assistant IA 24/7, alertes intelligentes, rapports personnalisés.',
  },
];

const securityItems = [
  'Chiffrement AES-256 au repos et TLS 1.3 en transit',
  'Authentification multi-facteurs (2FA)',
  'Conforme RGPD, OHADA, CEMAC, UEMOA',
  'Hébergement OVHcloud (Europe) & AWS (Afrique)',
  'Backup quotidien avec PRA garanti',
  'Audit de sécurité trimestriel indépendant',
  'Certification ISO 27001 en cours',
  'Données bancaires tokenisées (PCI-DSS)',
];

const partners = [
  { name: 'Flutterwave', desc: 'Paiements africains', color: 'from-red-500 to-orange-500' },
  { name: 'Orange Finances', desc: 'Mobile Money', color: 'from-orange-500 to-amber-500' },
  { name: 'Sage', desc: 'Comptabilité', color: 'from-green-500 to-emerald-500' },
  { name: 'QuickBooks', desc: 'Synchro comptable', color: 'from-blue-500 to-cyan-500' },
  { name: 'Microsoft 365', desc: 'Productivité', color: 'from-indigo-500 to-blue-500' },
  { name: 'Slack', desc: 'Notifications RH', color: 'from-purple-500 to-pink-500' },
];

// ─── Animation helpers ────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
      <Icon size={13} /> {text}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  usePageMeta({
    title: 'À propos — EmployéPro Africa, la RH réinventée pour le monde',
    description:
      'EmployéPro Africa est une solution RH & paie cloud conçue pour les entreprises de tous les pays : conformité, présence, paie et IA.',
  });
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-36 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
        {/* Animated glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 text-sm font-semibold text-blue-200"
          >
            <Sparkles size={15} className="text-blue-300" /> Notre mission
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
          >
            Simplifier les RH,
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              partout dans le monde
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed"
          >
            EmployraRH est née d'un constat : les entreprises méritent des outils RH performants,
            qu'elles soient à Dakar, Paris, Douala, Abidjan, Lima ou Dubaï.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            <Link
              to="/register-company"
              className="flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-blue-50 active:scale-95 transition-all shadow-xl shadow-blue-900/30"
            >
              Essayer gratuitement <ArrowRight size={17} />
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Voir les tarifs
            </Link>
          </motion.div>
        </div>

        {/* Floating stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="relative max-w-4xl mx-auto px-6 mt-20"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-2xl">
            {[
              { value: 2020, suffix: '', label: 'Année de création' },
              { value: 60, suffix: '+', label: 'Pays supportés' },
              { value: 10000, suffix: '+', label: 'Entreprises clientes' },
              { value: 50, suffix: 'M+', label: 'Salaires / mois' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <p className="text-blue-300 text-xs font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STORY ── */}
      <section className="max-w-4xl mx-auto px-6 py-28">
        <FadeUp className="text-center mb-14">
          <SectionLabel icon={BookOpen} text="Notre histoire" />
          <h2 className="text-4xl font-black text-gray-900 mb-4">De l'idée à la réalité</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Une frustration partagée, une vision commune, et une équipe déterminée à changer la
            donne.
          </p>
        </FadeUp>

        {/* Timeline story */}
        <div className="space-y-10">
          {[
            {
              icon: Target,
              color: 'bg-blue-500',
              year: '2019',
              title: 'Le constat',
              text: 'Les solutions RH disponibles sont soit trop chères pour les PME, soit conçues uniquement pour les pays développés — ignorant le mobile money, les régimes sociaux variés et les réalités des marchés émergents.',
            },
            {
              icon: Zap,
              color: 'bg-indigo-500',
              year: '2020',
              title: 'La fondation',
              text: "Amadou Diallo (ex-Orange) et Marie Dubois (ex-Microsoft) s'associent pour bâtir une plateforme SaaS accessible partout, fonctionnant hors ligne, compatible avec les moyens de paiement locaux.",
            },
            {
              icon: Globe,
              color: 'bg-emerald-500',
              year: "Aujourd'hui",
              title: "L'impact",
              text: "Plus de 10 000 entreprises font confiance à EmployraRH. Nous traitons 50M+ de salaires par mois. Notre équipe de 120+ collaborateurs répartis sur 4 continents continue d'innover.",
            },
          ].map((item, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <div className="flex gap-6 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    <item.icon size={22} className="text-white" />
                  </div>
                  {i < 2 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-200 to-transparent mt-3 h-10" />
                  )}
                </div>
                <div className="pb-8">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1 block">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-black text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <SectionLabel icon={TrendingUp} text="Comment ça marche" />
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Démarrez en moins de 10 minutes
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Notre onboarding guidé vous accompagne à chaque étape du lancement.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 20px 30px -8px rgba(37,99,235,0.10)' }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-blue-200 transition-all relative"
                >
                  <div className="absolute -top-4 -left-1 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/25">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-black text-gray-800 mb-2 mt-3">{s.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">{s.desc}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.detail}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <FadeUp className="text-center mb-16">
          <SectionLabel icon={Award} text="Modules" />
          <h2 className="text-4xl font-black text-gray-900 mb-4">12 modules, une plateforme</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            De l'embauche à la paie, tout ce dont vos équipes RH ont besoin, au même endroit.
          </p>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {modules.map((m, i) => (
            <FadeUp key={i} delay={Math.floor(i / 4) * 0.1 + (i % 4) * 0.06}>
              <motion.div
                whileHover={{ y: -5, boxShadow: '0 16px 24px -6px rgba(0,0,0,0.08)' }}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 transition-all cursor-default"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <m.icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">{m.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── PAYMENTS ── */}
      <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-blue-300 mb-5">
              <CreditCard size={13} /> Moyens de paiement
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Payez comme vous voulez</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Paiements internationaux pour que vous puissiez régler vos équipes depuis n'importe
              quel pays.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paymentMethods.map((pm, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br ${pm.color} flex items-center justify-center shadow-lg`}
                    >
                      <pm.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">{pm.name}</h3>
                      <p className="text-gray-400 text-sm mb-2 leading-relaxed">{pm.desc}</p>
                      <span className="inline-block text-xs font-bold bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full uppercase tracking-wide">
                        {pm.regions}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          <FadeUp className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm bg-white/5 px-5 py-2.5 rounded-full border border-white/10">
              <Shield size={15} className="text-emerald-400" />
              Paiement sécurisé via TLS 1.3 · Nous ne stockons pas vos données bancaires.
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <SectionLabel icon={Lock} text="Sécurité & Conformité" />
            <h2 className="text-4xl font-black text-gray-900 mb-8">
              Vos données en sécurité absolue
            </h2>
            <div className="space-y-3">
              {securityItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="font-black text-gray-800 text-xl mb-6">Disponibilité garantie</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Uptime', value: '99.9%', color: 'text-emerald-600' },
                  { label: 'Support', value: '24/7', color: 'text-blue-600' },
                  { label: 'Latence', value: '<200ms', color: 'text-indigo-600' },
                  { label: 'SLA', value: 'Garanti', color: 'text-purple-600' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.04 }}
                    className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm cursor-default"
                  >
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <p className="text-gray-400 text-xs font-medium mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Infrastructure cloud répartie sur plusieurs datacenters garantissant une
                disponibilité continue, même en cas de panne régionale.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── SUPPORT ── */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50/30 py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-14">
            <SectionLabel icon={HeadphonesIcon} text="Support" />
            <h2 className="text-4xl font-black text-gray-900 mb-4">Nous sommes là pour vous</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Un accompagnement humain à chaque étape, de l'onboarding à la croissance.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: HeadphonesIcon,
                color: 'from-blue-500 to-indigo-600',
                bg: 'bg-blue-50',
                title: 'Support prioritaire',
                desc: 'Réponse sous 24h (gratuit) ou sous 1h (Premium). Chat en direct, email et téléphone.',
              },
              {
                icon: BookOpen,
                color: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-50',
                title: 'Base de connaissances',
                desc: 'Tutoriels vidéo, documentation, FAQ, webinaires hebdomadaires et forum communautaire.',
              },
              {
                icon: Building2,
                color: 'from-purple-500 to-violet-600',
                bg: 'bg-purple-50',
                title: 'Onboarding dédié',
                desc: 'Un Account Manager dédié pour vous accompagner dans la migration et prise en main.',
              },
            ].map((card, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 20px 30px -8px rgba(0,0,0,0.08)' }}
                  className="bg-white rounded-3xl p-7 border border-gray-100 text-center group transition-all"
                >
                  <div
                    className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform`}
                  >
                    <card.icon size={28} className="text-white" />
                  </div>
                  <h3 className="font-black text-gray-800 text-lg mb-3">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <FadeUp className="text-center mb-14">
          <SectionLabel icon={Globe} text="Partenaires" />
          <h2 className="text-4xl font-black text-gray-900 mb-4">Nos partenaires technologiques</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Nous collaborons avec les meilleurs acteurs financiers et technologiques.
          </p>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((p, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -5, scale: 1.04 }}
                className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center group hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-default"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Building2 size={20} className="text-white" />
                </div>
                <p className="font-bold text-gray-800 text-xs">{p.name}</p>
                <p className="text-gray-400 text-[10px] mt-1">{p.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50/20 py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-14">
            <SectionLabel icon={Users} text="L'équipe" />
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Des passionnés du monde entier
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Une équipe multiculturelle unie par une mission commune : démocratiser les RH.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 20px 30px -8px rgba(0,0,0,0.08)' }}
                  className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-blue-200 text-center group transition-all"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.from} ${member.to} flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform overflow-hidden`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium mb-2">
                    <MapPin size={12} /> {member.location}
                  </div>
                  <h3 className="font-black text-gray-800 text-lg mb-1">{member.name}</h3>
                  <p className="text-blue-600 text-sm font-bold mb-3">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-300/10 rounded-full blur-3xl" />
        </div>
        <FadeUp className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2 text-sm font-semibold text-white mb-8">
            <Sparkles size={14} /> Sans engagement · Annulation à tout moment
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Prêt à transformer vos RH ?
          </h2>
          <p className="text-xl text-blue-200 mb-10 leading-relaxed">
            Rejoignez plus de 10 000 entreprises qui font confiance à EmployraRH.
            <br />
            Essayez gratuitement pendant 14 jours, sans carte bancaire.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register-company"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-black px-8 py-4 rounded-2xl hover:bg-blue-50 shadow-2xl shadow-blue-900/30 text-lg transition-colors"
              >
                Essayer gratuitement <ArrowRight size={20} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold px-8 py-4 rounded-2xl border border-white/25 hover:bg-white/25 text-lg transition-colors"
              >
                Voir les tarifs
              </Link>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      <FooterSection />
    </div>
  );
}
