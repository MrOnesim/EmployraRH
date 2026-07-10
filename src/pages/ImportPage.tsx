import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { parseCSV } from '../utils/csv';
import type { Employee } from '../types';

export default function ImportPage() {
  const { addMultipleEmployees } = useData();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [imported, setImported] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(reader.result as string);
      setPreview(rows);
      setImported(false);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const emps: Omit<Employee, 'id'>[] = preview.map((row) => ({
      companyId: '1',
      firstName: row['Prénom'] || row['firstName'] || '',
      lastName: row['Nom'] || row['lastName'] || '',
      email: row['Email'] || row['email'] || '',
      phone: row['Téléphone'] || row['phone'] || '',
      dateOfBirth: new Date(),
      position: row['Poste'] || row['position'] || '',
      department: row['Département'] || row['department'] || 'Autre',
      photo: '',
      salary: parseFloat(row['Salaire'] || row['salary'] || '0'),
      status: 'active' as const,
      joinDate: new Date(),
      role: 'EMPLOYEE' as const,
    })).filter((e) => e.firstName && e.lastName);
    if (emps.length === 0) {
      addToast('Aucun employé valide à importer', 'error');
      return;
    }
    addMultipleEmployees(emps);
    setImported(true);
    addToast(`${emps.length} employé(s) importé(s)`, 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Import CSV</h1>
        <p className="text-gray-500">Importez des employés en masse depuis un fichier CSV</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFile} className="hidden" />
        <div onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
          <Upload size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Cliquez pour sélectionner un fichier CSV</p>
          <p className="text-xs text-gray-400 mt-1">En-têtes attendus : Prénom, Nom, Email, Poste, Département, Salaire</p>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText size={18} className={imported ? 'text-green-500' : 'text-blue-500'} />
              <span className="font-medium text-gray-800">{preview.length} ligne(s) trouvée(s)</span>
              {imported && <CheckCircle size={18} className="text-green-500" />}
            </div>
            {!imported && (
              <button onClick={handleImport}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                <Upload size={16} /><span>Importer</span>
              </button>
            )}
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {Object.keys(preview[0]).map((h) => <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.slice(0, 20).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-gray-700 truncate max-w-[120px]">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 20 && <p className="text-xs text-gray-400 mt-2">+{preview.length - 20} lignes supplémentaires</p>}
        </div>
      )}
    </div>
  );
}
