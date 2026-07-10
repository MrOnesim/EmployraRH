import { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Upload, Search, Folder, Download,
  Eye, Trash2, X, File, User
} from 'lucide-react';

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', category: '', type: 'other' });

  const categories = ['all', 'Contrats', 'Certificats', 'Rapports', 'Politiques', 'Autres'];
  const typeIcons: Record<string, typeof File> = {
    contract: File,
    certificate: File,
    report: File,
    policy: File,
    other: File
  };
  const typeColors: Record<string, string> = {
    contract: 'bg-blue-50 text-blue-600',
    certificate: 'bg-green-50 text-green-600',
    report: 'bg-purple-50 text-purple-600',
    policy: 'bg-orange-50 text-orange-600',
    other: 'bg-gray-50 text-gray-600'
  };
  const typeLabels: Record<string, string> = {
    contract: 'Contrat',
    certificate: 'Certificat',
    report: 'Rapport',
    policy: 'Politique',
    other: 'Autre'
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = () => {
    if (!uploadData.name) return;
    addDocument({
      name: uploadData.name,
      type: uploadData.type,
      department: 'Ressources Humaines',
      uploadedBy: 'Kofi Mensah',
      uploadedAt: new Date(),
      size: '1.0 MB',
      category: uploadData.category || 'Autres'
    });
    setUploadData({ name: '', category: '', type: 'other' });
    setShowUploadModal(false);
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
  };

  const categoryStats = categories.filter(c => c !== 'all').map(cat => ({
    name: cat,
    count: documents.filter(d => d.category === cat).length
  })).filter(s => s.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documents RH</h1>
          <p className="text-gray-500">Gérez les documents de votre entreprise</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
            <Download size={18} />
            <span>Exporter</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Upload size={18} />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categoryStats.map((stat, i) => (
          <button
            key={i}
            onClick={() => setCategoryFilter(stat.name)}
            className={`p-4 rounded-xl border transition-colors ${
              categoryFilter === stat.name 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-100 bg-white hover:border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Folder size={16} className={categoryFilter === stat.name ? 'text-blue-600' : 'text-gray-400'} />
              <span className="text-sm font-medium text-gray-700">{stat.name}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'Toutes les catégories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const IconComp = typeIcons[doc.type];
          return (
            <div key={doc.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${typeColors[doc.type]}`}>
                  <IconComp size={24} />
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <Eye size={16} className="text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <Download size={16} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-gray-800 mb-1 truncate">{doc.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{typeLabels[doc.type]} • {doc.category}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{doc.size}</span>
                <span>{doc.uploadedAt.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center mt-2 pt-2 border-t border-gray-50">
                <User size={12} className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">{doc.uploadedBy}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Folder size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun document trouvé</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Télécharger un document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du document *</label>
                <input
                  type="text"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                  placeholder="Nom du document.pdf"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionner</option>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="contract">Contrat</option>
                  <option value="certificate">Certificat</option>
                  <option value="report">Rapport</option>
                  <option value="policy">Politique</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Glissez un fichier ici ou cliquez pour parcourir</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS (max 10MB)</p>
              </div>
              <button
                onClick={handleUpload}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
