import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import {
  Video,
  Monitor,
  MapPin,
  Laptop,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Star,
  AlertTriangle,
  MessageSquare,
  ListTodo,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  VideoOff,
  Phone,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { cn } from '../utils/cn';
import type { Meeting, MeetingTask, ParticipantStatus } from '../types';

const departments = [
  'Direction',
  'Ressources Humaines',
  'Finance',
  'Informatique',
  'Marketing',
  'Ventes',
  'Operations',
  'Juridique',
  'Autre',
];

const priorityConfig = {
  normal: {
    label: 'Normal',
    class: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  important: {
    label: 'Important',
    class: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  urgent: { label: 'Urgent', class: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

const statusBadge: Record<string, { label: string; variant: 'blue' | 'green' | 'gray' | 'red' }> = {
  scheduled: { label: 'Planifiée', variant: 'blue' },
  ongoing: { label: 'En cours', variant: 'green' },
  completed: { label: 'Terminée', variant: 'gray' },
  cancelled: { label: 'Annulée', variant: 'red' },
};

const typeIcons: Record<string, React.ElementType> = {
  physical: MapPin,
  online: Monitor,
  hybrid: Laptop,
};

const typeLabels: Record<string, string> = {
  physical: 'Physique',
  online: 'En ligne',
  hybrid: 'Hybride',
};

const monthNames = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export default function MeetingPage() {
  const { currentUser, currentCompany } = useApp();
  const {
    meetings,
    employees,
    addMeeting,
    addMeetingNote,
    addMeetingTask,
    updateMeetingTask,
    updateParticipantStatus,
    joinMeeting,
    leaveMeeting,
  } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || !currentUser || !currentCompany) return;
    seeded.current = true;
    if (meetings.length > 0) return;
    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const seedData: Array<Omit<Meeting, 'id' | 'createdAt' | 'status'>> = [
      {
        companyId: currentCompany.id,
        title: 'Réunion stratégique Q1',
        description: 'Discussion sur les objectifs et le budget du premier trimestre',
        date: todayObj,
        startTime: '09:00',
        endTime: '10:30',
        department: 'Direction',
        type: 'physical',
        priority: 'important',
        createdBy: currentUser.id,
        participants: [
          { employeeId: currentUser.id, status: 'accepted' },
          { employeeId: '2', status: 'accepted' },
          { employeeId: '3', status: 'pending' },
          { employeeId: '4', status: 'declined' },
        ],
        notes: [
          {
            id: 'n1',
            meetingId: '',
            authorId: currentUser.id,
            content: 'Préparer le budget annuel',
            type: 'comment',
            createdAt: new Date('2025-01-10'),
          },
        ],
        tasks: [],
        agenda: [],
        virtualRoomUrl: undefined,
      },
      {
        companyId: currentCompany.id,
        title: 'Daily IT',
        description: 'Point quotidien équipe informatique',
        date: todayObj,
        startTime: '10:00',
        endTime: '10:15',
        department: 'Informatique',
        type: 'online',
        priority: 'normal',
        createdBy: '3',
        participants: [
          { employeeId: '3', status: 'accepted' },
          { employeeId: '7', status: 'accepted' },
        ],
        notes: [],
        tasks: [],
        agenda: [],
        virtualRoomUrl: 'https://meet.example.com/daily-it',
      },
      {
        companyId: currentCompany.id,
        title: 'Atelier Design Sprint',
        description: 'Session de design collaboratif pour le nouveau produit',
        date: new Date(now.getTime() + 86400000 * 2),
        startTime: '14:00',
        endTime: '17:00',
        department: 'Marketing',
        type: 'hybrid',
        priority: 'urgent',
        createdBy: '5',
        participants: [
          { employeeId: '5', status: 'accepted' },
          { employeeId: '6', status: 'pending' },
          { employeeId: '2', status: 'accepted' },
        ],
        notes: [],
        tasks: [],
        agenda: [],
        virtualRoomUrl: undefined,
        summary:
          'Atelier de 3 heures avec présentation des maquettes et brainstorming. 8 participants attendus.',
      },
      {
        companyId: currentCompany.id,
        title: 'Point RH hebdomadaire',
        description: 'Suivi des dossiers RH en cours',
        date: new Date(now.getTime() - 86400000 * 5),
        startTime: '11:00',
        endTime: '12:00',
        department: 'Ressources Humaines',
        type: 'online',
        priority: 'normal',
        createdBy: '2',
        participants: [
          { employeeId: '2', status: 'accepted' },
          { employeeId: '1', status: 'accepted' },
        ],
        notes: [
          {
            id: 'n2',
            meetingId: '',
            authorId: '2',
            content: 'Point traité : congés, recrutement, paie',
            type: 'comment',
            createdAt: new Date(),
          },
        ],
        tasks: [
          {
            id: 't1',
            meetingId: '',
            title: 'Finaliser le tableau des effectifs',
            assignedTo: '2',
            deadline: new Date('2025-01-12'),
            status: 'completed',
            createdAt: new Date(),
          },
        ],
        agenda: [],
        virtualRoomUrl: undefined,
      },
      {
        companyId: currentCompany.id,
        title: 'Réunion annulée fournisseur',
        description: 'Présentation du nouveau logiciel de paie',
        date: new Date(now.getTime() - 86400000 * 3),
        startTime: '15:00',
        endTime: '16:00',
        department: 'Finance',
        type: 'physical',
        priority: 'normal',
        createdBy: '4',
        participants: [{ employeeId: '4', status: 'declined' }],
        notes: [],
        tasks: [],
        agenda: [],
        virtualRoomUrl: undefined,
      },
    ];
    seedData.forEach((m) => addMeeting(m));
  }, [currentUser, currentCompany, meetings.length, addMeeting]);

  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'stats'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [navDate, setNavDate] = useState(new Date());
  const [showRoom, setShowRoom] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', deadline: '' });

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    department: 'Direction',
    type: 'physical' as Meeting['type'],
    priority: 'normal' as Meeting['priority'],
    participantIds: [] as string[],
  });

  const currentMonth = navDate.getMonth();
  const currentYear = navDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date();

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
  };

  const getEmployeeById = (id: string) => employees.find((e) => e.id === id);

  const filteredMeetings = useMemo(
    () =>
      meetings.filter((m) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
        const matchDept = departmentFilter === 'all' || m.department === departmentFilter;
        const matchPriority = priorityFilter === 'all' || m.priority === priorityFilter;
        const matchStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchSearch && matchDept && matchPriority && matchStatus;
      }),
    [meetings, searchQuery, departmentFilter, priorityFilter, statusFilter],
  );

  const dateStrKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.startTime || !newMeeting.endTime) {
      addToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    if (!currentCompany || !currentUser) return;
    try {
      addMeeting({
        companyId: currentCompany.id,
        title: newMeeting.title,
        description: newMeeting.description,
        date: new Date(newMeeting.date + 'T' + newMeeting.startTime),
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime,
        department: newMeeting.department,
        type: newMeeting.type,
        priority: newMeeting.priority,
        createdBy: currentUser.id,
        participants: newMeeting.participantIds.map((pid) => ({
          employeeId: pid,
          status: 'pending' as ParticipantStatus,
        })),
        notes: [],
        tasks: [],
        agenda: [],
        virtualRoomUrl: undefined,
        summary: undefined,
      });
      setShowCreateModal(false);
      setNewMeeting({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        department: 'Direction',
        type: 'physical',
        priority: 'normal',
        participantIds: [],
      });
      addToast('Réunion créée avec succès', 'success');
    } catch {
      addToast('Erreur lors de la création de la réunion', 'error');
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedMeeting || !currentUser) return;
    try {
      addMeetingNote(selectedMeeting.id, {
        meetingId: selectedMeeting.id,
        authorId: currentUser.id,
        content: newNote,
        type: 'comment',
      });
      setSelectedMeeting((prev) =>
        prev
          ? {
              ...prev,
              notes: [
                ...prev.notes,
                {
                  id: String(Date.now()),
                  meetingId: prev.id,
                  authorId: currentUser.id,
                  content: newNote,
                  type: 'comment' as const,
                  createdAt: new Date(),
                },
              ],
            }
          : null,
      );
      setNewNote('');
      addToast('Note ajoutée', 'success');
    } catch {
      addToast("Erreur lors de l'ajout de la note", 'error');
    }
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.deadline || !selectedMeeting) return;
    try {
      addMeetingTask(selectedMeeting.id, {
        meetingId: selectedMeeting.id,
        title: newTask.title,
        assignedTo: newTask.assignedTo,
        deadline: new Date(newTask.deadline),
        status: 'pending',
      });
      setSelectedMeeting((prev) =>
        prev
          ? {
              ...prev,
              tasks: [
                ...prev.tasks,
                {
                  id: String(Date.now()),
                  meetingId: prev.id,
                  title: newTask.title,
                  assignedTo: newTask.assignedTo,
                  deadline: new Date(newTask.deadline),
                  status: 'pending' as const,
                  createdAt: new Date(),
                },
              ],
            }
          : null,
      );
      setNewTask({ title: '', assignedTo: '', deadline: '' });
      addToast('Tâche ajoutée', 'success');
    } catch {
      addToast("Erreur lors de l'ajout de la tâche", 'error');
    }
  };

  const handleUpdateTask = (taskId: string, status: MeetingTask['status']) => {
    if (!selectedMeeting) return;
    try {
      updateMeetingTask(selectedMeeting.id, taskId, { status });
      setSelectedMeeting((prev) =>
        prev
          ? { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) }
          : null,
      );
      addToast('Tâche mise à jour', 'success');
    } catch {
      addToast('Erreur lors de la mise à jour de la tâche', 'error');
    }
  };

  const handleUpdateParticipantStatus = (employeeId: string, status: ParticipantStatus) => {
    if (!selectedMeeting) return;
    try {
      updateParticipantStatus(selectedMeeting.id, employeeId, status);
      setSelectedMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.map((p) =>
                p.employeeId === employeeId ? { ...p, status } : p,
              ),
            }
          : null,
      );
      addToast('Statut mis à jour', 'success');
    } catch {
      addToast('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleJoinRoom = (meeting: Meeting) => {
    if (currentUser) joinMeeting(meeting.id, currentUser.id);
    setShowRoom(true);
    setShowDetailModal(false);
  };

  const handleLeaveRoom = () => {
    if (selectedMeeting && currentUser) leaveMeeting(selectedMeeting.id, currentUser.id);
    setShowRoom(false);
    setAudioOn(true);
    setVideoOn(true);
  };

  const openDetail = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
    setNewNote('');
    setNewTask({ title: '', assignedTo: '', deadline: '' });
  };

  const stats = useMemo(() => {
    const total = meetings.length;
    const thisMonth = meetings.filter((m) => {
      const d = m.date;
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
    const durations = meetings.map((m) => {
      const [sh, sm] = m.startTime.split(':').map(Number);
      const [eh, em] = m.endTime.split(':').map(Number);
      return Math.max(0, eh * 60 + em - (sh * 60 + sm));
    });
    const avgDurationMin =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const totalPart = meetings.reduce((a, m) => a + m.participants.length, 0);
    const acceptedPart = meetings.reduce(
      (a, m) => a + m.participants.filter((p) => p.status === 'accepted').length,
      0,
    );
    const partRate = totalPart > 0 ? (acceptedPart / totalPart) * 100 : 0;
    const deptBreakdown = meetings.reduce(
      (acc, m) => {
        const dept = m.department || 'Inconnu';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const maxDept = Math.max(...Object.values(deptBreakdown), 1);
    const recent = [...meetings]
      .sort((a, b) => {
        const aTime =
          a.notes.length > 0
            ? Math.max(...a.notes.map((n) => n.createdAt.getTime()))
            : a.date.getTime();
        const bTime =
          b.notes.length > 0
            ? Math.max(...b.notes.map((n) => n.createdAt.getTime()))
            : b.date.getTime();
        return bTime - aTime;
      })
      .slice(0, 5);
    return { total, thisMonth, avgDurationMin, partRate, deptBreakdown, maxDept, recent };
  }, [meetings]);

  const participantStatusColors: Record<ParticipantStatus, string> = {
    accepted: 'text-green-600',
    pending: 'text-yellow-600',
    declined: 'text-red-600',
    tentative: 'text-blue-600',
  };

  const participantStatusLabels: Record<ParticipantStatus, string> = {
    accepted: 'Accepté',
    pending: 'En attente',
    declined: 'Refusé',
    tentative: 'Provisoire',
  };

  if (showRoom && selectedMeeting) {
    return (
      <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center relative bg-gray-900">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Video size={48} className="text-gray-600" />
            </div>
            <h2 className="text-white text-xl font-semibold">{selectedMeeting.title}</h2>
            <p className="text-gray-400 mt-1">
              {selectedMeeting.date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              {' à '}
              {selectedMeeting.startTime}
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">En direct</span>
            </div>
          </div>
          <div className="absolute bottom-24 left-4">
            <div className="w-48 h-36 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Vous'}
              </span>
            </div>
          </div>
        </div>
        <div className="h-20 bg-gray-950 border-t border-gray-800 flex items-center justify-center space-x-6">
          <button
            onClick={() => setAudioOn(!audioOn)}
            className={cn(
              'p-4 rounded-full transition-colors',
              audioOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-600 text-white',
            )}
          >
            {audioOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={cn(
              'p-4 rounded-full transition-colors',
              videoOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-600 text-white',
            )}
          >
            {videoOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
          <button
            onClick={handleLeaveRoom}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <Phone size={22} className="rotate-135" />
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gestion des réunions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Planifiez, gérez et suivez toutes vos réunions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Nouvelle réunion</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['list', 'calendar', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700',
              )}
            >
              {tab === 'list'
                ? 'Toutes les réunions'
                : tab === 'calendar'
                  ? 'Calendrier'
                  : 'Statistiques'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une réunion..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les départements</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifiée</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
          </select>
          <Filter size={18} className="text-gray-400 self-center hidden md:block" />
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="grid gap-4">
          {filteredMeetings.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              Aucune réunion trouvée
            </div>
          )}
          {filteredMeetings.map((meeting) => {
            const TypeIcon = typeIcons[meeting.type];
            const statusInfo = statusBadge[meeting.status];
            const priorityInfo = meeting.priority ? priorityConfig[meeting.priority] : null;
            return (
              <div
                key={meeting.id}
                onClick={() => openDetail(meeting)}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {meeting.title}
                      </h3>
                      {priorityInfo && (
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            priorityInfo.class,
                          )}
                        >
                          {priorityInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {meeting.date.toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {meeting.startTime} - {meeting.endTime}
                      </span>
                      <span className="flex items-center">
                        <TypeIcon size={14} className="mr-1" />
                        {typeLabels[meeting.type]}
                      </span>
                      <span className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {meeting.participants.length} participant
                        {meeting.participants.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {meeting.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">
                        {meeting.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                      {meeting.department}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setNavDate(new Date(currentYear, currentMonth - 1, 1))}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-500" />
              </button>
              <button
                onClick={() => setNavDate(new Date())}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setNavDate(new Date(currentYear, currentMonth + 1, 1))}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 overflow-x-auto">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div
                key={day}
                className="p-2 md:p-3 text-center text-[11px] md:text-sm font-medium text-gray-500 bg-gray-50 dark:bg-gray-800/50"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div
                key={`e-${i}`}
                className="p-1 md:p-2 min-h-[60px] md:min-h-[90px] bg-gray-50/50 dark:bg-gray-800/30"
              />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = new Date(currentYear, currentMonth, day);
              const key = dateStrKey(d);
              const dayMeetings = meetings.filter((m) => dateStrKey(m.date) === key);
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const isWeekend = (startOffset + i) % 7 >= 5;
              return (
                <div
                  key={day}
                  className={cn(
                    'p-1 md:p-2 min-h-[60px] md:min-h-[90px] border-t border-gray-100 dark:border-gray-800',
                    isToday
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : isWeekend
                        ? 'bg-gray-50/50 dark:bg-gray-800/30'
                        : '',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs md:text-sm font-medium',
                      isToday
                        ? 'w-6 h-6 md:w-7 md:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center'
                        : 'text-gray-700 dark:text-gray-300',
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-0.5 md:mt-1 space-y-0.5 md:space-y-1">
                    {dayMeetings.slice(0, 2).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => openDetail(m)}
                        className={cn(
                          'text-[10px] md:text-xs w-full text-left px-1 py-0.5 md:px-1.5 md:py-1 rounded truncate block leading-tight',
                          m.status === 'ongoing'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : m.status === 'cancelled'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 line-through'
                              : m.status === 'completed'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                        )}
                      >
                        {m.title}
                      </button>
                    ))}
                    {dayMeetings.length > 2 && (
                      <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500">
                        +{dayMeetings.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <Star size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total réunions</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <Clock size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Durée moyenne</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {Math.round(stats.avgDurationMin)} min
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                  <Users size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Taux de participation</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {Math.round(stats.partRate)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <Calendar size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Réunions ce mois</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {stats.thisMonth}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Répartition par département
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.deptBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([dept, count]) => (
                    <div key={dept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{dept}</span>
                        <span className="text-gray-500 dark:text-gray-400">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${(count / stats.maxDept) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                {Object.keys(stats.deptBreakdown).length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">Aucune donnée</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Activité récente
              </h3>
              <div className="space-y-3">
                {stats.recent.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start space-x-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-2',
                        m.status === 'ongoing'
                          ? 'bg-green-500'
                          : m.status === 'completed'
                            ? 'bg-gray-400'
                            : m.status === 'cancelled'
                              ? 'bg-red-500'
                              : 'bg-blue-500',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {m.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {m.department} · {statusBadge[m.status]?.label}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {m.date.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
                {stats.recent.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle réunion"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              placeholder="Titre de la réunion"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newMeeting.description}
              onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              rows={3}
              placeholder="Description de la réunion..."
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure début *
              </label>
              <input
                type="time"
                value={newMeeting.startTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure fin *
              </label>
              <input
                type="time"
                value={newMeeting.endTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Département
            </label>
            <select
              value={newMeeting.department}
              onChange={(e) => setNewMeeting({ ...newMeeting, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="flex space-x-2">
              {(['physical', 'online', 'hybrid'] as const).map((t) => {
                const Icon = typeIcons[t];
                return (
                  <button
                    key={t}
                    onClick={() => setNewMeeting({ ...newMeeting, type: t })}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      newMeeting.type === t
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                    )}
                  >
                    <Icon size={16} />
                    <span>{typeLabels[t]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priorité
            </label>
            <div className="flex space-x-2">
              {(['normal', 'important', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewMeeting({ ...newMeeting, priority: p })}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                    newMeeting.priority === p
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Participants
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={newMeeting.participantIds.includes(emp.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewMeeting({
                          ...newMeeting,
                          participantIds: [...newMeeting.participantIds, emp.id],
                        });
                      } else {
                        setNewMeeting({
                          ...newMeeting,
                          participantIds: newMeeting.participantIds.filter((id) => id !== emp.id),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {emp.firstName} {emp.lastName}
                  </span>
                  <span className="text-xs text-gray-400">{emp.position}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={handleCreateMeeting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Créer la réunion
          </button>
        </div>
      </Modal>

      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedMeeting?.title || ''}
        maxWidth="xl"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusBadge[selectedMeeting.status].variant}>
                {statusBadge[selectedMeeting.status].label}
              </Badge>
              {selectedMeeting.priority && (
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    priorityConfig[selectedMeeting.priority].class,
                  )}
                >
                  {priorityConfig[selectedMeeting.priority].label}
                </span>
              )}
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                {selectedMeeting.department}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full flex items-center">
                {React.createElement(typeIcons[selectedMeeting.type], {
                  size: 12,
                  className: 'mr-1',
                })}
                {typeLabels[selectedMeeting.type]}
              </span>
            </div>

            {selectedMeeting.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {selectedMeeting.description}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedMeeting.date.toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Horaire</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedMeeting.startTime} - {selectedMeeting.endTime}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Organisateur</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedMeeting.createdBy ? getEmployeeName(selectedMeeting.createdBy) : '—'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Participants</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedMeeting.participants.filter((p) => p.status === 'accepted').length}/
                  {selectedMeeting.participants.length} acceptés
                </p>
              </div>
            </div>

            {selectedMeeting.status === 'ongoing' && selectedMeeting.type !== 'physical' && (
              <button
                onClick={() => handleJoinRoom(selectedMeeting)}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Video size={18} />
                <span>Rejoindre la salle virtuelle</span>
              </button>
            )}

            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                <Users size={16} className="mr-2" />
                Participants
              </h4>
              <div className="space-y-2">
                {selectedMeeting.participants.map((p) => (
                  <div
                    key={p.employeeId}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {getEmployeeName(p.employeeId)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={cn('text-xs font-medium', participantStatusColors[p.status])}
                      >
                        {participantStatusLabels[p.status]}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateParticipantStatus(
                            p.employeeId,
                            p.status === 'accepted' ? 'pending' : 'accepted',
                          )
                        }
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                <MessageSquare size={16} className="mr-2" />
                Notes
              </h4>
              <div className="space-y-2 mb-3">
                {selectedMeeting.notes.length === 0 && (
                  <p className="text-sm text-gray-400">Aucune note</p>
                )}
                {selectedMeeting.notes.map((n) => (
                  <div key={n.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getEmployeeName(n.authorId)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {n.createdAt.toLocaleDateString('fr-FR')}{' '}
                        {n.createdAt.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{n.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  placeholder="Ajouter une note..."
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm self-end"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                <ListTodo size={16} className="mr-2" />
                Tâches
              </h4>
              <div className="space-y-2 mb-3">
                {selectedMeeting.tasks.length === 0 && (
                  <p className="text-sm text-gray-400">Aucune tâche</p>
                )}
                {selectedMeeting.tasks.map((t) => {
                  const assignee = t.assignedTo ? getEmployeeById(t.assignedTo) : null;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={t.status === 'completed'}
                          onChange={() =>
                            handleUpdateTask(
                              t.id,
                              t.status === 'completed' ? 'pending' : 'completed',
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p
                            className={cn(
                              'text-sm',
                              t.status === 'completed'
                                ? 'line-through text-gray-400'
                                : 'text-gray-700 dark:text-gray-300',
                            )}
                          >
                            {t.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'} ·{' '}
                            {t.deadline ? t.deadline.toLocaleDateString('fr-FR') : 'Pas de date'}
                          </p>
                        </div>
                      </div>
                      <select
                        value={t.status}
                        onChange={(e) =>
                          handleUpdateTask(t.id, e.target.value as MeetingTask['status'])
                        }
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                      >
                        <option value="pending">À faire</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminée</option>
                      </select>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Titre de la tâche"
                  className="md:col-span-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Assigner à</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title || !newTask.assignedTo || !newTask.deadline}
                  className="md:col-span-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Nouvelle tâche
                </button>
              </div>
            </div>

            {selectedMeeting.summary && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  Résumé IA
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  {selectedMeeting.summary}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
