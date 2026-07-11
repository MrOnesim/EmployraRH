import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  Briefcase,
  MapPin,
  Star,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  Users,
  Clock,
} from 'lucide-react';
import type { JobPost } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const JOB_TYPE_LABELS: Record<string, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  stage: 'Stage',
  freelance: 'Freelance',
};

const STATUS_MAP: Record<string, { variant: 'green' | 'red'; label: string }> = {
  published: { variant: 'green', label: 'Publiée' },
  closed: { variant: 'red', label: 'Fermée' },
};

const JOB_CATEGORIES = [
  'Informatique',
  'Marketing',
  'Finance',
  'Ressources Humaines',
  'Ventes',
  'Opérations',
  'Juridique',
  'Autre',
];

export default function MarketplacePage() {
  const { currentCompany } = useApp();
  const { jobPosts, addJobPost, updateJobPost, deleteJobPost } = useData();
  const { addToast } = useToast();
  const [tab, setTab] = useState<'published' | 'market'>('published');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    company: currentCompany?.name || '',
    companyId: currentCompany?.id || '',
    description: '',
    requirements: '',
    location: '',
    type: 'CDI' as JobPost['type'],
    salary: '',
    category: '',
    status: 'published' as JobPost['status'],
    featured: false,
    views: 0,
    applications: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const myPosts = jobPosts.filter((p) => p.companyId === currentCompany?.id);

  const filteredMarket = jobPosts.filter((p) => {
    if (p.status !== 'published') return false;
    if (
      search &&
      !p.title.toLowerCase().includes(search.toLowerCase()) &&
      !p.company.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    return true;
  });

  const handleCreate = () => {
    if (!form.title || !form.description) return;
    if (editingPostId) {
      updateJobPost(editingPostId, form);
    } else {
      addJobPost({
        ...form,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    setEditingPostId(null);
    setForm({
      title: '',
      company: currentCompany?.name || '',
      companyId: currentCompany?.id || '',
      description: '',
      requirements: '',
      location: '',
      type: 'CDI',
      salary: '',
      category: '',
      status: 'published',
      featured: false,
      views: 0,
      applications: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    setShowCreate(false);
    addToast(editingPostId ? 'Offre mise à jour' : 'Offre publiée avec succès', 'success');
  };

  const handleToggleStatus = (post: JobPost) => {
    const next = post.status === 'published' ? 'closed' : 'published';
    updateJobPost(post.id, { status: next });
    addToast(next === 'published' ? 'Offre réactivée' : 'Offre fermée', 'success');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    deleteJobPost(id);
    addToast('Offre supprimée', 'success');
  };

  const handleToggleFeatured = (post: JobPost) => {
    updateJobPost(post.id, { featured: !post.featured });
    addToast(post.featured ? 'Annonce non mise en avant' : 'Annonce mise en avant', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Marché emploi</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Publiez et découvrez les offres d'emploi dans le monde entier
          </p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('published')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'published'
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Briefcase size={18} />
          <span>Offres publiées</span>
        </button>
        <button
          onClick={() => setTab('market')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'market'
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Users size={18} />
          <span>Marché emploi</span>
        </button>
      </div>

      {tab === 'published' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              <button
                onClick={() => {
                  setForm({
                    ...form,
                    title: '',
                    description: '',
                    requirements: '',
                    location: '',
                    salary: '',
                    category: '',
                    type: 'CDI',
                    featured: false,
                  });
                  setShowCreate(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span>Publier une offre</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {myPosts.map((post) => {
              const s = STATUS_MAP[post.status];
              return (
                <div
                  key={post.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border hover:shadow-md transition-all ${post.featured ? 'border-yellow-400 dark:border-yellow-500' : 'border-gray-100 dark:border-gray-700'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {post.title}
                        </h3>
                        <Badge variant={s.variant}>{s.label}</Badge>
                        {post.featured && (
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {post.location}
                        </span>
                        <Badge variant="blue">{post.type}</Badge>
                        <span>{post.salary} FCFA</span>
                        <span className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          {post.views} vues
                        </span>
                        <span className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {post.applications} candidatures
                        </span>
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {post.status === 'published' ? 'Fermer' : 'Publier'}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`p-2 rounded-lg transition-colors ${post.featured ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                      >
                        <Star size={18} className={post.featured ? 'fill-yellow-500' : ''} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPostId(post.id);
                          setForm({
                            title: post.title,
                            company: post.company,
                            companyId: post.companyId,
                            description: post.description,
                            requirements: post.requirements,
                            location: post.location,
                            type: post.type,
                            salary: post.salary,
                            category: post.category,
                            status: post.status,
                            featured: post.featured,
                            views: post.views,
                            applications: post.applications,
                            expiresAt: post.expiresAt,
                          });
                          setShowCreate(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {myPosts.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700">
                Aucune offre publiée
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'market' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou entreprise..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Toutes catégories</option>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Tous types</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="stage">Stage</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarket.map((post) => (
              <div
                key={post.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border hover:shadow-md transition-all ${post.featured ? 'border-yellow-400 dark:border-yellow-500 ring-1 ring-yellow-400' : 'border-gray-100 dark:border-gray-700'}`}
              >
                {post.featured && (
                  <div className="flex items-center space-x-1 text-yellow-500 text-xs font-semibold mb-2">
                    <Star size={14} className="fill-yellow-500" />
                    <span>Annonce en vedette</span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {post.title}
                  </h3>
                  <Badge variant="blue">{JOB_TYPE_LABELS[post.type] || post.type}</Badge>
                </div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  {post.company}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-3">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  {post.location}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {post.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {post.salary} FCFA
                  </span>
                  {post.category && <Badge variant="gray">{post.category}</Badge>}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span className="flex items-center">
                    <Eye size={14} className="mr-1" />
                    {post.views} vues
                  </span>
                  <span className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {post.applications} candidatures
                  </span>
                </div>
              </div>
            ))}
            {filteredMarket.length === 0 && (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700">
                Aucune offre disponible sur le marché
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        open={showCreate}
        onClose={() => {
          setEditingPostId(null);
          setShowCreate(false);
        }}
        title="Publier une offre d'emploi"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Ex: Développeur Full Stack"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Description du poste..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prérequis
              </label>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Compétences et prérequis..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Localisation
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Ex: Abidjan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de contrat
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as JobPost['type'] })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="stage">Stage</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salaire (FCFA)
              </label>
              <input
                type="text"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Ex: 500 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="">Sélectionner</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Annonce en vedette
                </span>
                <Star size={14} className="text-yellow-500" />
              </label>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => {
                setEditingPostId(null);
                setShowCreate(false);
              }}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
            >
              Publier l'offre
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
