import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  Calendar,
  Briefcase,
  Bot,
  Video,
  FileSignature,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Shield,
  BarChart3,
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Gestion RH', desc: 'Fiches complets, contrats et onboarding.', color: 'from-blue-500 to-blue-600' },
  { icon: DollarSign, title: 'Paie multi-pays', desc: 'Gestion des taxes, devises et virements.', color: 'from-green-500 to-green-600' },
  { icon: Calendar, title: 'Congés & Présences', desc: 'Suivi des absences et pointage QR.', color: 'from-blue-600 to-blue-700' },
  { icon: Briefcase, title: 'Recrutement', desc: 'Suivi des candidats et offres d\'emploi.', color: 'from-orange-500 to-orange-600' },
  { icon: Bot, title: 'Assistant IA', desc: 'Rapports automatisés et aide RH.', color: 'from-indigo-500 to-indigo-600' },
  { icon: Video, title: 'Réunions', desc: 'Planification d\'entretiens vidéo intégrés.', color: 'from-purple-500 to-purple-600' },
  { icon: FileSignature, title: 'Signature', desc: 'Signature légale électronique de documents.', color: 'from-pink-500 to-pink-600' },
  { icon: BookOpen, title: 'Formation', desc: 'Espace d\'apprentissage et quiz RH.', color: 'from-blue-600 to-cyan-500' },
  { icon: TrendingUp, title: 'Performance', desc: 'Évaluations annuelles et objectifs.', color: 'from-sky-500 to-blue-500' },
  { icon: MessageSquare, title: 'Messagerie', desc: 'Canaux d\'équipe et clavardage live.', color: 'from-blue-500 to-indigo-500' },
  { icon: Shield, title: 'Coffre-fort', desc: 'Stockage de documents confidentiels.', color: 'from-emerald-500 to-emerald-600' },
  { icon: BarChart3, title: 'Rapports', desc: 'Visualisations et exports Excel/PDF.', color: 'from-sky-500 to-blue-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm mb-6"
          >
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Modules Tout-en-un</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight"
          >
            Tout ce dont votre entreprise a besoin
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Une suite complète et parfaitement intégrée de 12 modules pour automatiser vos ressources humaines et votre paie.
          </motion.p>
        </div>

        {/* Features grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ 
                y: -6, 
                backgroundColor: 'rgba(255, 255, 255, 1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                borderColor: 'rgba(59, 130, 246, 0.2)'
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-150 transition-all duration-300 flex flex-col items-start text-left cursor-default shadow-sm group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-primary/10`}
              >
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-850 group-hover:text-primary-hover transition-colors leading-tight mb-2">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
