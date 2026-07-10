import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Clock, Play, Pause, Square, Calendar, FileText,
  DollarSign, TrendingUp, QrCode, Download, ChevronRight,
  Sun, Coffee, Sunset
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageLoading } from '../hooks/usePageLoading';
import { useToast } from '../context/ToastContext';
import { LoadingScreen } from '../components/ui';

// ─── helpers ────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

const formatTime = (date: Date | null | undefined) => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Bonjour', icon: Sun };
  if (h < 18) return { text: 'Bon après-midi', icon: Coffee };
  return { text: 'Bonsoir', icon: Sunset };
};

// ─── Card variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 110, damping: 16 } },
};

const getWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

export default function EmployeeDashboard() {
  const { currentUser, attendance, leaves, payslips, clockIn, startBreak, endBreak, clockOut } = useApp();
  const navigate = useNavigate();
  const loading = usePageLoading();
  const { addToast } = useToast();

  // Clock state
  const [isWorking, setIsWorking] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds since check-in
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live wall clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayAttendance = attendance.find(a => {
    const today = new Date();
    return a.employeeId === currentUser?.id &&
      new Date(a.date).toDateString() === today.toDateString();
  });

  // Start/stop elapsed timer
  useEffect(() => {
    if (todayAttendance?.checkIn && isWorking && !isOnBreak && !todayAttendance.checkOut) {
      const base = new Date(todayAttendance.checkIn).getTime();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - base) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [todayAttendance, isWorking, isOnBreak]);

  const myLeaves = leaves.filter(l => l.employeeId === currentUser?.id);
  const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;
  const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length;
  const myPayslips = payslips.filter(p => p.employeeId === currentUser?.id);

  const handleClockIn = () => { try { clockIn(); setIsWorking(true); } catch { addToast("Erreur lors du pointage d'arrivée", 'error'); } };
  const handleStartBreak = () => { try { startBreak(); setIsOnBreak(true); } catch { addToast("Erreur lors du début de pause", 'error'); } };
  const handleEndBreak = () => { try { endBreak(); setIsOnBreak(false); } catch { addToast("Erreur lors de la fin de pause", 'error'); } };
  const handleClockOut = () => { try { clockOut(); setIsWorking(false); } catch { addToast("Erreur lors du pointage de départ", 'error'); } };

  const elapsedH = Math.floor(elapsed / 3600);
  const elapsedM = Math.floor((elapsed % 3600) / 60);
  const elapsedS = elapsed % 60;

  const workProgress = Math.min(100, (elapsed / (8 * 3600)) * 100);

  const { text: greetText, icon: GreetIcon } = greeting();

  const stats = [
    {
      label: "Heures aujourd'hui",
      value: todayAttendance?.totalHours ? `${todayAttendance.totalHours}h` : `${elapsedH}h${pad(elapsedM)}`,
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: 'Heures sup.',
      value: todayAttendance?.overtime ? `${todayAttendance.overtime}h` : '0h',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Congés restants',
      value: `${20 - approvedLeaves}j`,
      icon: Calendar,
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/20',
    },
    {
      label: 'Dernière paie',
      value: currentUser?.salary ? `${(currentUser.salary / 1000).toFixed(0)}K` : '0',
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20',
    },
  ];

  const leaveStatusColor = (status: string) => {
    if (status === 'approved') return { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: 'Approuvé' };
    if (status === 'rejected') return { bar: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', label: 'Refusé' };
    return { bar: 'bg-amber-400', badge: 'bg-amber-400/10 text-amber-600', label: 'En attente' };
  };

  const weekData = getWeekDates().map((date, i) => {
    const dayAttendance = attendance.filter(a =>
      a.employeeId === currentUser?.id &&
      new Date(a.date).toDateString() === date.toDateString()
    );
    const hours = dayAttendance.reduce((sum, a) => sum + a.totalHours, 0);
    return {
      day: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][i],
      hours,
      target: i >= 1 && i <= 5 ? 8 : 0,
    };
  });

  const maxBarHours = Math.max(...weekData.map(d => d.hours), 1);

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-700/20"
      >
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-4 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GreetIcon size={18} className="text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">{greetText}</span>
            </div>
            <h1 className="text-2xl font-extrabold">{currentUser?.firstName} {currentUser?.lastName} 👋</h1>
            <p className="text-blue-200 text-sm mt-1 capitalize">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {/* Live wall clock */}
          <div className="text-right">
            <p className="text-4xl font-black tabular-nums tracking-tight">
              {pad(now.getHours())}:{pad(now.getMinutes())}
              <span className="text-blue-300 text-3xl">:{pad(now.getSeconds())}</span>
            </p>
            <p className="text-blue-300 text-xs font-medium mt-0.5">{currentUser?.position} · {currentUser?.department}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{ y: -4, boxShadow: '0 12px 20px -4px rgba(0,0,0,0.08)' }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-all cursor-default"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-1.5">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-xl shadow-lg ${stat.shadow}`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Time Clock Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Progress bar at top */}
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <motion.div
            className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${workProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Time stamps */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${isOnBreak ? 'bg-amber-400 animate-pulse' : isWorking && todayAttendance?.checkIn ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                  {isOnBreak ? 'En pause' : isWorking && todayAttendance?.checkIn ? 'En travail' : 'Non pointé'}
                </h2>
                {todayAttendance?.checkIn && !todayAttendance.checkOut && (
                  <span className="ml-auto font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                    {pad(elapsedH)}:{pad(elapsedM)}:{pad(elapsedS)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Arrivée', value: formatTime(todayAttendance?.checkIn), color: 'border-blue-200 dark:border-blue-800' },
                  { label: 'Début pause', value: formatTime(todayAttendance?.breakStart), color: 'border-amber-200 dark:border-amber-800' },
                  { label: 'Fin pause', value: formatTime(todayAttendance?.breakEnd), color: 'border-amber-200 dark:border-amber-800' },
                  { label: 'Départ', value: formatTime(todayAttendance?.checkOut), color: 'border-rose-200 dark:border-rose-800' },
                ].map((ts, i) => (
                  <div key={i} className={`text-center p-3 rounded-xl border-2 ${ts.color} bg-gray-50/50 dark:bg-gray-900/30`}>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">{ts.label}</p>
                    <p className="font-mono text-base font-bold text-gray-800 dark:text-gray-100">{ts.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5 lg:flex-col justify-center lg:justify-start lg:min-w-[180px]">
              <button
                onClick={() => navigate('/scan')}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all shadow-md shadow-indigo-500/20 w-full"
              >
                <QrCode size={17} /> Scanner QR
              </button>
              {!todayAttendance && (
                <button
                  onClick={handleClockIn}
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all shadow-md shadow-emerald-500/20 w-full"
                >
                  <Play size={17} /> Pointer l'arrivée
                </button>
              )}
              {todayAttendance && !isOnBreak && isWorking && !todayAttendance.checkOut && (
                <button
                  onClick={handleStartBreak}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all shadow-md shadow-amber-500/20 w-full"
                >
                  <Pause size={17} /> Pause
                </button>
              )}
              {isOnBreak && (
                <button
                  onClick={handleEndBreak}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all shadow-md shadow-blue-500/20 w-full"
                >
                  <Play size={17} /> Reprendre
                </button>
              )}
              {isWorking && !isOnBreak && todayAttendance?.checkIn && !todayAttendance.checkOut && (
                <button
                  onClick={handleClockOut}
                  className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all shadow-md shadow-rose-500/20 w-full"
                >
                  <Square size={17} /> Pointer le départ
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Middle row : Weekly chart + Leaves ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly hours bar chart (custom SVG-free bars) */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-5 uppercase tracking-wide">Heures — cette semaine</h3>
          <div className="flex items-end gap-2 h-36">
            {weekData.map((d, i) => {
              const pct = d.hours / maxBarHours;
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-bold ${d.hours > 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                    {d.hours > 0 ? `${d.hours}h` : ''}
                  </span>
                  <div className="w-full flex flex-col justify-end" style={{ height: 96 }}>
                    <motion.div
                      className={`w-full rounded-lg ${isToday ? 'bg-blue-500' : d.hours >= d.target && d.target > 0 ? 'bg-emerald-400' : d.hours > 0 ? 'bg-blue-200 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
                      initial={{ scaleY: 0, originY: 1 }}
                      animate={{ scaleY: pct }}
                      transition={{ delay: 0.1 * i, duration: 0.5, ease: 'easeOut' }}
                      style={{ height: '100%', transformOrigin: 'bottom' }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Aujourd'hui</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Objectif atteint</span>
            </div>
          </div>
        </motion.div>

        {/* Leave requests with status bars */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide">Mes congés</h3>
            <button
              onClick={() => navigate('/employee/leaves')}
              className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Demander <ChevronRight size={13} />
            </button>
          </div>

          {/* Quota bar */}
          <div className="mb-5 p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
              <span>Quota annuel</span>
              <span>{approvedLeaves}/20 jours utilisés</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${(approvedLeaves / 20) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Recent leave requests */}
          <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
            <AnimatePresence>
              {myLeaves.slice(-4).reverse().map((leave, i) => {
                const { bar, badge, label } = leaveStatusColor(leave.status);
                const total = (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 86400000 + 1;
                return (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          {leave.type === 'annual' ? 'Congé annuel' : leave.type === 'sick' ? 'Maladie' : leave.type === 'maternity' ? 'Maternité' : 'Spécial'}
                        </span>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                          {new Date(leave.startDate).toLocaleDateString('fr-FR')} → {new Date(leave.endDate).toLocaleDateString('fr-FR')} · {total}j
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${badge}`}>{label}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-1.5 rounded-full ${bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: leave.status === 'approved' ? '100%' : leave.status === 'pending' ? '50%' : '15%' }}
                        transition={{ duration: 0.6, delay: 0.1 * i }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {myLeaves.length === 0 && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">Aucune demande de congé</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom row : History + Payslips ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent attendance history */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide mb-4">Mon historique récent</h3>
          <div className="space-y-2.5">
            {attendance
              .filter(a => a.employeeId === currentUser?.id)
              .slice(-5).reverse()
              .map((record, i) => {
                const statusMap: Record<string, { dot: string; label: string; bg: string }> = {
                  present:  { dot: 'bg-emerald-500', label: 'Présent',  bg: 'bg-emerald-500/8' },
                  late:     { dot: 'bg-amber-400',   label: 'Retard',   bg: 'bg-amber-400/8' },
                  absent:   { dot: 'bg-rose-500',    label: 'Absent',   bg: 'bg-rose-500/8' },
                  remote:   { dot: 'bg-blue-400',    label: 'Télétravail', bg: 'bg-blue-400/8' },
                };
                const s = statusMap[record.status] ?? { dot: 'bg-gray-400', label: record.status, bg: 'bg-gray-50' };
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i }}
                    className={`flex items-center justify-between p-3 rounded-xl ${s.bg} dark:bg-gray-900/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                      <div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          {new Date(record.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                          {formatTime(record.checkIn)} – {formatTime(record.checkOut)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-800 dark:text-gray-100">{record.totalHours}h</span>
                      {record.overtime > 0 && (
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+{record.overtime}h sup</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            {attendance.filter(a => a.employeeId === currentUser?.id).length === 0 && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">Aucun historique de pointage</p>
            )}
          </div>
        </motion.div>

        {/* Payslip timeline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide">Mes bulletins de paie</h3>
            {myPayslips.length > 0 && (
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                {myPayslips.length} disponible{myPayslips.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {myPayslips.length > 0 ? (
            <div className="space-y-3">
              {myPayslips.slice(-5).reverse().map((slip, i) => {
                const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
                return (
                  <motion.div
                    key={slip.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 * i }}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {months[slip.month - 1]} {slip.year}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          Net: {slip.netSalary.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 opacity-60 group-hover:opacity-100 transition-all">
                      <Download size={14} /> Télécharger
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3">
                <FileText size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Aucun bulletin disponible</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Vos bulletins de paie apparaîtront ici</p>
            </div>
          )}

          {/* Current salary info */}
          {currentUser?.salary && (
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Salaire brut mensuel</p>
                <p className="text-lg font-black text-gray-800 dark:text-gray-100 mt-0.5">
                  {currentUser.salary.toLocaleString('fr-FR')} <span className="text-xs font-bold text-gray-400 dark:text-gray-500">FCFA</span>
                </p>
              </div>
              <div className="bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wide">Net ~{(currentUser.salary * 0.85).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Pending actions banner ── */}
      <AnimatePresence>
        {pendingLeaves > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"
          >
            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {pendingLeaves} demande{pendingLeaves > 1 ? 's' : ''} de congé en attente de validation
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">En cours de traitement par votre responsable</p>
            </div>
            <button
              onClick={() => navigate('/employee/leaves')}
              className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap"
            >
              Voir <ChevronRight size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
