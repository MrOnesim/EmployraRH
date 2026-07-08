import { useState, useEffect } from 'react';
import { BookOpen, Search, FileText, Video, HelpCircle, ArrowRight, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav';

const sections = [
  {
    title: 'Guides de démarrage',
    icon: BookOpen,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    items: ['Créer votre compte entreprise', 'Inviter vos employés', 'Configurer la paie', 'Premier pointage QR'],
  },
  {
    title: 'Modules fonctionnels',
    icon: FileText,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    items: ['Gestion des présences', 'Congés et absences', 'Bulletins de paie', 'Performance & objectifs'],
  },
  {
    title: 'Tutoriels vidéo',
    icon: Video,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    items: ['Vue d\'ensemble (5 min)', 'Configuration avancée', 'Export PDF', 'API & intégrations'],
  },
  {
    title: 'FAQ & Support',
    icon: HelpCircle,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    items: ['Questions fréquentes', 'Nous contacter', 'Statut du service', 'Communauté'],
  },
];

function ScreenshotViewer() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-8 md:p-16 flex items-center justify-center min-h-[300px] rounded-2xl">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <Camera size={48} className="mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Capture d'écran</p>
          <p className="text-sm mt-2">Placez votre image dans <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">public/images/screenshots/hero-section.png</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 md:p-8 rounded-2xl">
      <picture>
        <source srcSet="/images/screenshots/hero-section.webp" type="image/webp" />
        <img
          src="/images/screenshots/hero-section.png"
          alt="Aperçu de la plateforme EmployéPro"
          loading="lazy"
          className="w-full rounded-xl shadow-lg"
          onError={() => setFailed(true)}
        />
      </picture>
    </div>
  );
}

export default function DocumentationPage() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const og = document.querySelector('meta[property="og:description"]');
    const title = document.title;
    document.title = 'Documentation - EmployéPro';
    if (meta) meta.setAttribute('content', 'Documentation complète EmployéPro : guides de démarrage, modules fonctionnels, tutoriels vidéo, FAQ et support.');
    if (og) og.setAttribute('content', 'Documentation complète EmployéPro : guides de démarrage, modules fonctionnels, tutoriels vidéo, FAQ et support.');
    return () => { document.title = title; };
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
      <PublicNav />
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <BookOpen size={48} className="mx-auto mb-6 text-blue-200" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-blue-100/90 max-w-2xl mx-auto">
            Tout ce qu'il faut savoir pour maîtriser EmployéPro : guides, tutoriels, API et bonnes pratiques.
          </p>
          <div className="relative max-w-lg mx-auto mt-8">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              placeholder="Rechercher dans la documentation..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {/* Screenshot */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 mb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ScreenshotViewer />
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Aperçu de la section d'accueil — Plateforme EmployéPro
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${section.color}`}>
                  <section.icon size={24} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item}>
                    <Link to="/faq" className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100">{item}</span>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
