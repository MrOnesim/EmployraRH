import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { 
  Bot, Sparkles, User, Send
} from 'lucide-react';

const presets = [
  {
    id: 'performance',
    label: '📊 Performance',
    question: 'Quels employés sont les plus performants ce trimestre ?',
    answer: 'Amadou Diallo (95%), Marie Dubois (92%), Jean Koffi (88%) sont en tête ce trimestre. Les rapports d\'évaluation détaillés sont prêts dans l\'onglet Performance.'
  },
  {
    id: 'report',
    label: '📄 Rapport RH',
    question: 'Génère le rapport de synthèse RH du mois dernier.',
    answer: 'Rapport généré avec succès pour Juin 2026 : 14 recrutements finalisés, 96.4% de taux de présence moyen, et 2.4M € de masse salariale totale calculée.'
  },
  {
    id: 'leaves',
    label: '📅 Congés',
    question: 'Quels sont les congés à venir cette semaine ?',
    answer: '3 employés sont absents cette semaine : Amina Diallo (Marketing, lun-mer), Sophie Martin (RH, lun-ven) et Jean Koffi (Tech, mar-jeu).'
  }
];

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AISection() {
  const { ref: sectionRef, isVisible } = useScrollReveal();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Bonjour ! Je suis votre Assistant RH intelligent. Cliquez sur l\'une des questions suggérées ci-dessous ou posez-moi votre propre question pour tester mon intelligence.',
      timestamp: 'Assistant'
    }
  ]);
  const [customInput, setCustomInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: 'Vous'
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Find if it matches a preset, otherwise use a generic fallback
    const matchedPreset = presets.find(p => p.question.toLowerCase() === text.toLowerCase() || text.includes(p.label.split(' ')[1]));
    const replyText = matchedPreset 
      ? matchedPreset.answer 
      : `Excellente question ! En tant qu'assistant IA, je peux croiser les données de pointage, de paie et de contrats. Pour tester cette fonctionnalité sur vos propres données, créez un compte d'essai gratuit en cliquant sur "Essai gratuit".`;

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: replyText,
        timestamp: 'Assistant IA'
      }]);
    }, 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleSendMessage(customInput);
    setCustomInput('');
  };

  return (
    <section
      id="ai-section"
      className="py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Decorative details */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div
        ref={sectionRef}
        className={`relative max-w-4xl mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 ring-1 ring-primary/20 shadow-sm mb-6">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Assistant IA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            Votre assistant RH intelligent
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Posez des questions en langage naturel, générez des rapports et prenez des décisions basées sur vos données.
          </p>
        </div>

        {/* Chat Console container */}
        <div className="bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Chat Header */}
          <div className="bg-slate-950/80 border-b border-white/10 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Assistant RH IA</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  En ligne — Prêt à vous aider
                </div>
              </div>
            </div>
            
            {/* Quick clean button */}
            <button 
              onClick={() => setMessages([{
                id: 'welcome',
                sender: 'ai',
                text: 'Bonjour ! Je suis votre Assistant RH intelligent. Cliquez sur l\'une des questions suggérées ci-dessous ou posez-moi votre propre question pour tester mon intelligence.',
                timestamp: 'Assistant'
              }])}
              className="text-xs text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 font-semibold"
            >
              Réinitialiser
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="h-[340px] overflow-y-auto p-5 md:p-6 space-y-4 bg-slate-950/40">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`rounded-2xl max-w-[80%] px-4 py-3 border text-xs md:text-sm font-medium ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white border-primary-hover rounded-br-sm shadow-md'
                      : 'bg-white/5 text-white/95 border-white/5 rounded-bl-sm shadow-inner'
                  }`}>
                    <div className="text-[9px] text-white/40 font-bold mb-1 uppercase tracking-wide">
                      {msg.timestamp}
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>

                  {/* User Avatar */}
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 shadow-md">
                      <User size={14} className="text-white/80" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 justify-start"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-white/50 flex items-center gap-1.5 shadow-inner">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Preset Suggestions Bar */}
          <div className="p-4 border-t border-white/10 bg-slate-950/20 flex flex-wrap gap-2 items-center justify-center md:justify-start">
            <span className="text-[10px] uppercase font-black tracking-wider text-white/30 mr-1 hidden md:inline">Suggestions :</span>
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSendMessage(p.question)}
                disabled={isTyping}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Message Input Footer */}
          <form 
            onSubmit={handleCustomSubmit}
            className="p-4 bg-slate-950 border-t border-white/10 flex gap-3 items-center"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={isTyping ? "L'IA est en train de formuler une réponse..." : "Tapez une question RH personnalisée..."}
              disabled={isTyping}
              className="flex-1 bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !customInput.trim()}
              className="bg-primary hover:bg-primary-hover disabled:bg-primary/40 text-white w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-md active:scale-95 border border-primary/30"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
