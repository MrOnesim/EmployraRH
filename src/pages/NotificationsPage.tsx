import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCheck, Filter, BellOff } from 'lucide-react';
import { usePageLoading } from '../hooks/usePageLoading';
import { useToast } from '../context/ToastContext';
import { LoadingScreen } from '../components/ui';

const TYPE_LABELS: Record<string, string> = {
  invitation: 'Invitation', payment: 'Paiement', leave: 'Congé',
  attendance: 'Présence', payslip: 'Bulletin de paie', recruitment: 'Recrutement',
  objective: 'Objectif', review: 'Évaluation', contract: 'Contrat', document: 'Document',
};

const TYPE_COLORS: Record<string, string> = {
  invitation: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  payment: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  leave: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  attendance: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
  payslip: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
  recruitment: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  objective: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
  review: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
  contract: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300',
  document: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
};

export default function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const loading = usePageLoading();
  const { addToast } = useToast();

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const filtered = filter === 'unread' ? userNotifications.filter(n => !n.read) : userNotifications;

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {userNotifications.filter(n => !n.read).length} non lues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter(f => f === 'all' ? 'unread' : 'all')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Filter size={16} />
            {filter === 'all' ? 'Toutes' : 'Non lues'}
          </button>
          {userNotifications.some(n => !n.read) && (
            <button
              onClick={() => { try { markAllNotificationsRead(); } catch { addToast("Erreur lors du marquage des notifications", 'error'); } }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck size={16} />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
          <BellOff size={48} className="mb-4" />
          <p className="text-lg font-medium">Aucune notification</p>
          <p className="text-sm mt-1">
            {filter === 'unread' ? 'Toutes les notifications sont lues.' : 'Vous n\'avez pas encore de notifications.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => { try { markNotificationRead(n.id); } catch { addToast("Erreur lors du marquage de la notification", 'error'); } }}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer transition-colors ${
                n.read
                  ? 'border-gray-100 dark:border-gray-700'
                  : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
              } hover:bg-gray-50 dark:hover:bg-gray-750`}
            >
              <div className="flex items-start gap-4">
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium mt-0.5 ${TYPE_COLORS[n.type] || TYPE_COLORS.document}`}>
                  {TYPE_LABELS[n.type] || n.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={`text-sm ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100 font-semibold'}`}>
                      {n.title}
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
