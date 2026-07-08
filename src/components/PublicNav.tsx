import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import RegionSwitcher from './RegionSwitcher';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollBy(0, -80);
  }
}

const sectionLinks = [
  { section: 'hero', to: '/', labelKey: 'nav.home' },
  { section: null, to: '/pricing', labelKey: 'nav.pricing' },
  { section: null, to: '/docs', labelKey: 'nav.docs' },
  { section: null, to: '/about', labelKey: 'nav.about' },
  { section: 'faq', to: '/faq', labelKey: 'nav.faq' },
];

export default function PublicNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isPublic = ['/', '/pricing', '/faq', '/docs', '/about', '/login', '/register-company'].includes(location.pathname);

  const handleClick = (link: typeof sectionLinks[0]) => {
    setOpen(false);
    if (link.section && location.pathname === '/') {
      scrollToSection(link.section);
    }
  };

  if (!isPublic) return null;

  const isActive = (link: typeof sectionLinks[0]) => {
    if (link.section && location.pathname === '/') return false;
    return location.pathname === link.to;
  };

  const linkBase = 'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300';
  const linkInactive = 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800';
  const linkActive = 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400';

  const renderLink = (link: typeof sectionLinks[0], mobile: boolean) => {
    if (link.section && location.pathname === '/') {
      return (
        <button key={link.to}
          onClick={() => handleClick(link)}
          className={`${linkBase} ${linkInactive} ${mobile ? 'block w-full text-left' : 'group perspective-[400px]'}`}
        >
          <span className="relative z-10 inline-block group-hover:translate-y-[-1px] transition-transform duration-200">
            {t(link.labelKey)}
          </span>
          <span className="absolute bottom-1 left-2 right-2 h-px bg-blue-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
      );
    }
    return (
      <Link key={link.to} to={link.to} onClick={() => mobile && setOpen(false)}
        className={`${linkBase} ${mobile ? 'block' : ''} ${isActive(link) ? linkActive : linkInactive} group perspective-[400px]`}
      >
        <span className="relative z-10 inline-block group-hover:translate-y-[-1px] transition-transform duration-200">
          {t(link.labelKey)}
        </span>
        {isActive(link) && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
        )}
        <span className="absolute bottom-1 left-2 right-2 h-px bg-blue-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group perspective-[600px]">
            <div className="w-9 h-9 rounded-lg overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400/50 transition-all group-hover:scale-105 duration-300">
              <img src="/images/logo.png" alt="EmployéPro" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-lg group-hover:text-blue-600 transition-colors">EmployePro</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-1">
            {sectionLinks.map(link => renderLink(link, false))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center space-x-1">
            <RegionSwitcher />
            <LanguageSwitcher />
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-800 px-4 py-2 transition-all hover:scale-105">
              {t('nav.login')}
            </Link>
            <Link to="/register-company" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-200/50">
              {t('nav.get_started')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} aria-label="Menu de navigation" className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-4 px-4 space-y-2 animate-slide-up">
          {sectionLinks.map(link => renderLink(link, true))}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <div className="px-4 py-2 flex items-center gap-2"><RegionSwitcher /><LanguageSwitcher /></div>
            <Link to="/login" onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">{t('nav.login')}</Link>
            <Link to="/register-company" onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-center hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">{t('nav.get_started')}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
