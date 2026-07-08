import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { exportPayslipPDF } from '../utils/pdfExport';
import { 
  FileText, Download, Printer, Calendar, DollarSign,
  Eye
} from 'lucide-react';

export default function PayslipsPage() {
  const { currentUser, employees, payslips } = useApp();
  const { addToast } = useToast();
  const isAdmin = currentUser?.role === 'admin';
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const myPayslips = isAdmin 
    ? payslips 
    : payslips.filter(p => p.employeeId === currentUser?.id);

  const filteredPayslips = myPayslips.filter(p => p.year === selectedYear);

  const handleDownload = (payslipId: string) => {
    const p = payslips.find(ps => ps.id === payslipId);
    const emp = employees.find(e => e.id === p?.employeeId);
    if (p && emp) {
      exportPayslipPDF(p, emp, currentUser?.companyId === '1' ? 'TechAfrique Solutions' : 'Entreprise');
      addToast('Bulletin téléchargé', 'success');
    }
  };

  const handlePrint = (_payslipId: string) => {
    addToast('Impression lancée', 'info');
  };

  const getPayslipById = (id: string) => {
    return payslips.find(p => p.id === id);
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bulletins de paie</h1>
          <p className="text-gray-500">
            {isAdmin ? 'Gérez les bulletins de paie de vos employés' : 'Consultez vos bulletins de paie'}
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total bulletins</p>
              <p className="text-2xl font-bold text-gray-800">{filteredPayslips.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total net payé</p>
              <p className="text-2xl font-bold text-gray-800">
                {(filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0) / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500">FCFA</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Calendar size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Dernier bulletin</p>
              <p className="text-lg font-bold text-gray-800">
                {filteredPayslips.length > 0 
                  ? `${months[filteredPayslips[filteredPayslips.length - 1].month - 1]} ${filteredPayslips[filteredPayslips.length - 1].year}`
                  : 'Aucun'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payslips List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {isAdmin && (
                  <th className="text-left px-6 py-4 font-medium text-gray-600">Employé</th>
                )}
                <th className="text-left px-6 py-4 font-medium text-gray-600">Période</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Salaire brut</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Primes</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Déductions</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Net à payer</th>
                <th className="text-left px-6 py-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayslips.map((payslip) => {
                const employee = getEmployeeById(payslip.employeeId);
                return (
                  <tr key={payslip.id} className="hover:bg-gray-50 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {employee?.firstName} {employee?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{employee?.position}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">
                        {months[payslip.month - 1]} {payslip.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {payslip.basicSalary.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      +{payslip.bonuses.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      -{payslip.deductions.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {payslip.netSalary.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowPreview(payslip.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Aperçu"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(payslip.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handlePrint(payslip.id)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Imprimer"
                        >
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredPayslips.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Aucun bulletin disponible pour cette période</p>
          </div>
        )}
      </div>

      {/* Payslip Preview Modal */}
      {showPreview && (() => {
        const payslip = getPayslipById(showPreview);
        const employee = payslip ? getEmployeeById(payslip.employeeId) : null;
        
        if (!payslip || !employee) return null;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Bulletin de paie</h2>
                <button onClick={() => setShowPreview(null)} className="text-gray-400 hover:text-gray-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Payslip Content */}
              <div className="border border-gray-200 rounded-lg p-6">
                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-blue-600">EmployéPro Africa</h3>
                  <p className="text-sm text-gray-500">Bulletin de paie</p>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Poste</p>
                    <p className="font-medium">{employee.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Département</p>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Période</p>
                    <p className="font-medium">{months[payslip.month - 1]} {payslip.year}</p>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Détails du salaire</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salaire de base</span>
                      <span className="font-medium">{payslip.basicSalary.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primes et bonus</span>
                      <span className="font-medium text-green-600">+{payslip.bonuses.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Déductions (CNSS, IR, etc.)</span>
                      <span className="font-medium text-red-600">-{payslip.deductions.toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Net à payer</span>
                        <span className="font-bold text-lg text-blue-600">{payslip.netSalary.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                  <p>Document généré le {new Date(payslip.generatedAt).toLocaleDateString('fr-FR')}</p>
                  <p className="mt-1">EmployéPro Africa - Plateforme de gestion RH</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleDownload(payslip.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <Download size={18} />
                  <span>Télécharger PDF</span>
                </button>
                <button
                  onClick={() => handlePrint(payslip.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Printer size={18} />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
