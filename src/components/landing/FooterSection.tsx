import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Globe, Code2, Users } from 'lucide-react';

const productLinks = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'À propos', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

const legalLinks = [
  { label: 'Conditions générales', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
  { label: 'Mentions légales', href: '#' },
  { label: 'Cookies', href: '#' },
];

const socialLinks = [
  { icon: Globe, href: '#', label: 'Twitter' },
  { icon: Users, href: '#', label: 'LinkedIn' },
  { icon: Code2, href: '#', label: 'GitHub' },
  { icon: Mail, href: 'mailto:contact@employepro.com', label: 'Email' },
];

export default function FooterSection() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* Decorative orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo.png"
                alt="EmployéPro"
                loading="lazy"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xl font-bold text-white">EmployéPro</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              La plateforme RH et paie tout-en-un pour les entreprises ambitieuses. Paie multi-pays,
              IA embarquée, signatures électroniques.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Produit
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>contact@employepro.com</li>
              <li>+221 33 800 00 00</li>
              <li>Dakar, Sénégal</li>
              <li>Paris, France</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Légal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EmployéPro. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>RGPD conform</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>ISO 27001 en cours</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>SLA 99.9%</span>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors"
          >
            <ArrowUp size={14} />
            Haut de page
          </button>
        </div>
      </div>
    </footer>
  );
}
