import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { 
  Users, DollarSign, BarChart3, FileText, Smartphone, QrCode, 
  Search, Flag, TrendingUp, Check, Award
} from 'lucide-react';

const slides = [
  { 
    icon: Users, 
    label: 'Gestion des employés', 
    desc: 'Fiches complètes, contrats, organigramme interactif.', 
    color: 'from-blue-500 to-blue-600',
    type: 'employees'
  },
  { 
    icon: DollarSign, 
    label: 'Paie multi-pays', 
    desc: 'FCFA, EUR, USD — conformité locale automatique.', 
    color: 'from-green-500 to-green-600',
    type: 'payroll'
  },
  { 
    icon: BarChart3, 
    label: 'Tableaux de bord', 
    desc: 'KPIs en temps réel, exports PDF et Excel.', 
    color: 'from-purple-500 to-purple-600',
    type: 'dashboards'
  },
  { 
    icon: Smartphone, 
    label: 'Application mobile', 
    desc: 'Pointage, congés, notifications depuis votre téléphone.', 
    color: 'from-orange-500 to-orange-600',
    type: 'mobile'
  },
  { 
    icon: QrCode, 
    label: 'Pointage QR Code', 
    desc: 'Scan sécurisé avec géolocalisation et anti-double-scan.', 
    color: 'from-indigo-500 to-indigo-600',
    type: 'qr'
  },
  { 
    icon: FileText, 
    label: 'Signature électronique', 
    desc: 'Documents RH signés en ligne, valeur légale.', 
    color: 'from-pink-500 to-pink-600',
    type: 'signature'
  },
];

export default function ShowcaseSection() {
  const [current, setCurrent] = useState(0);
  const { ref, isVisible } = useScrollReveal();
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, [autoplay]);

  const s = slides[current];

  // Helper to render customized, high-fidelity mock screens inside the window mockup
  const renderMockScreen = () => {
    switch (s.type) {
      case 'employees':
        return (
          <div className="w-full space-y-3.5 text-left">
            <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5"><Search size={12} className="text-white/40" /> Rechercher...</span>
              <span className="text-[10px] text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">36 Actifs</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Amina Diallo', role: 'Directrice Marketing', dept: 'Marketing', status: 'Actif', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=60' },
                { name: 'Jean-Luc Koffi', role: 'Développeur Principal', dept: 'Tech', status: 'En congé', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60' },
                { name: 'Marie Dubois', role: 'RH Manager', dept: 'Ressources Humaines', status: 'Actif', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60' },
              ].map((emp, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={emp.name} 
                  className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={emp.img} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <div>
                      <div className="text-xs font-bold text-white">{emp.name}</div>
                      <div className="text-[10px] text-white/50">{emp.role}</div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${emp.status === 'Actif' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {emp.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'payroll':
        return (
          <div className="w-full space-y-4 text-left">
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-xs font-bold text-white">Calcul Paie - Juillet 2026</span>
              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1"><Flag size={10} /> Sénégal (Conforme)</span>
            </div>
            
            <div className="space-y-2">
              {[
                { label: 'Salaire de Base', value: '1 200 000 FCFA', highlight: false },
                { label: 'Indemnité de Logement', value: '+ 150 000 FCFA', highlight: false },
                { label: 'Impôt sur le Revenu', value: '- 180 500 FCFA', highlight: true, color: 'text-rose-350' },
                { label: 'Net à Payer (Virement)', value: '1 169 500 FCFA', highlight: true, color: 'text-emerald-400' },
              ].map((line) => (
                <div key={line.label} className="flex justify-between items-center text-xs py-1">
                  <span className="text-white/60 font-medium">{line.label}</span>
                  <span className={`font-mono font-bold ${line.highlight ? line.color : 'text-white'}`}>{line.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check size={11} className="text-white font-black" />
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold leading-snug">
                Déclaration IPRES & CSS validée automatiquement pour ce mois.
              </span>
            </div>
          </div>
        );
      case 'dashboards':
        return (
          <div className="w-full space-y-4 text-left">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/50 font-bold block mb-1">Taux de Rétention</span>
                <span className="text-xl font-black text-white">94.2%</span>
                <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">🚀 +3.5% vs 2025</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/50 font-bold block mb-1">Masse Salariale</span>
                <span className="text-xl font-black text-white">48.2M CFA</span>
                <span className="text-[9px] text-blue-300 font-semibold block mt-0.5">📊 Ajusté à l'inflation</span>
              </div>
            </div>

            {/* Simulated mini line chart */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white flex items-center gap-1.5"><TrendingUp size={11} className="text-purple-400" /> Évolution effectifs</span>
                <span className="text-[9px] text-white/40">Jan - Juil</span>
              </div>
              <svg className="w-full h-16 stroke-purple-400 fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d="M0,25 Q15,15 30,20 T60,5 T90,8 T100,2" strokeWidth="2.5" />
                <path d="M0,25 Q15,15 30,20 T60,5 T90,8 T100,2 L100,30 L0,30 Z" className="fill-purple-500/10 stroke-none" />
              </svg>
            </div>
          </div>
        );
      case 'mobile':
        return (
          <div className="flex flex-col items-center py-2 space-y-4">
            <div className="w-36 bg-slate-950 border border-white/20 rounded-2xl p-3 shadow-inner relative">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                <div className="text-[9px] font-bold text-white/40 uppercase">Aujourd'hui</div>
                <div className="text-xs font-black text-white mt-0.5">Heure : 08:32</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1">✔ Dans la zone</div>
              </div>
              
              <button className="w-full bg-blue-600 text-white font-black text-[10px] py-1.5 rounded-lg mt-3 shadow-md hover:bg-blue-700 transition-colors">
                Pointer Arrivée
              </button>
              
              <div className="flex justify-around items-center text-[8px] text-white/50 border-t border-white/10 pt-2 mt-4">
                <span>Accueil</span>
                <span className="text-white font-bold">Congés</span>
                <span>Mon Profil</span>
              </div>
            </div>
            <span className="text-[10px] text-white/50 text-center font-medium">Interface application mobile employé</span>
          </div>
        );
      case 'qr':
        return (
          <div className="w-full space-y-3.5 text-center flex flex-col items-center">
            <div className="relative w-24 h-24 bg-slate-950 border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
              <QrCode size={48} className="text-blue-400 animate-pulse" />
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }} 
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(56,189,248,1)] z-10" 
              />
            </div>
            
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Pointage Sans Contact</div>
              <p className="text-[10px] text-white/60">Générez un QR code dynamique toutes les 15 secondes pour lutter contre la fraude.</p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
              <span className="text-[9px] text-blue-300 font-black">QR actualisé automatiquement</span>
            </div>
          </div>
        );
      case 'signature':
        return (
          <div className="w-full space-y-4 text-left">
            <div className="border border-white/10 rounded-xl p-3 bg-white/5 space-y-2">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-[10px] font-bold text-white uppercase">Contrat_CDI_Diallo.pdf</span>
                <span className="text-[9px] font-bold text-pink-400 flex items-center gap-1"><Award size={10} /> Certifié</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-3/4 bg-white/10 rounded" />
                <div className="h-2 w-full bg-white/10 rounded" />
                <div className="h-2 w-5/6 bg-white/10 rounded" />
              </div>
            </div>

            <div className="flex items-end justify-between bg-white/5 border border-white/5 p-3 rounded-xl">
              <div>
                <span className="text-[9px] text-white/50 block">Signature de l'employé</span>
                <span className="text-[10px] font-bold text-white mt-0.5 block italic font-serif">Amina Diallo</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-emerald-400 font-bold block">✔ Signé par SMS OTP</span>
                <span className="text-[8px] text-white/30 block">ID: d6f882a...</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
      {/* Background visual detail */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className={`relative max-w-7xl mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 ring-1 ring-blue-200 shadow-sm mb-6">
            <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Découvrez l'application</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            Une plateforme unique, des{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 drop-shadow-sm">
              possibilités infinies
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Découvrez comment EmployePro centralise et simplifie vos opérations au quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Mockup Display (z-index wrapper) */}
          <div className="lg:col-span-6 relative flex justify-center w-full order-last lg:order-first">
            
            <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl p-5 md:p-6 shadow-2xl border border-white/10 overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center justify-between mb-5 border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Aperçu Réel : {s.label}</span>
              </div>

              {/* Dynamic Mock Screen Wrapper with AnimatePresence */}
              <div className="bg-slate-950/60 rounded-2xl p-6 border border-white/5 min-h-[300px] flex items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="w-full flex flex-col items-center justify-center"
                  >
                    {renderMockScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Tiny absolute badge */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 flex items-center gap-3 hidden sm:flex"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <QrCode size={16} className="text-blue-600" />
              </div>
              <span className="text-xs font-extrabold text-slate-700">Pointage instantané</span>
            </motion.div>
          </div>

          {/* Right Column - Navigation Tabs List */}
          <div className="lg:col-span-6 space-y-3.5">
            {slides.map((item, i) => (
              <button
                key={i} 
                onClick={() => {
                  setCurrent(i);
                  setAutoplay(false); // Pause autoplay once the user interacts
                }}
                className={`relative w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-all border outline-none overflow-hidden ${
                  i === current
                    ? 'border-blue-200/60 shadow-lg'
                    : 'bg-white/50 border-slate-150 hover:bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                {/* Sliding active highlight background */}
                {i === current && (
                  <motion.div
                    layoutId="activeShowcaseHighlight"
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  />
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/10`}>
                  <item.icon size={20} className="text-white" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm md:text-base ${i === current ? 'text-blue-800' : 'text-gray-800'}`}>{item.label}</h4>
                  <p className={`text-xs md:text-sm mt-0.5 ${i === current ? 'text-blue-900/60' : 'text-gray-500'}`}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
