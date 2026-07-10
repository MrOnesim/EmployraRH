import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { FileSignature, Send, Plus, X, FileText, CheckCircle, Ban, AlertTriangle } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const STATUS_CONFIG: Record<string, { label: string; variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }> = {
  draft: { label: 'Brouillon', variant: 'gray' },
  sent: { label: 'Envoyé', variant: 'blue' },
  signed: { label: 'Signé', variant: 'yellow' },
  completed: { label: 'Complété', variant: 'green' },
  rejected: { label: 'Rejeté', variant: 'red' },
  expired: { label: 'Expiré', variant: 'gray' },
};

const RECIPIENT_STATUS_CONFIG: Record<string, { label: string; variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }> = {
  pending: { label: 'En attente', variant: 'gray' },
  viewed: { label: 'Vu', variant: 'blue' },
  signed: { label: 'Signé', variant: 'green' },
  rejected: { label: 'Rejeté', variant: 'red' },
};

const DTYPE_LABELS: Record<string, string> = {
  contract: 'Contrat', amendment: 'Avenant', policy: 'Politique', nda: 'NDA', internal: 'Interne', other: 'Autre',
};

export default function SignaturePage() {
  const { currentUser } = useApp();
  const { signatureRequests, signatureTemplates, sendSignatureRequest, signSignatureRequest, rejectSignature, addSignatureTemplate, deleteSignatureTemplate, employees } = useData();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'requests' | 'templates'>('requests');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formDocName, setFormDocName] = useState('');
  const [formDocType, setFormDocType] = useState<string>('contract');
  const [formRecipients, setFormRecipients] = useState<string[]>([]);
  const [formMessage, setFormMessage] = useState('');

  const [rejectReason, setRejectReason] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplDocType, setTplDocType] = useState('contract');
  const [tplContent, setTplContent] = useState('');

  const filteredRequests = filterStatus === 'all'
    ? signatureRequests
    : signatureRequests.filter(r => r.status === filterStatus);

  const pendingForCurrentUser = signatureRequests.filter(
    req => req.recipients.some(r => r.employeeId === currentUser?.id && r.status === 'pending') && req.status === 'sent'
  );

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e40af';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) setSignatureData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleSend = () => {
    if (!formDocName || formRecipients.length === 0) {
      addToast('Veuillez remplir tous les champs requis', 'error');
      return;
    }
    const recipients = formRecipients.map(id => {
      const emp = employees.find(e => e.id === id);
      return { employeeId: id, name: emp ? `${emp.firstName} ${emp.lastName}` : id, email: emp?.email || '', status: 'pending' as const };
    });
    sendSignatureRequest({
      documentName: formDocName,
      documentType: formDocType as any,
      initiatedBy: currentUser?.id || '',
      initiatedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
      recipients,
      message: formMessage || undefined,
      documentId: undefined,
      expiresAt: undefined,
    });
    addToast('Demande de signature envoyée', 'success');
    setShowSendModal(false);
    setFormDocName(''); setFormDocType('contract'); setFormRecipients([]); setFormMessage('');
  };

  const handleSign = () => {
    if (!signatureData || !showSignModal) return;
    signSignatureRequest(showSignModal, currentUser?.id || '', signatureData);
    addToast('Document signé avec succès', 'success');
    setShowSignModal(null);
    setSignatureData('');
    clearCanvas();
  };

  const handleReject = () => {
    if (!rejectReason || !showRejectModal) return;
    rejectSignature(showRejectModal, currentUser?.id || '', rejectReason);
    addToast('Signature refusée', 'info');
    setShowRejectModal(null);
    setRejectReason('');
  };

  const handleAddTemplate = () => {
    if (!tplName) { addToast('Veuillez donner un nom au modèle', 'error'); return; }
    addSignatureTemplate({ name: tplName, description: tplDesc, documentType: tplDocType, content: tplContent, placeholders: [] });
    addToast('Modèle ajouté', 'success');
    setShowTemplateModal(false);
    setTplName(''); setTplDesc(''); setTplDocType('contract'); setTplContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Signature Électronique</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les signatures de documents</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowTemplateModal(true)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <FileText size={18} /><span>Modèles</span>
          </button>
          <button onClick={() => setShowSendModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Send size={18} /><span>Envoyer pour signature</span>
          </button>
        </div>
      </div>

      {pendingForCurrentUser.length > 0 && currentUser?.role !== 'ADMIN' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 flex items-center space-x-3">
          <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-800 dark:text-yellow-200">Vous avez <strong>{pendingForCurrentUser.length}</strong> document(s) en attente de votre signature</span>
        </div>
      )}

      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {['requests', 'templates'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
            {tab === 'requests' ? 'Demandes de signature' : 'Modèles'}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {['all', 'draft', 'sent', 'signed', 'completed', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {s === 'all' ? 'Tous' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <FileSignature size={48} className="mx-auto mb-3 opacity-50" />
                <p>Aucune demande de signature</p>
              </div>
            ) : filteredRequests.map(req => (
              <div key={req.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{req.documentName}</h3>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{DTYPE_LABELS[req.documentType] || req.documentType}</span>
                        <span>•</span>
                        <span>Par {req.initiatedByName}</span>
                        <span>•</span>
                        <span>{new Date(req.initiatedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant={STATUS_CONFIG[req.status]?.variant || 'gray'}>{STATUS_CONFIG[req.status]?.label || req.status}</Badge>
                        <span className="text-xs text-gray-400">{req.recipients.length} destinataire(s)</span>
                      </div>
                      {req.recipients.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {req.recipients.map(r => (
                            <div key={r.employeeId} className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{r.name}</span>
                              <Badge variant={RECIPIENT_STATUS_CONFIG[r.status]?.variant || 'gray'}>{RECIPIENT_STATUS_CONFIG[r.status]?.label || r.status}</Badge>
                              {r.signedAt && <span className="text-xs text-gray-400">{new Date(r.signedAt).toLocaleDateString('fr-FR')}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {req.status === 'sent' && req.recipients.some(r => r.employeeId === currentUser?.id && r.status === 'pending') && (
                      <>
                        <button onClick={() => { setShowSignModal(req.id); clearCanvas(); }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors flex items-center space-x-1">
                          <CheckCircle size={14} /><span>Signer</span>
                        </button>
                        <button onClick={() => setShowRejectModal(req.id)}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center space-x-1">
                          <Ban size={14} /><span>Refuser</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {req.message && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">"{req.message}"</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signatureTemplates.map(tpl => (
            <div key={tpl.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{tpl.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tpl.description}</p>
                  <Badge variant="blue">{DTYPE_LABELS[tpl.documentType] || tpl.documentType}</Badge>
                  <p className="text-xs text-gray-400 mt-2">{tpl.placeholders.length} champ(s) variable(s)</p>
                </div>
                <button onClick={() => deleteSignatureTemplate(tpl.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setShowTemplateModal(true)} className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-all">
            <Plus size={32} />
            <span className="text-sm mt-2">Nouveau modèle</span>
          </button>
        </div>
      )}

      {/* Send Modal */}
      <Modal open={showSendModal} onClose={() => setShowSendModal(false)} title="Envoyer pour signature">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du document</label>
            <input value={formDocName} onChange={e => setFormDocName(e.target.value)} placeholder="Ex: Contrat - Jean Kouassi" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de document</label>
            <select value={formDocType} onChange={e => setFormDocType(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
              {Object.entries(DTYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destinataires</label>
            <div className="max-h-32 overflow-y-auto space-y-1.5 border border-gray-200 dark:border-gray-700 rounded-xl p-2">
              {employees.filter(e => e.status === 'active').map(emp => (
                <label key={emp.id} className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formRecipients.includes(emp.id)} onChange={e => setFormRecipients(e.target.checked ? [...formRecipients, emp.id] : formRecipients.filter(id => id !== emp.id))} className="rounded" />
                  <span className="text-sm">{emp.firstName} {emp.lastName}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (optionnel)</label>
            <textarea value={formMessage} onChange={e => setFormMessage(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <button onClick={handleSend} className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
            <Send size={18} /><span>Envoyer</span>
          </button>
        </div>
      </Modal>

      {/* Sign Modal */}
      <Modal open={!!showSignModal} onClose={() => setShowSignModal(null)} title="Signer le document">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Tracez votre signature ci-dessous :</p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
            <canvas ref={canvasRef} width={400} height={150}
              onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
              onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
              className="w-full bg-white dark:bg-gray-800 cursor-crosshair touch-none" />
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={clearCanvas} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Effacer</button>
            <button onClick={handleSign} disabled={!signatureData} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-1">
              <CheckCircle size={16} /><span>Confirmer la signature</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!showRejectModal} onClose={() => setShowRejectModal(null)} title="Refuser la signature">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif du refus</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Expliquez pourquoi vous refusez de signer..." className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <button onClick={handleReject} disabled={!rejectReason} className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 font-medium">Confirmer le refus</button>
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal open={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Nouveau modèle de document">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du modèle</label>
            <input value={tplName} onChange={e => setTplName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input value={tplDesc} onChange={e => setTplDesc(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select value={tplDocType} onChange={e => setTplDocType(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
              {Object.entries(DTYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu (texte avec variables: {'{{employee_name}}'}, {'{{salary}}'}, etc.)</label>
            <textarea value={tplContent} onChange={e => setTplContent(e.target.value)} rows={5} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono" />
          </div>
          <button onClick={handleAddTemplate} className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">Créer le modèle</button>
        </div>
      </Modal>
    </div>
  );
}
