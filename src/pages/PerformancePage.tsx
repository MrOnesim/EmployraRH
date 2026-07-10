import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { 
  Star, TrendingUp, Target, Search, Plus, X,
  CheckCircle, Clock, ThumbsUp, Trophy, Eye
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface Performance {
  employeeId: string;
  scores: Record<string, number>;
  strengths: string[];
  areasToImprove: string[];
  goals: { title: string; completed: boolean }[];
  rating: number;
  lastReview: Date;
  badges: string[];
}

const mockPerformances: Record<string, Performance> = {
  '2': {
    employeeId: '2', scores: { communication: 9, organisation: 8, leadership: 7, teamwork: 9, adaptabilité: 8 },
    strengths: ['Excellente communication', 'Organisation impeccable', 'Leadership naturel'],
    areasToImprove: ['Déléguer plus efficacement', 'Gestion du temps'],
    goals: [{ title: 'Former un nouveau recruteur', completed: true }, { title: 'Créer un processus d\'onboarding', completed: true }, { title: 'Réduire le turnover de 10%', completed: false }],
    rating: 8.5, lastReview: new Date('2024-11-15'), badges: ['🏆 MENTOR', '⭐ ÉTOILE', '🤝 TEAMWORK']
  },
  '3': {
    employeeId: '3', scores: { communication: 7, organisation: 9, leadership: 6, teamwork: 8, adaptabilité: 9 },
    strengths: ['Compétences techniques exceptionnelles', 'Très organisé', 'Adaptable'],
    areasToImprove: ['Présentation devant groupe', 'Documentation du code'],
    goals: [{ title: 'Mentor un développeur junior', completed: true }, { title: 'Refactorer le module paie', completed: true }, { title: 'Obtenir cert AWS', completed: false }],
    rating: 8.2, lastReview: new Date('2024-11-20'), badges: ['💻 TECH LEAD', '🚀 INNOVATION']
  },
  '4': {
    employeeId: '4', scores: { communication: 8, organisation: 9, leadership: 6, teamwork: 8, adaptabilité: 7 },
    strengths: ['Précision financière', 'Reporting rigoureux', 'Fiabilité'],
    areasToImprove: ['Initiative', 'Collaboration inter-département'],
    goals: [{ title: 'Automatiser les rapports mensuels', completed: true }, { title: 'Former sur le nouveau logiciel', completed: false }],
    rating: 7.8, lastReview: new Date('2024-10-25'), badges: ['📊 PRÉCISION']
  },
  '5': {
    employeeId: '5', scores: { communication: 8, organisation: 7, leadership: 5, teamwork: 9, adaptabilité: 8 },
    strengths: ['Créativité', 'Design intuitif', 'Collaboration'],
    areasToImprove: ['Gestion des délais', 'Présentation de projets'],
    goals: [{ title: 'Refonte UI de l\'app', completed: true }, { title: 'Créer le design system', completed: true }, { title: 'Former l\'équipe UX', completed: false }],
    rating: 8.0, lastReview: new Date('2024-11-10'), badges: ['🎨 CRÉATIVITÉ', '⭐ ÉTOILE']
  },
  '7': {
    employeeId: '7', scores: { communication: 7, organisation: 8, leadership: 5, teamwork: 8, adaptabilité: 9 },
    strengths: ['Polyvalence Full Stack', 'Résolution de bugs', 'Apprentissage rapide'],
    areasToImprove: ['Leadership technique', 'Code review'],
    goals: [{ title: 'Déployer microservices', completed: false }, { title: 'Mentor le stage', completed: true }],
    rating: 7.5, lastReview: new Date('2024-12-01'), badges: ['🔧 BUG BUSTER']
  }
};

export default function PerformancePage() {
  const { employees } = useApp();
  const { addToast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeEmployees = employees.filter(e => e.status === 'active' && e.role === 'EMPLOYEE');

  const filteredEmployees = activeEmployees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPerf = selectedEmployee ? mockPerformances[selectedEmployee] : null;
  const selectedEmp = selectedEmployee ? employees.find(e => e.id === selectedEmployee) : null;

  const avgRating = Math.round(activeEmployees.reduce((sum, e) => sum + (mockPerformances[e.id]?.rating || 0), 0) / activeEmployees.length * 10) / 10;
  const completedGoals = Object.values(mockPerformances).reduce((sum, p) => sum + p.goals.filter(g => g.completed).length, 0);
  const totalGoals = Object.values(mockPerformances).reduce((sum, p) => sum + p.goals.length, 0);

  const handleAddGoal = () => {
    if (!newGoal.trim() || !selectedEmployee) return;
    addToast(`Objectif ajouté: ${newGoal}`, 'success');
    setNewGoal('');
    setShowAddGoal(false);
  };

  const radarData = currentPerf ? [
    { subject: 'Communication', value: currentPerf.scores.communication * 10, fullMark: 100 },
    { subject: 'Organisation', value: currentPerf.scores.organisation * 10, fullMark: 100 },
    { subject: 'Leadership', value: currentPerf.scores.leadership * 10, fullMark: 100 },
    { subject: 'Travail d\'équipe', value: currentPerf.scores.teamwork * 10, fullMark: 100 },
    { subject: 'Adaptabilité', value: currentPerf.scores.adaptabilité * 10, fullMark: 100 },
  ] : [];

  const scoreBarData = currentPerf ? Object.entries(currentPerf.scores).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    score: val
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance & Évaluations</h1>
          <p className="text-gray-500">Évaluez et suivez la performance de vos employés</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-xl"><Star size={24} className="text-yellow-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-800">{avgRating}/10</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl"><CheckCircle size={24} className="text-green-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Objectifs atteints</p>
              <p className="text-2xl font-bold text-gray-800">{completedGoals}/{totalGoals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-xl"><Trophy size={24} className="text-purple-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Badges décernés</p>
              <p className="text-2xl font-bold text-gray-800">
                {Object.values(mockPerformances).reduce((sum, p) => sum + p.badges.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl"><TrendingUp size={24} className="text-blue-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Employés évalués</p>
              <p className="text-2xl font-bold text-gray-800">{Object.keys(mockPerformances).length}/{activeEmployees.length}</p>
            </div>
          </div>
        </div>
      </div>

      {!selectedEmployee ? (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Employee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const perf = mockPerformances[emp.id];
              return (
                <div 
                  key={emp.id} 
                  onClick={() => setSelectedEmployee(emp.id)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{emp.firstName} {emp.lastName}</h3>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                      <p className="text-xs text-gray-400">{emp.department}</p>
                    </div>
                  </div>
                  {perf && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-lg text-gray-800">{perf.rating}</span>
                          <span className="text-gray-400 text-sm">/10</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {perf.lastReview.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {perf.badges.slice(0, 3).map((badge, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Back Button */}
          <button 
            onClick={() => setSelectedEmployee(null)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Eye size={18} />
            <span>← Retour à la liste</span>
          </button>

          {currentPerf && selectedEmp && (
            <>
              {/* Profile Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xl">
                        {selectedEmp.firstName.charAt(0)}{selectedEmp.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedEmp.firstName} {selectedEmp.lastName}</h2>
                      <p className="text-gray-500">{selectedEmp.position} • {selectedEmp.department}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {currentPerf.badges.map((badge, i) => (
                          <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <Star size={24} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-4xl font-bold text-gray-800">{currentPerf.rating}</span>
                      <span className="text-gray-400 text-lg">/10</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Note globale</p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Profil de compétences</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Score" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Scores détaillés</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {scoreBarData.map((entry, index) => (
                            <Cell key={index} fill={entry.score >= 8 ? '#10B981' : entry.score >= 6 ? '#2563EB' : '#F59E0B'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Strengths & Areas to Improve */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <ThumbsUp size={20} className="text-green-500 mr-2" />
                    Points forts
                  </h3>
                  <ul className="space-y-2">
                    {currentPerf.strengths.map((s, i) => (
                      <li key={i} className="flex items-center space-x-2 text-gray-700">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Target size={20} className="text-orange-500 mr-2" />
                    Axes d'amélioration
                  </h3>
                  <ul className="space-y-2">
                    {currentPerf.areasToImprove.map((a, i) => (
                      <li key={i} className="flex items-center space-x-2 text-gray-700">
                        <Clock size={16} className="text-orange-500 flex-shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Goals */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Target size={20} className="text-blue-500 mr-2" />
                    Objectifs
                  </h3>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="flex items-center space-x-1 text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    <Plus size={16} />
                    <span>Ajouter</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {currentPerf.goals.map((goal, i) => (
                    <div key={i} className={`flex items-center space-x-3 p-3 rounded-lg ${goal.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        goal.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {goal.completed && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <span className={`flex-1 ${goal.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                        {goal.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Nouvel objectif</h2>
              <button onClick={() => setShowAddGoal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectif *</label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Décrire l'objectif..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <button onClick={handleAddGoal} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                Ajouter l'objectif
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
