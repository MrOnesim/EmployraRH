import { useApp } from '../context/AppContext';
import { 
  Users, UserCheck, UserX, DollarSign, Wallet, Calendar,
  Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, Target, CheckSquare, Plus, Trash
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { employees, attendance, leaves, currentCompany, approveLeave, rejectLeave } = useApp();
  const navigate = useNavigate();
  const [showKpiSettings, setShowKpiSettings] = useState(false);
  const [kpiTargets, setKpiTargets] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('kpi_targets');
      return stored ? JSON.parse(stored) : { employees: 30, salary: 15, attendance: 95, balance: 50 };
    } catch { return { employees: 30, salary: 15, attendance: 95, balance: 50 }; }
  });

  // Admin Custom To-Do Checklist State
  const [todos, setTodos] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    try {
      const stored = localStorage.getItem('admin_todos');
      return stored ? JSON.parse(stored) : [
        { id: '1', text: 'Approuver les demandes de congés de Kwame', completed: false },
        { id: '2', text: 'Vérifier les pointages de la veille', completed: true },
        { id: '3', text: 'Lancer le calcul de la paie de Juillet', completed: false },
      ];
    } catch {
      return [];
    }
  });
  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    localStorage.setItem('kpi_targets', JSON.stringify(kpiTargets));
  }, [kpiTargets]);

  useEffect(() => {
    localStorage.setItem('admin_todos', JSON.stringify(todos));
  }, [todos]);

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
  
  const todayAttendance = attendance.filter(a => {
    const today = new Date();
    return new Date(a.date).toDateString() === today.toDateString();
  });
  
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const lateToday = todayAttendance.filter(a => a.status === 'late').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;

  const stats = [
    {
      label: 'Total Employés',
      value: employees.length,
      icon: Users,
      color: 'bg-blue-500',
      change: `Objectif: ${kpiTargets.employees}`,
      changeType: employees.length >= kpiTargets.employees ? 'positive' : 'warning',
      link: '/admin/employees'
    },
    {
      label: 'Employés Actifs',
      value: activeEmployees,
      icon: UserCheck,
      color: 'bg-green-500',
      change: `${presentToday} présent(s) aujourd'hui`,
      changeType: 'positive',
      link: '/admin/attendance'
    },
    {
      label: 'Masse Salariale',
      value: `${(totalSalary / 1000000).toFixed(1)}M`,
      suffix: 'FCFA',
      icon: DollarSign,
      color: 'bg-orange-500',
      change: `Objectif: ${kpiTargets.salary}M`,
      changeType: (totalSalary / 1000000) <= kpiTargets.salary ? 'positive' : 'negative',
      link: '/admin/salary'
    },
    {
      label: 'Solde Disponible',
      value: `${((currentCompany?.balance || 0) / 1000000).toFixed(1)}M`,
      suffix: 'FCFA',
      icon: Wallet,
      color: 'bg-purple-500',
      change: `Objectif: ${kpiTargets.balance}M`,
      changeType: (currentCompany?.balance || 0) / 1000000 >= kpiTargets.balance ? 'positive' : 'negative',
      link: '/admin/banking'
    },
    {
      label: 'Congés en attente',
      value: pendingLeaves,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: pendingLeaves > 0 ? `${pendingLeaves} à traiter` : 'Tout traité',
      changeType: pendingLeaves > 0 ? 'warning' : 'positive',
      link: '/admin/leaves'
    },
    {
      label: 'Retards aujourd\'hui',
      value: lateToday,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: lateToday > 0 ? `${lateToday} retard(s) détecté(s)` : 'Aucun retard',
      changeType: lateToday > 0 ? 'negative' : 'positive',
      link: '/admin/attendance'
    }
  ];

  const monthlyData = [
    { name: 'Jan', salaries: 8.5, employees: 20 },
    { name: 'Fév', salaries: 9.2, employees: 22 },
    { name: 'Mar', salaries: 8.8, employees: 21 },
    { name: 'Avr', salaries: 10.1, employees: 23 },
    { name: 'Mai', salaries: 9.5, employees: 24 },
    { name: 'Jun', salaries: 10.8, employees: 25 },
  ];

  const departmentData = [
    { name: 'Informatique', value: 3, color: '#2563EB' },
    { name: 'Marketing', value: 2, color: '#10B981' },
    { name: 'Finance', value: 1, color: '#F59E0B' },
    { name: 'RH', value: 1, color: '#8B5CF6' },
    { name: 'Direction', value: 1, color: '#EF4444' },
  ];



  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setTodos(prev => [...prev, { id: String(Date.now()), text: newTodoText.trim(), completed: false }]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Variants for staggered dashboard entries
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Bonjour, {currentCompany?.ownerFirstName} ! 👋</h1>
            <p className="text-blue-100 text-sm">Voici le résumé opérationnel de votre entreprise pour aujourd'hui</p>
          </div>
          <button 
            onClick={() => setShowKpiSettings(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 transition-all rounded-xl text-sm font-semibold cursor-pointer active:scale-95 shadow-md"
          >
            <Target size={16} />
            <span>Objectifs KPI</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            variants={cardVariants}
            whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
            onClick={() => navigate(stat.link)} 
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{stat.value}</span>
                  {stat.suffix && <span className="text-gray-400 dark:text-gray-500 text-sm font-bold">{stat.suffix}</span>}
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-2xl shadow-md shadow-blue-500/5`}>
                <stat.icon size={22} className="text-white" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-xs font-semibold">
              {stat.changeType === 'positive' && <ArrowUpRight size={14} className="text-green-500 mr-1" />}
              {stat.changeType === 'negative' && <ArrowDownRight size={14} className="text-red-500 mr-1" />}
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wide ${
                stat.changeType === 'positive' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                stat.changeType === 'negative' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                'bg-yellow-500/10 text-yellow-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4">Évolution des salaires (en millions FCFA)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorSalaries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="salaries" 
                  stroke="#2563EB" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSalaries)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4">Répartition par département</h3>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-4">
            {departmentData.map((dept, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: dept.color }} />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{dept.name}</span>
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-200">{dept.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Attendance details */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4">Présences aujourd'hui</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-green-500/10 rounded-xl border border-green-500/10">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <UserCheck size={18} className="text-white" />
                </div>
                <span className="ml-3 font-semibold text-gray-850 dark:text-gray-200 text-sm">Présents</span>
              </div>
              <span className="text-2xl font-black text-green-600 dark:text-green-400">{presentToday}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-yellow-500/10 rounded-xl border border-yellow-500/10">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <Clock size={18} className="text-white" />
                </div>
                <span className="ml-3 font-semibold text-gray-850 dark:text-gray-200 text-sm">En retard</span>
              </div>
              <span className="text-2xl font-black text-yellow-600">{lateToday}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-red-500/10 rounded-xl border border-red-500/10">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <UserX size={18} className="text-white" />
                </div>
                <span className="ml-3 font-semibold text-gray-850 dark:text-gray-200 text-sm">Absents</span>
              </div>
              <span className="text-2xl font-black text-red-650 dark:text-red-400">{absentToday}</span>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Interactive To-Do Checklist */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare size={18} className="text-blue-500" />
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Tâches de la direction</h3>
            </div>
            
            <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newTodoText}
                onChange={e => setNewTodoText(e.target.value)}
                placeholder="Nouvelle tâche administrative..."
                className="flex-1 px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-xs md:text-sm text-gray-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl active:scale-95 transition-all shadow-md"
              >
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {todos.map(todo => (
                  <motion.div 
                    key={todo.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        checked={todo.completed} 
                        onChange={() => toggleTodo(todo.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-xs md:text-sm ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                        {todo.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending Leaves requests with actual Approve/Reject bindings */}
      <AnimatePresence>
        {pendingLeaves > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-yellow-500" />
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Demandes de congé en attente</h3>
              </div>
              <span className="bg-yellow-500/15 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {pendingLeaves} en attente
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-3">
                    <th className="pb-3 font-bold">Employé</th>
                    <th className="pb-3 font-bold">Type</th>
                    <th className="pb-3 font-bold">Période</th>
                    <th className="pb-3 font-bold">Raison</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {leaves
                    .filter(l => l.status === 'pending')
                    .slice(0, 3)
                    .map((leave) => {
                      const employee = employees.find(e => e.id === leave.employeeId);
                      return (
                        <tr key={leave.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 font-bold text-blue-600 dark:text-blue-400 text-xs">
                                {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-800 dark:text-gray-250 text-sm">
                                {employee?.firstName} {employee?.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {leave.type === 'annual' ? 'Annuel' : 
                             leave.type === 'sick' ? 'Maladie' :
                             leave.type === 'maternity' ? 'Maternité' : 'Spécial'}
                          </td>
                          <td className="py-3 text-xs md:text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{leave.reason}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => approveLeave(leave.id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                              >
                                Approuver
                              </button>
                              <button 
                                onClick={() => rejectLeave(leave.id)}
                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                              >
                                Refuser
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Targets Modal */}
      <AnimatePresence>
        {showKpiSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Objectifs KPI</h3>
              <div className="space-y-4">
                {[
                  { key: 'employees', label: 'Effectif cible', suffix: 'employés', value: kpiTargets.employees },
                  { key: 'salary', label: 'Masse salariale max', suffix: 'M FCFA', value: kpiTargets.salary },
                  { key: 'balance', label: 'Solde minimum', suffix: 'M FCFA', value: kpiTargets.balance },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={item.value} 
                        onChange={e => setKpiTargets(prev => ({ ...prev, [item.key]: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 border border-gray-250 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-850 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                      <span className="text-sm font-semibold text-gray-550 dark:text-gray-400 whitespace-nowrap">{item.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowKpiSettings(false)} 
                  className="px-4 py-2 rounded-xl border border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => setShowKpiSettings(false)} 
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
