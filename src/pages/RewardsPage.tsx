import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Gift, Trophy, Star, Coins, ShoppingBag, Plus, X } from 'lucide-react';
import Badge from '../components/Badge';

const CATEGORY_LABELS: Record<string, string> = {
  bonus: 'Prime',
  gift: 'Cadeau',
  advantage: 'Avantage',
  training: 'Formation',
};

const CATEGORY_COLORS: Record<string, string> = {
  bonus: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  gift: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  advantage: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  training: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
};

export default function RewardsPage() {
  const { currentUser, addNotification } = useApp();
  const { rewardTransactions, rewardCatalog, addRewardTransaction, redeemReward, employees } = useData();
  const { addToast } = useToast();
  const [tab, setTab] = useState<'history' | 'catalog'>('history');
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardEmployeeId, setAwardEmployeeId] = useState('');
  const [awardPoints, setAwardPoints] = useState('');
  const [awardReason, setAwardReason] = useState('');

  const myTxns = rewardTransactions.filter((t) => t.employeeId === currentUser?.id);
  const totalEarned = myTxns.filter((t) => t.type === 'earned').reduce((s, t) => s + t.points, 0);
  const totalRedeemed = myTxns.filter((t) => t.type === 'redeemed').reduce((s, t) => s + t.points, 0);
  const balance = totalEarned - totalRedeemed;

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleRedeem = (itemId: string) => {
    if (!currentUser) return;
    const item = rewardCatalog.find((c) => c.id === itemId);
    if (!item) return;
    if (item.stock <= 0) {
      addToast('Article en rupture de stock', 'error');
      return;
    }
    if (balance < item.pointsCost) {
      addToast('Points insuffisants', 'error');
      return;
    }
    redeemReward(currentUser.id, itemId);
    addToast(`${item.name} échangé avec succès`, 'success');
  };

  const handleAward = () => {
    if (!awardEmployeeId || !awardPoints || !awardReason) return;
    const pts = parseInt(awardPoints, 10);
    if (isNaN(pts) || pts <= 0) {
      addToast('Montant de points invalide', 'error');
      return;
    }
    addRewardTransaction({ employeeId: awardEmployeeId, points: pts, type: 'earned', reason: awardReason });
    addNotification({ userId: awardEmployeeId, title: 'Points récompense', message: `Vous avez reçu ${pts} points : ${awardReason}`, type: 'payslip', read: false });
    addToast(`${pts} points attribués`, 'success');
    setShowAwardModal(false);
    setAwardEmployeeId('');
    setAwardPoints('');
    setAwardReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Système de récompenses</h1>
          <p className="text-gray-500 dark:text-gray-400">Gagnez et échangez vos points de récompense</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAwardModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus size={18} /><span>Attribuer des points</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
            <Trophy size={32} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Votre solde de points</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{balance.toLocaleString()} pts</p>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center"><Coins size={14} className="mr-1 text-green-500" />{totalEarned.toLocaleString()} gagnés</span>
              <span className="flex items-center"><ShoppingBag size={14} className="mr-1 text-red-500" />{totalRedeemed.toLocaleString()} échangés</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('history')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Star size={18} /><span>Historique</span>
        </button>
        <button
          onClick={() => setTab('catalog')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'catalog' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Gift size={18} /><span>Catalogue</span>
        </button>
      </div>

      {tab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Points</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Raison</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {myTxns.slice().reverse().map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${tx.type === 'earned' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.type === 'earned' ? '+' : '-'}{tx.points}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === 'earned' ? 'green' : 'red'}>{tx.type === 'earned' ? 'Gagnés' : 'Échangés'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{tx.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {myTxns.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">Aucune transaction de récompense.</div>
          )}
        </div>
      )}

      {tab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewardCatalog.filter((item) => item.active).map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${CATEGORY_COLORS[item.category] || 'text-gray-600 bg-gray-100 dark:bg-gray-700'}`}>
                  <Gift size={20} />
                </div>
                <Badge variant={item.stock > 0 ? 'green' : 'red'}>{item.stock > 0 ? `Stock: ${item.stock}` : 'Rupture'}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="flex items-center text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  <Coins size={18} className="mr-1" />{item.pointsCost}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{CATEGORY_LABELS[item.category] || item.category}</span>
              </div>
              <button
                onClick={() => handleRedeem(item.id)}
                disabled={item.stock <= 0 || balance < item.pointsCost}
                className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <ShoppingBag size={16} /><span>Échanger</span>
              </button>
            </div>
          ))}
          {rewardCatalog.filter((item) => item.active).length === 0 && (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700">
              Aucun article disponible dans le catalogue.
            </div>
          )}
        </div>
      )}

      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Attribuer des points</h2>
              <button onClick={() => setShowAwardModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employé</label>
                <select value={awardEmployeeId} onChange={(e) => setAwardEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Sélectionner un employé</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.position}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                <input type="number" value={awardPoints} onChange={(e) => setAwardPoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 100" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raison</label>
                <input type="text" value={awardReason} onChange={(e) => setAwardReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Performance exceptionnelle" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button onClick={() => setShowAwardModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">Annuler</button>
                <button onClick={handleAward}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Attribuer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
