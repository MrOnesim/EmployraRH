import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="relative py-32 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div
        ref={ref}
        className={`relative max-w-4xl mx-auto px-4 text-center transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
          <Sparkles size={14} className="text-blue-200" />
          <span className="text-sm font-medium text-white">Prêt à passer à l'action ?</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.05]">
          Prêt à transformer{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
            votre gestion RH
          </span>{' '}
          ?
        </h2>

        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Rejoignez des milliers d'entreprises qui font confiance à EmployéPro Africa. Commencez
          gratuitement, sans carte bancaire.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/register-company"
            className="group inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
          >
            Essai gratuit 14 jours
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white/10 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Se connecter
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-blue-200">
          <span>&#10003; Sans carte bancaire</span>
          <span>&#10003; 14 jours d'essai</span>
          <span>&#10003; Accès complet</span>
          <span>&#10003; Support 24/7</span>
        </div>
      </div>
    </section>
  );
}
