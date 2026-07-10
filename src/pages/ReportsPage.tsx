import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { 
  BarChart3, TrendingUp, Users, DollarSign,
  Clock, Calendar, Download, Eye, EyeOff,
  ChevronDown, ChevronUp, Target, Award, AlertTriangle,
  Wallet, UserCheck
} from 'lucide-react';
import { 
  BarChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell,
  AreaChart, Area, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

export default function ReportsPage() {
  const { employees, leaves, attendance } = useApp();
  const { addToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({
    attendance: true, salary: false, leaves: false, department: false, performance: false
  });

  // Data calculations
  const activeEmployees = employees.filter(e => e.status === 'active');
  const totalSalary = activeEmployees.reduce((sum, e) => sum + e.salary, 0);
  // const _avgSalary = totalSalary / activeEmployees.length || 0;
  // const _topDepartment = activeEmployees.reduce((acc: Record<string, number>, emp) => {
  //   acc[emp.department] = (acc[emp.department] || 0) + 1;
  //   return acc;
  // }, {});
  // const _topDept = Object.entries(_topDepartment).sort((a, b) => b[1] - a[1])[0];

  // Department salary distribution
  const deptSalaryData = Object.entries(
    activeEmployees.reduce((acc: Record<string, number>, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + emp.salary;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const pieColors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];

  // Monthly salary trend
  const monthlySalaryData = useMemo(() => employees.length > 0
    ? Array.from({ length: 6 }, (_, i) => ({
        month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'][i],
        amount: Math.round(totalSalary * (0.8 + i * 0.04)),
        employees: Math.round(employees.length * (0.8 + i * 0.04)),
      }))
    : [], [employees, totalSalary]);

  // Attendance by department (computed from actual records)
  const attendanceByDept = useMemo(() => {
    const deptNames = [...new Set(employees.map(e => e.department))];
    return deptNames.map(dept => {
      const deptEmpIds = employees.filter(e => e.department === dept).map(e => e.id);
      const deptAttendance = attendance.filter(a => deptEmpIds.includes(a.employeeId));
      const presentCount = deptAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const rate = deptAttendance.length > 0 ? (presentCount / deptAttendance.length * 100) : 0;
      return { department: dept, rate: Math.round(rate * 10) / 10 };
    });
  }, [employees, attendance]);

  // Leave distribution
  const leaveTypeData = leaves.length > 0 ? Object.entries(
    leaves.reduce((acc: Record<string, number>, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name === 'annual' ? 'Annuel' : name === 'sick' ? 'Maladie' : name === 'maternity' ? 'Maternité' : 'Spécial', 
    value 
  })) : [{ name: 'Annuel', value: 3 }, { name: 'Maladie', value: 2 }, { name: 'Spécial', value: 1 }];

  // Performance data
  const performanceRadarData = [
    { metric: 'Productivité', score: 78 },
    { metric: 'Qualité', score: 85 },
    { metric: 'Collaboration', score: 82 },
    { metric: 'Innovation', score: 70 },
    { metric: 'Ponctualité', score: 88 },
    { metric: 'Leadership', score: 65 },
  ];

  // Salary by rank
  const salaryRankData = [
    { rank: '1-2 ans', count: 3, avgSalary: 450000 },
    { rank: '3-5 ans', count: 4, avgSalary: 680000 },
    { rank: '5-10 ans', count: 2, avgSalary: 850000 },
    { rank: '10+ ans', count: 1, avgSalary: 1200000 },
  ];

  // KPI Cards
  const kpiData = [
    { 
      label: 'Taux de rétention', value: '92%', 
      trend: '+3% vs T-1', good: true,
      icon: Target, color: 'bg-blue-500'
    },
    { 
      label: 'Coût recrutement/employé', value: '125K', 
      trend: '-15% vs T-1', good: true,
      icon: DollarSign, color: 'bg-green-500', suffix: ' FCFA'
    },
    { 
      label: 'Satisfaction employés', value: '4.2/5', 
      trend: '+0.3 vs T-1', good: true,
      icon: Award, color: 'bg-yellow-500'
    },
    { 
      label: 'Turnover', value: '8%', 
      trend: '-2% vs T-1', good: true,
      icon: AlertTriangle, color: 'bg-red-500'
    },
  ];

  const toggleDetail = (key: string) => {
    setShowDetails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () => {
    addToast('Export du rapport en cours... (PDF/Excel via backend)', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rapports & Analyses</h1>
          <p className="text-gray-500">Tableau de bord analytique RH complet</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button onClick={handleExport} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Download size={18} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className={`${kpi.color} p-2.5 rounded-lg`}>
                <kpi.icon size={20} className="text-white" />
              </div>
              <span className={`text-xs font-medium ${kpi.good ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}{kpi.suffix || ''}</p>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl"><Users size={24} className="text-blue-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Effectif total</p>
              <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl"><DollarSign size={24} className="text-green-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Masse salariale</p>
              <p className="text-2xl font-bold text-gray-800">{(totalSalary / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-gray-400">FCFA/mois</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-xl"><Calendar size={24} className="text-orange-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Congés actifs</p>
              <p className="text-2xl font-bold text-gray-800">{leaves.filter(l => l.status === 'approved').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-xl"><Clock size={24} className="text-purple-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Taux de présence</p>
              <p className="text-2xl font-bold text-gray-800">93.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart: Salary Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Évolution de la masse salariale (millions FCFA)</h3>
          <button onClick={() => toggleDetail('salary')} className="p-1 hover:bg-gray-100 rounded">
            {showDetails.salary ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
          </button>
        </div>
        {showDetails.salary && (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalaryData}>
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" fillOpacity={1} fill="url(#salaryGrad)" name="Montant (FCFA)" />
                <Line type="monotone" dataKey="employees" stroke="#10B981" strokeWidth={2} name="Employés" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Row of 2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Salary Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Répartition salariale par département</h3>
            <button onClick={() => toggleDetail('department')} className="p-1 hover:bg-gray-100 rounded">
              {showDetails.department ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
          </div>
          {showDetails.department && (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={deptSalaryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                      {deptSalaryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${((value as number) / 1000000).toFixed(1)}M FCFA`} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {deptSalaryData.map((d, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    <span className="text-gray-600 truncate">{d.name}</span>
                    <span className="font-medium ml-auto">{(d.value / 1000000).toFixed(1)}M</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Leave Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Distribution des congés par type</h3>
            <button onClick={() => toggleDetail('leaves')} className="p-1 hover:bg-gray-100 rounded">
              {showDetails.leaves ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
          </div>
          {showDetails.leaves && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {leaveTypeData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Row of 2 more charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance by Department */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Taux de présence par département</h3>
            <button onClick={() => toggleDetail('attendance')} className="p-1 hover:bg-gray-100 rounded">
              {showDetails.attendance ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
          </div>
          {showDetails.attendance && (
            <div className="space-y-3">
              {attendanceByDept.map((dept, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{dept.department}</span>
                    <span className="font-medium">{dept.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${dept.rate >= 95 ? 'bg-green-500' : dept.rate >= 90 ? 'bg-blue-500' : 'bg-orange-500'}`}
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Radar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Indicateurs de performance RH</h3>
            <button onClick={() => toggleDetail('performance')} className="p-1 hover:bg-gray-100 rounded">
              {showDetails.performance ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
          </div>
          {showDetails.performance && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <Radar name="Score" dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Salary by Experience */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Salaire moyen par ancienneté</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryRankData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis type="category" dataKey="rank" stroke="#9CA3AF" width={80} />
              <Tooltip formatter={(value) => `${((value as number) / 1000).toFixed(0)}K FCFA`} />
              <Bar dataKey="avgSalary" name="Salaire moyen" fill="#2563EB" radius={[0, 4, 4, 0]} />
              <Bar dataKey="count" name="Effectif" fill="#10B981" radius={[0, 4, 4, 0]} yAxisId="right" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2" />
          Insights & Recommandations IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-1.5"><Wallet size={16} /> Optimisation salariale</h4>
            <p className="text-blue-100 text-sm">Le département Informatique représente 35% de la masse salariale. Considérer un audit des compétences pour optimiser le ratio coût/productivité.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-1.5"><UserCheck size={16} /> Taux de rétention</h4>
            <p className="text-blue-100 text-sm">Le taux de rétention est excellent à 92%. Les départements Marketing et Ventes nécessitent une attention particulière (88.3% de présence).</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-1.5"><Target size={16} /> Formation</h4>
            <p className="text-blue-100 text-sm">Recommandation : former 3 employés aux compétences digitales pour maintenir la compétitivité. Budget estimé : 500K FCFA.</p>
          </div>
        </div>
      </div>

      {/* Export options */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Exporter les rapports</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Rapport RH complet', icon: BarChart3, desc: 'Toutes les données' },
            { name: 'Analyse salariale', icon: DollarSign, desc: 'Détail par employé' },
            { name: 'Présences', icon: Clock, desc: 'Historique complet' },
            { name: 'Congés', icon: Calendar, desc: 'Démarches & stats' },
          ].map((report, i) => (
            <button key={i} onClick={handleExport} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors text-left group">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                <report.icon size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{report.name}</p>
                <p className="text-xs text-gray-500">{report.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
