import { useState } from 'react';
import { useData } from '../context/DataContext';
import { CalendarEvent } from '../types';
import { 
  Calendar, Plus, X, MapPin, Users, Clock, PartyPopper, Cake,
  ClipboardList, Umbrella, Megaphone, Pin, Heart,
  Briefcase, AlertTriangle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePageLoading } from '../hooks/usePageLoading';
import { useToast } from '../context/ToastContext';
import { LoadingScreen } from '../components/ui';

export default function CalendarPage() {
  const { events, addEvent } = useData();
  const [view, setView] = useState<'month' | 'list'>('month');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', date: '', time: '', location: '', type: 'meeting' as CalendarEvent['type'], allDay: true
  });
  const loading = usePageLoading();
  const { addToast } = useToast();

  const typeConfig: Record<string, { label: string; color: string; bg: string; icon: LucideIcon | null }> = {
    all: { label: 'Tous', color: '', bg: '', icon: null },
    birthday: { label: 'Anniversaires', color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', icon: Cake },
    meeting: { label: 'Réunions', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: ClipboardList },
    holiday: { label: 'Jours fériés', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: Umbrella },
    team: { label: 'Événements équipe', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: PartyPopper },
    training: { label: 'Formations', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: Megaphone },
    other: { label: 'Autres', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: Pin },
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const filteredEvents = events.filter(e => typeFilter === 'all' || e.type === typeFilter);

  const getEventsForDate = (dateStr: string) => filteredEvents.filter(e => e.date === dateStr);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    try {
      addEvent({ ...newEvent, attendees: [] });
      setNewEvent({ title: '', description: '', date: '', time: '', location: '', type: 'meeting', allDay: true });
      setShowModal(false);
    } catch {
      addToast("Erreur lors de la création de l'événement", 'error');
    }
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Stats
  const upcomingEvents = events.filter(e => new Date(e.date) >= today);
  const birthdaysThisMonth = events.filter(e => e.type === 'birthday' && new Date(e.date).getMonth() === currentMonth).length;
  const holidaysThisMonth = events.filter(e => e.type === 'holiday' && new Date(e.date).getMonth() === currentMonth).length;

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendrier entreprise</h1>
          <p className="text-gray-500">Événements, anniversaires et congés</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Nouvel événement</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-xl"><PartyPopper size={24} className="text-purple-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Événements à venir</p>
              <p className="text-2xl font-bold text-gray-800">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-pink-100 p-3 rounded-xl"><Heart size={24} className="text-pink-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Anniversaires</p>
              <p className="text-2xl font-bold text-gray-800">{birthdaysThisMonth}</p>
              <p className="text-xs text-gray-400">ce mois</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-xl"><AlertTriangle size={24} className="text-red-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Jours fériés</p>
              <p className="text-2xl font-bold text-gray-800">{holidaysThisMonth}</p>
              <p className="text-xs text-gray-400">ce mois</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl"><Briefcase size={24} className="text-blue-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Total événements</p>
              <p className="text-2xl font-bold text-gray-800">{events.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            {Object.entries(typeConfig).filter(([key]) => key !== 'all').map(([key, config]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  typeFilter === key
                    ? `${config.bg} ${config.color} border font-medium`
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {config.icon && <config.icon size={14} className="inline" />} {config.label}
              </button>
            ))}
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {view === 'month' ? (
        /* Month View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">{monthNames[currentMonth]} {currentYear}</h2>
          </div>
          <div className="grid grid-cols-7">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 min-h-[80px] bg-gray-50/50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(dateStr);
              const isToday = day === today.getDate();
              const isWeekend = (startOffset + i) % 7 >= 5;

              return (
                <div key={day} className={`p-2 min-h-[80px] border-t border-gray-100 ${
                  isToday ? 'bg-blue-50' : isWeekend ? 'bg-gray-50/50' : ''
                }`}>
                  <span className={`text-sm font-medium ${
                    isToday ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center inline-block' : 'text-gray-700'
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map(evt => (
                      <div key={evt.id} className={`text-xs px-1.5 py-0.5 rounded truncate border ${typeConfig[evt.type]?.bg || 'bg-gray-50'}`}>
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-gray-400">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredEvents
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(evt => {
              const config = typeConfig[evt.type];
              return (
                <div key={evt.id} className={`bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${config?.bg || ''}`} style={evt.type !== 'birthday' && evt.type !== 'holiday' && evt.type !== 'team' ? {} : {}}>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: evt.type === 'birthday' ? '#fce7f3' : evt.type === 'meeting' ? '#dbeafe' : evt.type === 'holiday' ? '#fee2e2' : evt.type === 'team' ? '#ede9fe' : '#f3f4f6' }}>
                      {config?.icon ? <config.icon size={20} /> : <Pin size={20} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{evt.title}</h3>
                        {evt.allDay && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Toute la journée</span>}
                      </div>
                      {evt.description && <p className="text-sm text-gray-500 mb-2">{evt.description}</p>}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center"><Calendar size={12} className="mr-1" />{new Date(evt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        {!evt.allDay && evt.time && <span className="flex items-center"><Clock size={12} className="mr-1" />{evt.time}</span>}
                        {evt.location && <span className="flex items-center"><MapPin size={12} className="mr-1" />{evt.location}</span>}
                        {evt.attendees.length > 0 && <span className="flex items-center"><Users size={12} className="mr-1" />{evt.attendees.length} participant(s)</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Nouvel événement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} placeholder="Titre de l'événement" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value as CalendarEvent['type']})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="meeting">Réunion</option>
                  <option value="team">Événement équipe</option>
                  <option value="holiday">Jour férié</option>
                  <option value="birthday">Anniversaire</option>
                  <option value="training">Formation</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} placeholder="Lieu de l'événement" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} rows={3} placeholder="Description..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
              </div>
              <button onClick={handleAddEvent} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">Créer l'événement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
