import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageLoading } from '../hooks/usePageLoading';
import { LoadingScreen } from '../components/ui';
import { Briefcase, Users, Plus, Edit2, Trash2, Search, Filter, Eye, Mail, Phone, Calendar as CalIcon } from 'lucide-react';
import type { JobOffer, Candidate, CandidateStatus } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const STATUS_MAP: Record<string, { variant: 'green' | 'red' | 'gray'; label: string }> = {
  open: { variant: 'green', label: 'Ouvert' },
  closed: { variant: 'red', label: 'Fermé' },
  draft: { variant: 'gray', label: 'Brouillon' },
};

const CANDIDATE_STATUS_MAP: Record<CandidateStatus, { variant: 'yellow' | 'blue' | 'green' | 'red'; label: string }> = {
  received: { variant: 'yellow', label: 'Reçu' },
  interview: { variant: 'blue', label: 'Entretien' },
  accepted: { variant: 'green', label: 'Accepté' },
  rejected: { variant: 'red', label: 'Refusé' },
};

export default function RecruitmentPage() {
  const { jobOffers, candidates, addJobOffer, updateJobOffer, deleteJobOffer, addCandidate, updateCandidate } = useData();
  const { addToast } = useToast();
  const loading = usePageLoading();
  const [tab, setTab] = useState<'offers' | 'candidates' | 'pipeline'>('offers');
  const [search, setSearch] = useState('');
  const [offerFilter, setOfferFilter] = useState('');

  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showEditOffer, setShowEditOffer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateJobOfferId, setCandidateJobOfferId] = useState('');
  const [showDetailCandidate, setShowDetailCandidate] = useState<Candidate | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const [offerForm, setOfferForm] = useState({
    title: '', department: '', description: '', requirements: '',
    salary: 0, location: '', type: 'CDI' as JobOffer['type'], status: 'draft' as JobOffer['status'],
  });

  const [candidateForm, setCandidateForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', coverLetter: '', resumeUrl: '',
  });

  const filteredOffers = jobOffers.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.department.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCandidates = candidates.filter((c) => {
    if (!offerFilter) return true;
    return c.jobOfferId === offerFilter;
  });

  const handleCreateOffer = () => {
    if (!offerForm.title || !offerForm.department) return;
    try {
      addJobOffer({
        title: offerForm.title,
        department: offerForm.department,
        description: offerForm.description,
        requirements: offerForm.requirements,
        salary: offerForm.salary,
        location: offerForm.location,
        type: offerForm.type,
        status: offerForm.status,
        createdBy: '',
      });
      setOfferForm({ title: '', department: '', description: '', requirements: '', salary: 0, location: '', type: 'CDI', status: 'draft' });
      setShowCreateOffer(false);
      addToast('Offre créée avec succès', 'success');
    } catch {
      addToast("Erreur lors de la création de l'offre", 'error');
    }
  };

  const handleEditOffer = () => {
    if (!selectedOffer) return;
    try {
      updateJobOffer(selectedOffer, {
        title: offerForm.title,
        department: offerForm.department,
        description: offerForm.description,
        requirements: offerForm.requirements,
        salary: offerForm.salary,
        location: offerForm.location,
        type: offerForm.type,
        status: offerForm.status,
      });
      setShowEditOffer(false);
      setSelectedOffer(null);
      addToast('Offre modifiée avec succès', 'success');
    } catch {
      addToast("Erreur lors de la modification de l'offre", 'error');
    }
  };

  const handleDeleteOffer = (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
    try {
      deleteJobOffer(id);
      addToast('Offre supprimée', 'success');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const openEditOffer = (offer: JobOffer) => {
    setSelectedOffer(offer.id);
    setOfferForm({
      title: offer.title,
      department: offer.department,
      description: offer.description,
      requirements: offer.requirements,
      salary: offer.salary,
      location: offer.location,
      type: offer.type,
      status: offer.status,
    });
    setShowEditOffer(true);
  };

  const handleAddCandidate = () => {
    if (!candidateForm.firstName || !candidateForm.lastName || !candidateForm.email) return;
    try {
      addCandidate({
        jobOfferId: candidateJobOfferId,
        firstName: candidateForm.firstName,
        lastName: candidateForm.lastName,
        email: candidateForm.email,
        phone: candidateForm.phone,
        status: 'received',
        resumeUrl: candidateForm.resumeUrl || undefined,
        coverLetter: candidateForm.coverLetter || undefined,
      });
      setCandidateForm({ firstName: '', lastName: '', email: '', phone: '', coverLetter: '', resumeUrl: '' });
      setShowCandidateModal(false);
      addToast('Candidat ajouté avec succès', 'success');
    } catch {
      addToast("Erreur lors de l'ajout du candidat", 'error');
    }
  };

  const handleUpdateStatus = (candidateId: string, status: string) => {
    try {
      updateCandidate(candidateId, { status: status as CandidateStatus });
      addToast('Statut mis à jour', 'success');
    } catch {
      addToast('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleScheduleInterview = () => {
    if (!interviewCandidate || !interviewDate) return;
    try {
      updateCandidate(interviewCandidate.id, {
        status: 'interview',
        interviewDate: new Date(interviewDate),
        notes: interviewNotes || interviewCandidate.notes,
      });
      setShowInterviewModal(false);
      setInterviewCandidate(null);
      setInterviewDate('');
      setInterviewNotes('');
      addToast('Entretien programmé', 'success');
    } catch {
      addToast("Erreur lors de la programmation de l'entretien", 'error');
    }
  };

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recrutement</h1>
          <p className="text-gray-500">Gérez vos offres d'emploi et candidatures</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('offers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'offers' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Briefcase size={18} /><span>Offres d'emploi</span>
        </button>
        <button
          onClick={() => setTab('candidates')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'candidates' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Users size={18} /><span>Candidatures</span>
        </button>
        <button
          onClick={() => setTab('pipeline')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'pipeline' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Filter size={18} /><span>Pipeline</span>
        </button>
      </div>

      {tab === 'offers' && (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Rechercher une offre..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <button onClick={() => { setOfferForm({ title: '', department: '', description: '', requirements: '', salary: 0, location: '', type: 'CDI', status: 'draft' }); setShowCreateOffer(true); }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Plus size={18} /><span>Nouvelle offre</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOffers.map((offer) => {
              const s = STATUS_MAP[offer.status];
              const count = candidates.filter((c) => c.jobOfferId === offer.id).length;
              return (
                <div key={offer.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>{offer.department}</span>
                        <span>{offer.type}</span>
                        <span>{offer.location}</span>
                        <span>{offer.salary?.toLocaleString()} FCFA</span>
                        <span className="flex items-center">
                          <Users size={14} className="mr-1" />{count} candidat(s)
                        </span>
                      </div>
                      {offer.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{offer.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setCandidateJobOfferId(offer.id); setCandidateForm({ firstName: '', lastName: '', email: '', phone: '', coverLetter: '', resumeUrl: '' }); setShowCandidateModal(true); }}
                        className="flex items-center space-x-1 text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                        <Plus size={16} /><span>Candidat</span>
                      </button>
                      <button onClick={() => openEditOffer(offer)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteOffer(offer.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredOffers.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                Aucune offre d'emploi trouvée
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'candidates' && (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select value={offerFilter} onChange={(e) => setOfferFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Toutes les offres</option>
                  {jobOffers.map((o) => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCandidates.map((candidate) => {
              const offer = jobOffers.find((o) => o.id === candidate.jobOfferId);
              const s = CANDIDATE_STATUS_MAP[candidate.status];
              return (
                <div key={candidate.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center"><Mail size={14} className="mr-1" />{candidate.email}</span>
                        {candidate.phone && <span className="flex items-center"><Phone size={14} className="mr-1" />{candidate.phone}</span>}
                        <span className="flex items-center"><CalIcon size={14} className="mr-1" />{new Date(candidate.appliedAt).toLocaleDateString()}</span>
                        {offer && <span className="text-blue-600">Offre : {offer.title}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select value={candidate.status} onChange={(e) => handleUpdateStatus(candidate.id, e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        {Object.entries(CANDIDATE_STATUS_MAP).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                      <button onClick={() => { setInterviewCandidate(candidate); setInterviewDate(''); setInterviewNotes(''); setShowInterviewModal(true); }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                        <CalIcon size={14} /><span>Entretien</span>
                      </button>
                      <button onClick={() => setShowDetailCandidate(candidate)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredCandidates.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                Aucune candidature trouvée
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['received', 'interview', 'accepted', 'rejected'] as const).map(statusKey => {
            const s = CANDIDATE_STATUS_MAP[statusKey];
            const items = candidates
              .filter(c => c.status === statusKey)
              .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
            return (
              <div key={statusKey} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      statusKey === 'received' ? 'bg-yellow-400' :
                      statusKey === 'interview' ? 'bg-blue-400' :
                      statusKey === 'accepted' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{s.label}</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {items.map(candidate => {
                    const offer = jobOffers.find(o => o.id === candidate.jobOfferId);
                    return (
                      <div key={candidate.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-600 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setShowDetailCandidate(candidate)}
                      >
                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{candidate.firstName} {candidate.lastName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{offer?.title || 'Offre inconnue'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{new Date(candidate.appliedAt).toLocaleDateString()}</span>
                          {candidate.interviewDate && (
                            <span className="text-xs text-blue-500 font-medium">{new Date(candidate.interviewDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6">Aucun candidat</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interview Modal */}
      <Modal open={showInterviewModal} onClose={() => setShowInterviewModal(false)} title="Programmer un entretien" maxWidth="md">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Candidat</p>
            <p className="font-medium text-gray-800">{interviewCandidate?.firstName} {interviewCandidate?.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure de l'entretien *</label>
            <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes pour l'entretien</label>
            <textarea value={interviewNotes} onChange={e => setInterviewNotes(e.target.value)}
              rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Questions à poser, points à évaluer..." />
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setShowInterviewModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">Annuler</button>
            <button onClick={handleScheduleInterview} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700">Programmer</button>
          </div>
        </div>
      </Modal>

      <Modal open={showCreateOffer} onClose={() => setShowCreateOffer(false)} title="Nouvelle offre d'emploi" maxWidth="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Développeur Full Stack" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <input type="text" value={offerForm.department} onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Informatique" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
              <select value={offerForm.type} onChange={(e) => setOfferForm({ ...offerForm, type: e.target.value as JobOffer['type'] })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="stage">Stage</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (FCFA)</label>
              <input type="number" value={offerForm.salary} onChange={(e) => setOfferForm({ ...offerForm, salary: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input type="text" value={offerForm.location} onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Abidjan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={offerForm.status} onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value as JobOffer['status'] })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="draft">Brouillon</option>
                <option value="open">Ouvert</option>
                <option value="closed">Fermé</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
              rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Description du poste..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label>
            <textarea value={offerForm.requirements} onChange={(e) => setOfferForm({ ...offerForm, requirements: e.target.value })}
              rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Compétences et prérequis..." />
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setShowCreateOffer(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">Annuler</button>
            <button onClick={handleCreateOffer} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700">Créer l'offre</button>
          </div>
        </div>
      </Modal>

      <Modal open={showEditOffer} onClose={() => setShowEditOffer(false)} title="Modifier l'offre d'emploi" maxWidth="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input type="text" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <input type="text" value={offerForm.department} onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
              <select value={offerForm.type} onChange={(e) => setOfferForm({ ...offerForm, type: e.target.value as JobOffer['type'] })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="stage">Stage</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (FCFA)</label>
              <input type="number" value={offerForm.salary} onChange={(e) => setOfferForm({ ...offerForm, salary: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input type="text" value={offerForm.location} onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={offerForm.status} onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value as JobOffer['status'] })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="draft">Brouillon</option>
                <option value="open">Ouvert</option>
                <option value="closed">Fermé</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
              rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label>
            <textarea value={offerForm.requirements} onChange={(e) => setOfferForm({ ...offerForm, requirements: e.target.value })}
              rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setShowEditOffer(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">Annuler</button>
            <button onClick={handleEditOffer} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <Modal open={showCandidateModal} onClose={() => setShowCandidateModal(false)} title="Ajouter un candidat" maxWidth="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input type="text" value={candidateForm.firstName} onChange={(e) => setCandidateForm({ ...candidateForm, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" value={candidateForm.lastName} onChange={(e) => setCandidateForm({ ...candidateForm, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={candidateForm.email} onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" value={candidateForm.phone} onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL CV</label>
            <input type="url" value={candidateForm.resumeUrl} onChange={(e) => setCandidateForm({ ...candidateForm, resumeUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lettre de motivation</label>
            <textarea value={candidateForm.coverLetter} onChange={(e) => setCandidateForm({ ...candidateForm, coverLetter: e.target.value })}
              rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setShowCandidateModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">Annuler</button>
            <button onClick={handleAddCandidate} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700">Ajouter le candidat</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!showDetailCandidate} onClose={() => setShowDetailCandidate(null)} title="Détails du candidat">
        {showDetailCandidate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-medium text-gray-800">{showDetailCandidate.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium text-gray-800">{showDetailCandidate.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{showDetailCandidate.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-800">{showDetailCandidate.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium text-gray-800">{CANDIDATE_STATUS_MAP[showDetailCandidate.status]?.label}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de candidature</p>
                <p className="font-medium text-gray-800">{new Date(showDetailCandidate.appliedAt).toLocaleDateString()}</p>
              </div>
            </div>
            {showDetailCandidate.coverLetter && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Lettre de motivation</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{showDetailCandidate.coverLetter}</p>
              </div>
            )}
            {showDetailCandidate.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{showDetailCandidate.notes}</p>
              </div>
            )}
            {showDetailCandidate.resumeUrl && (
              <a href={showDetailCandidate.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                <Eye size={16} /><span>Voir le CV</span>
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
