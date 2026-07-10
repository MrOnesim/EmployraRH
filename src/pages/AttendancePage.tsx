import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/ui';
import { 
  Search, Calendar, Clock, UserCheck, UserX, 
  AlertTriangle, Download, TrendingUp, Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AttendancePage() {
  const { employees, attendance } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayAttendance = attendance.filter(a => 
    new Date(a.date).toDateString() === new Date(selectedDate).toDateString()
  );

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = employees.filter(e => e.status === 'active').length - todayAttendance.length;
  const totalHours = todayAttendance.reduce((sum, a) => sum + a.totalHours, 0);
  const overtimeHours = todayAttendance.reduce((sum, a) => sum + a.overtime, 0);

  const filteredAttendance = todayAttendance.filter(a => {
    const employee = employees.find(e => e.id === a.employeeId);
    if (!employee) return false;
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const chartData = [
    { name: 'Présents', value: presentCount, color: '#10B981' },
    { name: 'En retard', value: lateCount, color: '#F59E0B' },
    { name: 'Absents', value: absentCount, color: '#EF4444' }
  ];

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
    const dayAttendance = attendance.filter(a =>
      new Date(a.date).toDateString() === date.toDateString()
    );
    const present = dayAttendance.filter(a => a.status === 'present').length;
    const late = dayAttendance.filter(a => a.status === 'late').length;
    const activeCount = employees.filter(e => e.status === 'active').length;
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3).replace(/\.$/, ''),
      present,
      late,
      absent: activeCount - present - late,
    };
  });

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des présences</h1>
          <p className="text-gray-500">Suivez les présences et absences de vos employés</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Download size={18} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <UserCheck size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Présents</p>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">En retard</p>
              <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <UserX size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Absents</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Heures totales</p>
              <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Répartition aujourd'hui</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Présences cette semaine</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 font-medium text-gray-600">Employé</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Arrivée</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Pause</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Départ</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Heures</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Heures sup.</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendance.map((record) => {
                const employee = employees.find(e => e.id === record.employeeId);
                if (!employee) return null;
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{employee.department}</p>
                        </div>
                      </div>
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
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {record.totalHours}h
                    </td>
                    <td className="px-6 py-4">
                      {record.overtime > 0 ? (
                        <span className="text-green-600 font-medium">+{record.overtime}h</span>
                      ) : (
                        <span className="text-gray-400">-</span>
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
                        {record.status === 'present' ? 'Présent' : 
                         record.status === 'late' ? 'En retard' :
                         record.status === 'absent' ? 'Absent' : 'Mi-journée'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Employees without attendance */}
              {employees
                .filter(e => e.status === 'active' && !todayAttendance.find(a => a.employeeId === e.id))
                .filter(e => {
                  const matchesSearch = 
                    e.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.lastName.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesSearch;
                })
                .map((employee) => (
                  <tr key={`absent-${employee.id}`} className="hover:bg-gray-50 transition-colors bg-red-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-medium">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{employee.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">--</td>
                    <td className="px-6 py-4 text-gray-400">--</td>
                    <td className="px-6 py-4 text-gray-400">--</td>
                    <td className="px-6 py-4 text-gray-400">0h</td>
                    <td className="px-6 py-4 text-gray-400">-</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                        Absent
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {filteredAttendance.length === 0 && employees.filter(e => e.status === 'active').length === 0 && (
            <EmptyState icon={Users} title="Aucun pointage pour cette date" />
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp size={24} />
          <h3 className="font-semibold">Résumé des présences</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-200 text-sm">Total heures travaillées</p>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Heures supplémentaires</p>
            <p className="text-2xl font-bold">{overtimeHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Taux de présence</p>
            <p className="text-2xl font-bold">
              {((presentCount + lateCount) / employees.filter(e => e.status === 'active').length * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Taux de retard</p>
            <p className="text-2xl font-bold">
              {(lateCount / (presentCount + lateCount) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
