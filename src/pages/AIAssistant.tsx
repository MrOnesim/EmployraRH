import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  Bot,
  User,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIAssistant() {
  const { employees, attendance, leaves, payslips } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Bonjour ! Je suis votre assistant RH intelligent. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur vos employés, présences, salaires ou congés.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickQuestions = [
    { icon: Users, text: "Qui est absent aujourd'hui ?", color: 'bg-red-100 text-red-600' },
    {
      icon: DollarSign,
      text: "Combien l'entreprise a-t-elle dépensé en salaires ce mois-ci ?",
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Clock,
      text: "Quel employé a réalisé le plus d'heures supplémentaires ?",
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: TrendingUp,
      text: 'Quel est le taux de présence moyen ?',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: AlertTriangle,
      text: 'Y a-t-il des congés en attente ?',
      color: 'bg-yellow-100 text-yellow-600',
    },
    { icon: BarChart3, text: 'Résumé du mois', color: 'bg-indigo-100 text-indigo-600' },
  ];

  const processQuestion = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    // Question about absent employees
    if (lowerQuestion.includes('absent') || lowerQuestion.includes('absence')) {
      const today = new Date();
      const absentEmployees = employees.filter(
        (e) =>
          e.status === 'active' &&
          !attendance.some(
            (a) =>
              a.employeeId === e.id && new Date(a.date).toDateString() === today.toDateString(),
          ),
      );

      if (absentEmployees.length === 0) {
        return "Aucun employé n'est absent aujourd'hui. Tous les employés actifs sont présents ! 🎉";
      }

      const names = absentEmployees.map((e) => `${e.firstName} ${e.lastName}`).join(', ');
      return `Il y a ${absentEmployees.length} employé(s) absent(s) aujourd'hui : ${names}. Voulez-vous que je vous montre plus de détails ?`;
    }

    // Question about salary expenses
    if (lowerQuestion.includes('salaire') || lowerQuestion.includes('dépens')) {
      const totalSalary = employees
        .filter((e) => e.status === 'active')
        .reduce((sum, e) => sum + e.salary, 0);

      return `Ce mois-ci, la dépense totale en salaires est de ${totalSalary.toLocaleString()} FCFA pour ${employees.filter((e) => e.status === 'active').length} employés actifs. La masse salariale moyenne par employé est de ${(totalSalary / employees.filter((e) => e.status === 'active').length).toLocaleString()} FCFA.`;
    }

    // Question about overtime
    if (
      lowerQuestion.includes('heure supplémentaire') ||
      lowerQuestion.includes('heure sup') ||
      lowerQuestion.includes('overtime')
    ) {
      const employeeOvertime: { name: string; hours: number }[] = [];

      employees.forEach((emp) => {
        const empAttendance = attendance.filter((a) => a.employeeId === emp.id);
        const totalOvertime = empAttendance.reduce((sum, a) => sum + a.overtime, 0);
        if (totalOvertime > 0) {
          employeeOvertime.push({ name: `${emp.firstName} ${emp.lastName}`, hours: totalOvertime });
        }
      });

      employeeOvertime.sort((a, b) => b.hours - a.hours);

      if (employeeOvertime.length === 0) {
        return "Aucune heure supplémentaire n'a été enregistrée récemment.";
      }

      const top = employeeOvertime[0];
      return `${top.name} a réalisé le plus d'heures supplémentaires avec ${top.hours}h au total. Voici le classement :\n${employeeOvertime.map((e, i) => `${i + 1}. ${e.name} : ${e.hours}h`).join('\n')}`;
    }

    // Question about attendance rate
    if (lowerQuestion.includes('taux de présence') || lowerQuestion.includes('présence moyenne')) {
      const today = new Date();
      const activeEmployees = employees.filter((e) => e.status === 'active').length;
      const presentToday = attendance.filter(
        (a) =>
          new Date(a.date).toDateString() === today.toDateString() &&
          (a.status === 'present' || a.status === 'late'),
      ).length;

      const rate = activeEmployees > 0 ? ((presentToday / activeEmployees) * 100).toFixed(1) : '0';
      const rateNum = parseFloat(rate);
      return `Le taux de présence aujourd'hui est de ${rate}% (${presentToday}/${activeEmployees} employés). ${rateNum >= 90 ? 'Excellent ! 👏' : rateNum >= 75 ? 'Correct.' : "Il y a place à l'amélioration."}`;
    }

    // Question about pending leaves
    if (lowerQuestion.includes('congé') || lowerQuestion.includes('demande')) {
      const pendingLeaves = leaves.filter((l) => l.status === 'pending');

      if (pendingLeaves.length === 0) {
        return "Aucune demande de congé n'est en attente de validation. Tout est à jour ! ✅";
      }

      const details = pendingLeaves
        .map((l) => {
          const emp = employees.find((e) => e.id === l.employeeId);
          return `- ${emp?.firstName} ${emp?.lastName} : ${l.type} du ${new Date(l.startDate).toLocaleDateString('fr-FR')} au ${new Date(l.endDate).toLocaleDateString('fr-FR')}`;
        })
        .join('\n');

      return `Il y a ${pendingLeaves.length} demande(s) de congé en attente :\n${details}\n\nVoulez-vous que je vous aide à les traiter ?`;
    }

    // Summary of the month
    if (
      lowerQuestion.includes('résumé') ||
      lowerQuestion.includes('mois') ||
      lowerQuestion.includes('synthèse')
    ) {
      const activeEmp = employees.filter((e) => e.status === 'active').length;
      const totalSalary = employees
        .filter((e) => e.status === 'active')
        .reduce((sum, e) => sum + e.salary, 0);
      const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
      const totalPayslips = payslips.length;

      return `📊 Résumé du mois :

👥 Employés : ${activeEmp} actifs
💰 Masse salariale : ${(totalSalary / 1000000).toFixed(2)}M FCFA
📅 Congés en attente : ${pendingLeaves}
📄 Bulletins générés : ${totalPayslips}

Souhaitez-vous des détails sur un point spécifique ?`;
    }

    // Default response
    return `Je comprends votre question. Pour vous donner une réponse précise, pouvez-vous reformuler en mentionnant un des sujets suivants :\n\n• Présences et absences\n• Salaires et paiements\n• Heures supplémentaires\n• Taux de présence\n• Demandes de congé\n• Résumé mensuel`;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: String(messages.length + 1),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: String(messages.length + 2),
        content: processQuestion(inputValue),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-semibold">Assistant IA RH</h1>
            <p className="text-blue-200 text-sm">Posez vos questions sur vos données RH</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' ? 'bg-blue-100' : 'bg-green-100'
                }`}
              >
                {message.sender === 'user' ? (
                  <User size={16} className="text-blue-600" />
                ) : (
                  <Bot size={16} className="text-green-600" />
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Questions */}
      <div className="bg-white px-4 py-2 border-t border-gray-100">
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {quickQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => setInputValue(q.text)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm whitespace-nowrap transition-colors"
            >
              <q.icon size={14} className={q.color.split(' ')[1]} />
              <span className="text-gray-700">{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 rounded-b-2xl p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tapez votre question ici..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
