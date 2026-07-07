import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Globe, Users, Shield, Star, QrCode, 
  CheckCircle2, Clock, Activity, Sliders, Sparkles, TrendingUp
} from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

const stats = [
  { value: 50, label: 'Employés gérés', icon: Users, suffix: 'K+' },
  { value: 16, label: 'Pays supportés', icon: Globe, suffix: '+' },
  { value: 99, label: 'Disponibilité', icon: Shield, suffix: '.9%' },
  { value: 49, label: 'Satisfaction', icon: Star, suffix: '/5', prefix: '4.' },
];

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const { count, ref } = useCountUp(stat.value, 2000);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.5 + index * 0.1 }}
      whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)' }}
      className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-5 border border-white/10 transition-all text-center shadow-lg hover:shadow-xl cursor-default"
    >
      <div className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-1.5 flex justify-center items-baseline gap-0.5">
        <span>{stat.prefix ?? ''}</span>
        <span>{count}</span>
        <span className="text-lg font-bold text-blue-300">{stat.suffix}</span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <stat.icon size={14} className="text-blue-300 shrink-0 animate-pulse" />
        <span className="text-xs md:text-sm font-semibold text-white/80 leading-tight">
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
}

// Custom animated counter component for interactive slider values
function AnimatedValue({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const range = end - start;
    const duration = 400; // ms
    let startTime: number | null = null;

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease out quad
      const ease = progress * (2 - progress);
      setDisplayValue(Math.floor(start + range * ease));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'payroll' | 'qr'>('overview');
  
  // 3D Tilt state
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  // Interactive states for calculator
  const [baseSalary, setBaseSalary] = useState(2800);
  const taxRate = 0.12;
  const socialRate = 0.22;
  const taxAmount = Math.round(baseSalary * taxRate);
  const socialAmount = Math.round(baseSalary * socialRate);
  const netSalary = baseSalary - taxAmount - socialAmount;

  // Interactive states for QR Scan simulation
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scanDirection, setScanDirection] = useState<'In' | 'Out'>('In');
  const [scanLogs, setScanLogs] = useState([
    { id: 1, name: 'Amina Diallo', time: '08:14', type: 'Entrée' },
    { id: 2, name: 'Jean-Luc Koffi', time: '08:26', type: 'Entrée' },
  ]);

  useEffect(() => {
    const handle = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = containerRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Rotate max 8 degrees
    const rX = -(mouseY / (height / 2)) * 8;
    const rY = (mouseX / (width / 2)) * 8;
    
    setTilt({ rotateX: rX, rotateY: rY, scale: 1.02 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  const triggerQRScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStatus('scanning');

    setTimeout(() => {
      setIsScanning(false);
      setScanStatus('success');
      const now = new Date();
      const formatTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const newLog = {
        id: Date.now(),
        name: 'Vous (Mock Agent)',
        time: formatTime,
        type: scanDirection === 'In' ? 'Entrée' : 'Sortie'
      };

      setScanLogs(prev => [newLog, ...prev.slice(0, 2)]);
      
      // Swap next scan mode
      setScanDirection(prev => prev === 'In' ? 'Out' : 'In');

      // Reset success status back to idle after 2.5s
      setTimeout(() => {
        setScanStatus('idle');
      }, 2500);
    }, 1200);
  };

  // Entrance variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const;

  const textFadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  } as const;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden py-16 lg:py-24"
    >
      {/* Dynamic colorful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-900 z-0" />
      
      {/* Ambient glowing blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse duration-5000 z-0" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-purple-500/25 rounded-full blur-[120px] animate-pulse duration-7000 z-0" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-400/20 rounded-full blur-[90px] z-0" />

      {/* Interactive moving grid pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M60 0L0 60M0 0l60 60' stroke='white' stroke-width='0.75'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          transform: `translateY(${scrollY * -0.12}px)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left column — Headline & Content */}
          <motion.div 
            className="lg:col-span-6 pt-12 lg:pt-0"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={textFadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-md hover:bg-white/15 transition-all"
            >
              <Sparkles size={14} className="text-yellow-300 animate-spin duration-3000" />
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Plateforme RH & Paie Nouvelle Génération
              </span>
            </motion.div>

            <motion.h1 
              variants={textFadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight"
            >
              Gérez vos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 drop-shadow-md">
                RH
              </span>{' '}
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                sans limites
              </span>
            </motion.h1>

            <motion.p 
              variants={textFadeUp}
              className="text-lg md:text-xl text-blue-100/90 leading-relaxed mb-8 max-w-xl"
            >
              La solution paie et RH tout-en-un conçue pour les entreprises d'Afrique et d'ailleurs. 
              Automatisez vos processus de bout en bout : paie multi-pays, IA, signatures en ligne et pointage QR.
            </motion.p>

            {/* Call to actions */}
            <motion.div 
              variants={textFadeUp}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link
                to="/register-company"
                className="group relative inline-flex items-center gap-2.5 bg-white text-blue-700 hover:text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl overflow-hidden active:scale-95 duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 w-0 group-hover:w-full transition-all duration-300 ease-out z-0" />
                <span className="relative z-10 flex items-center gap-2">
                  Essai gratuit
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              </Link>
              
              <button 
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 backdrop-blur-md transition-all active:scale-95 duration-300 hover:border-white/40 shadow-lg"
              >
                <Play size={20} className="fill-white" />
                Voir la démo
              </button>
            </motion.div>

            {/* Stats section grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {stats.map((stat, i) => (
                <StatCard key={stat.label} stat={stat} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Right column — Interactive Dashboard Card */}
          <div 
            className="lg:col-span-6 w-full relative flex justify-center items-center py-6"
            style={{ perspective: 1200 }}
          >
            {/* Ambient light beam behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-30 blur-2xl z-0 pointer-events-none animate-pulse" />

            <motion.div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ 
                rotateX: tilt.rotateX, 
                rotateY: tilt.rotateY, 
                scale: tilt.scale 
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative w-full max-w-[540px] bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden z-10"
            >
              {/* Top window styling */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80 shadow-md shadow-rose-500/20" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-md shadow-amber-500/20" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/20" />
                </div>
                
                {/* Embedded Glass Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                  >
                    Tableau
                  </button>
                  <button 
                    onClick={() => setActiveTab('payroll')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'payroll' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                  >
                    Paie Live
                  </button>
                  <button 
                    onClick={() => setActiveTab('qr')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'qr' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                  >
                    Pointage
                  </button>
                </div>
              </div>

              {/* Dynamic Tab Contents */}
              <div className="min-h-[290px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {/* TAB 1: OVERVIEW DASHBOARD */}
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      {/* Mini KPIs */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Présences', value: '96.4%', trend: '+1.2%', color: 'text-emerald-400' },
                          { label: 'Masse Sal.', value: '185K €', trend: '-2.4%', color: 'text-blue-300' },
                          { label: 'Nouveaux', value: '+14', trend: 'Ce mois', color: 'text-amber-400' },
                        ].map((kpi, idx) => (
                          <motion.div 
                            key={kpi.label} 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            className="bg-white/5 rounded-xl p-3 border border-white/5 text-center cursor-default transition-all shadow-inner"
                          >
                            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block mb-0.5">{kpi.label}</span>
                            <span className="text-base md:text-lg font-black text-white block">{kpi.value}</span>
                            <span className={`text-[10px] font-semibold ${kpi.color}`}>{kpi.trend}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Interactive Graph (Pure CSS SVG animated bars) */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5">
                            <Activity size={14} className="text-blue-400 animate-pulse" />
                            <span className="text-xs font-bold text-white">Activité Pointages</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            +12.4% ce jour
                          </span>
                        </div>

                        <div className="flex items-end gap-3 h-28 px-1 pt-4">
                          {[65, 85, 45, 90, 75, 95, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-[calc(100%+6px)] bg-slate-950/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-lg">
                                {h}%
                              </div>
                              {/* Animated Bar */}
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ type: 'spring', stiffness: 80, delay: i * 0.05 }}
                                className="w-full bg-gradient-to-t from-blue-600 via-blue-400 to-cyan-300 rounded-t-lg opacity-80 group-hover:opacity-100 group-hover:brightness-110 transition-all cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.2)]" 
                              />
                              <span className="text-[10px] font-semibold text-white/40 group-hover:text-white transition-colors">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: INTERACTIVE PAYROLL CALCULATOR */}
                  {activeTab === 'payroll' && (
                    <motion.div
                      key="payroll"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sliders size={14} className="text-yellow-300" />
                            Ajuster le Salaire Brut
                          </span>
                          <span className="text-base font-black text-white px-3 py-1 bg-white/10 rounded-xl border border-white/10 shadow-inner">
                            <AnimatedValue value={baseSalary} suffix=" €" />
                          </span>
                        </div>

                        {/* Slider control */}
                        <div className="relative pt-2">
                          <input 
                            type="range" 
                            min="1000" 
                            max="8000" 
                            step="100"
                            value={baseSalary} 
                            onChange={(e) => setBaseSalary(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                          <div className="flex justify-between text-[10px] text-white/40 font-semibold mt-1">
                            <span>1 000 €</span>
                            <span>4 500 €</span>
                            <span>8 000 €</span>
                          </div>
                        </div>
                      </div>

                      {/* Calculations breakdown list */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-white/50 block mb-0.5">Salaire Net</span>
                          <span className="text-sm md:text-base font-black text-emerald-400 block leading-tight">
                            <AnimatedValue value={netSalary} suffix=" €" />
                          </span>
                          <span className="text-[9px] text-emerald-400/80 font-bold block mt-0.5">~{(100 - (taxRate * 100 + socialRate * 100))}% (Net)</span>
                        </div>

                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-white/50 block mb-0.5">Impôts (12%)</span>
                          <span className="text-sm md:text-base font-black text-rose-300 block leading-tight">
                            <AnimatedValue value={taxAmount} suffix=" €" />
                          </span>
                          <span className="text-[9px] text-rose-300/80 font-bold block mt-0.5">Prélèvement</span>
                        </div>

                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-white/50 block mb-0.5">Charges (22%)</span>
                          <span className="text-sm md:text-base font-black text-blue-300 block leading-tight">
                            <AnimatedValue value={socialAmount} suffix=" €" />
                          </span>
                          <span className="text-[9px] text-blue-300/80 font-bold block mt-0.5">Cotisations</span>
                        </div>
                      </div>

                      {/* Breakdown visual progress bar */}
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner">
                          <motion.div 
                            animate={{ width: `${100 - (taxRate*100 + socialRate*100)}%` }} 
                            transition={{ type: 'spring' }} 
                            className="h-full bg-emerald-400" 
                          />
                          <motion.div 
                            animate={{ width: `${taxRate * 100}%` }} 
                            transition={{ type: 'spring' }} 
                            className="h-full bg-rose-400" 
                          />
                          <motion.div 
                            animate={{ width: `${socialRate * 100}%` }} 
                            transition={{ type: 'spring' }} 
                            className="h-full bg-blue-500" 
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-white/60 font-semibold mt-2.5">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Net</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />Impôt</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Charges</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: QR ATTENDANCE SIMULATION */}
                  {activeTab === 'qr' && (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Interactive Scanner Mock */}
                        <div className="col-span-5 relative flex justify-center">
                          <div className="relative w-28 h-28 md:w-32 md:h-32 bg-slate-950 border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group">
                            
                            {/* Scanning green line overlay */}
                            {scanStatus === 'scanning' && (
                              <motion.div 
                                initial={{ top: '0%' }}
                                animate={{ top: '100%' }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] z-10"
                              />
                            )}

                            {/* QR icon */}
                            <QrCode size={64} className={`text-white transition-all duration-300 ${scanStatus === 'scanning' ? 'opacity-40 scale-90' : scanStatus === 'success' ? 'text-emerald-400 scale-105' : 'opacity-80 group-hover:scale-105'}`} />

                            {/* Success Overlay Check */}
                            {scanStatus === 'success' && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1.1 }}
                                className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-1"
                              >
                                <CheckCircle2 size={32} className="text-emerald-400 animate-bounce" />
                                <span className="text-[10px] font-black text-emerald-400 mt-1 uppercase tracking-wide">Validé !</span>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Scanner Actions and Controls */}
                        <div className="col-span-7 space-y-3">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Clock size={13} className="text-blue-400" />
                            <span>Scan de Badge QR</span>
                          </div>
                          
                          <p className="text-[11px] text-white/60 leading-normal">
                            Touchez le bouton pour simuler un scan de badge d'employé via notre borne de pointage.
                          </p>

                          <button 
                            onClick={triggerQRScan}
                            disabled={isScanning}
                            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                              scanStatus === 'scanning' 
                                ? 'bg-blue-600/50 text-white cursor-not-allowed'
                                : scanStatus === 'success'
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                            }`}
                          >
                            {isScanning ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Scan en cours...
                              </>
                            ) : scanStatus === 'success' ? (
                              'Enregistré'
                            ) : (
                              `Simuler Pointage (${scanDirection === 'In' ? 'Arrivée' : 'Départ'})`
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mini Live pointage logs list */}
                      <div className="bg-slate-950/40 rounded-2xl p-3 border border-white/5 space-y-2">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Flux des pointages live</div>
                        <div className="space-y-1.5 max-h-[85px] overflow-hidden">
                          <AnimatePresence initial={false}>
                            {scanLogs.map((log) => (
                              <motion.div 
                                key={log.id} 
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/5 border border-white/5"
                              >
                                <span className="font-bold text-white">{log.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${log.type === 'Entrée' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    {log.type}
                                  </span>
                                  <span className="text-white/50 text-[10px] font-mono">{log.time}</span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Secure bottom tag with animation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-1 text-white/50">
                    <Shield size={14} className="text-emerald-400 shrink-0" />
                    <span>Données cryptées AES-256</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <TrendingUp size={14} className="text-blue-400" />
                    <span>RH Connectée</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Absolute floating decorations on right column */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -bottom-3 -right-3 bg-white rounded-2xl px-4 py-3 shadow-2xl z-20 flex items-center gap-3 border border-slate-100 hidden sm:flex"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Shield size={18} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-slate-800 font-extrabold text-sm">RGPD 100%</div>
                <div className="text-slate-400 text-[10px]">Hébergement sécurisé</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 rounded-2xl px-4 py-2.5 shadow-2xl z-20 flex items-center gap-2 hidden sm:flex border border-white/20"
            >
              <Star size={15} className="text-white fill-white animate-spin duration-5000" />
              <span className="text-white font-black text-sm tracking-tight">4.9/5 satisfaction</span>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
