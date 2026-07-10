import { useApp } from '../context/AppContext';
import { Clock, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';

export default function EmployeeAttendancePage() {
  const { currentUser, attendance } = useApp();
  const loading = usePageLoading();

  const myAttendance = attendance
    .filter(a => a.employeeId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const todayAttendance = myAttendance.find(a => 
    new Date(a.date).toDateString() === new Date().toDateString()
  );

  const totalHoursThisMonth = myAttendance
    .filter(a => new Date(a.date).getMonth() === new Date().getMonth())
    .reduce((sum, a) => sum + a.totalHours, 0);

  const overtimeThisMonth = myAttendance
    .filter(a => new Date(a.date).getMonth() === new Date().getMonth())
    .reduce((sum, a) => sum + a.overtime, 0);

  const avgHours = myAttendance.length > 0 
    ? myAttendance.reduce((sum, a) => sum + a.totalHours, 0) / myAttendance.length 
    : 0;

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Weekly chart data
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
  const weeklyData = getWeekDates().filter((_, i) => i >= 1 && i <= 5).map((date) => {
    const dayAttendance = myAttendance.filter(a =>
      new Date(a.date).toDateString() === date.toDateString()
    );
    const hours = dayAttendance.reduce((sum, a) => sum + a.totalHours, 0);
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3).replace(/\.$/, ''),
      hours,
    };
  });

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mon historique de pointage</h1>
        <p className="text-gray-500">Consultez votre historique de présence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-800">
                {todayAttendance?.totalHours || 0}h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <Calendar size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Ce mois</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalHoursThisMonth.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-xl">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Heures sup.</p>
              <p className="text-2xl font-bold text-gray-800">
                {overtimeThisMonth.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <CheckCircle size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Moyenne/jour</p>
              <p className="text-2xl font-bold text-gray-800">
                {avgHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Mes heures cette semaine</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="hours" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Details */}
      {todayAttendance && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-4">Détails d'aujourd'hui</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-200 text-sm">Arrivée</p>
              <p className="text-xl font-bold">{formatTime(todayAttendance.checkIn)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-200 text-sm">Pause</p>
              <p className="text-xl font-bold">
                {todayAttendance.breakStart 
                  ? `${formatTime(todayAttendance.breakStart)} - ${formatTime(todayAttendance.breakEnd)}`
                  : '--:--'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-200 text-sm">Départ</p>
              <p className="text-xl font-bold">{formatTime(todayAttendance.checkOut)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-200 text-sm">Total</p>
              <p className="text-xl font-bold">{todayAttendance.totalHours}h</p>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Historique récent</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Date</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Arrivée</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Pause</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Départ</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Heures</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 text-sm">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myAttendance.slice(0, 10).map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-800">
                    {new Date(record.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {formatTime(record.checkIn)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record.breakStart ? (
                      <span>{formatTime(record.breakStart)} - {formatTime(record.breakEnd)}</span>
                    ) : '--'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {formatTime(record.checkOut)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{record.totalHours}h</span>
                    {record.overtime > 0 && (
                      <span className="text-green-600 text-sm ml-1">+{record.overtime}h</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-700'
                        : record.status === 'late'
                        ? 'bg-yellow-100 text-yellow-700'
                        : record.status === 'absent'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {record.status === 'present' ? 'À l\'heure' : 
                       record.status === 'late' ? 'En retard' :
                       record.status === 'absent' ? 'Absent' : 'Mi-journée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
