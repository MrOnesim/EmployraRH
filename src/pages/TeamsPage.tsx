import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import { Users, Plus, Trash2, Edit3 } from 'lucide-react';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

export default function TeamsPage() {
  const { teams, employees, addTeam, updateTeam, deleteTeam } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', leaderId: '', memberIds: [] as string[] });

  const activeEmployees = employees.filter((e) => e.status === 'active');

  const handleCreate = () => {
    if (!form.name.trim()) return;
    try {
      addTeam({ name: form.name, description: form.description, leaderId: form.leaderId || activeEmployees[0]?.id || '', memberIds: form.memberIds });
      setForm({ name: '', description: '', leaderId: '', memberIds: [] });
      setShowCreate(false);
      addToast('Équipe créée', 'success');
    } catch {
      addToast("Erreur lors de la création de l'équipe", 'error');
    }
  };

  const handleUpdate = (id: string) => {
    if (!form.name.trim()) return;
    try {
      updateTeam(id, { name: form.name, description: form.description, leaderId: form.leaderId, memberIds: form.memberIds });
      setEditId(null);
      addToast('Équipe mise à jour', 'success');
    } catch {
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const startEdit = (team: typeof teams[0]) => {
    setForm({ name: team.name, description: team.description, leaderId: team.leaderId, memberIds: [...team.memberIds] });
    setEditId(team.id);
  };

  const getEmployee = (id: string) => employees.find((e) => e.id === id);

  const toggleMember = (id: string) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id) ? prev.memberIds.filter((m) => m !== id) : [...prev.memberIds, id],
    }));
  };

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Équipes</h1>
          <p className="text-gray-500">Gérez les équipes de votre entreprise</p>
        </div>
        <button onClick={() => { setForm({ name: '', description: '', leaderId: '', memberIds: [] }); setShowCreate(true); }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={18} /><span>Nouvelle équipe</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const leader = getEmployee(team.leaderId);
          return (
            <div key={team.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{team.name}</h3>
                    <p className="text-xs text-gray-500">{team.memberIds.length} membre(s)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => startEdit(team)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit3 size={14} className="text-gray-400" /></button>
                  <button onClick={() => { try { deleteTeam(team.id); addToast('Équipe supprimée', 'success'); } catch { addToast('Erreur lors de la suppression', 'error'); } }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-gray-400 hover:text-red-500" /></button>
                </div>
              </div>
              {team.description && <p className="text-sm text-gray-500 mb-3">{team.description}</p>}
              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2">
                <span>Responsable : {leader ? `${leader.firstName} ${leader.lastName}` : '-'}</span>
                <button onClick={() => setShowMembers(showMembers === team.id ? null : team.id)} className="text-blue-600 hover:text-blue-700 font-medium">
                  {showMembers === team.id ? 'Masquer' : 'Voir les membres'}
                </button>
              </div>
              {showMembers === team.id && (
                <div className="mt-3 space-y-1.5 border-t border-gray-50 pt-2">
                  {team.memberIds.length === 0 && <p className="text-xs text-gray-400">Aucun membre</p>}
                  {team.memberIds.map((mid) => {
                    const emp = getEmployee(mid);
                    if (!emp) return null;
                    return (
                      <div key={mid} className="flex items-center space-x-2">
                        <Avatar firstName={emp.firstName} lastName={emp.lastName} />
                        <span className="text-sm text-gray-700">{emp.firstName} {emp.lastName}</span>
                        {emp.id === team.leaderId && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Responsable</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={showCreate || editId !== null} onClose={() => { setShowCreate(false); setEditId(null); }} title={editId ? 'Modifier l\'équipe' : 'Nouvelle équipe'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nom de l'équipe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <select value={form.leaderId} onChange={(e) => setForm({ ...form, leaderId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Sélectionner</option>
              {activeEmployees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Membres</label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-gray-200 rounded-lg p-2">
              {activeEmployees.map((e) => (
                <label key={e.id} className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" checked={form.memberIds.includes(e.id)} onChange={() => toggleMember(e.id)} className="rounded border-gray-300" />
                  <Avatar firstName={e.firstName} lastName={e.lastName} />
                  <span className="text-sm text-gray-700">{e.firstName} {e.lastName}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => { setShowCreate(false); setEditId(null); }} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">Annuler</button>
            <button onClick={() => editId ? handleUpdate(editId) : handleCreate()}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700">{editId ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
