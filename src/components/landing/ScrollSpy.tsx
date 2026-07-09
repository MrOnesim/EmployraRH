import { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'hero', label: 'Accueil' },
  { id: 'features', label: 'Fonctionnalités' },
  { id: 'pricing', label: 'Tarifs' },
  { id: 'faq', label: 'FAQ' },
];

export default function ScrollSpy() {
  const [active, setActive] = useState('hero');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <nav aria-label="Navigation rapide" className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3">
      {sections.map(({ id, label }) => (
        <div key={id} className="flex items-center gap-3 group cursor-pointer" onClick={() => scrollTo(id)}>
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
            {label}
          </span>
          <div
            className={`rounded-full transition-all duration-300 ${
              active === id
                ? 'w-3 h-3 bg-primary shadow-md shadow-primary/40'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        </div>
      ))}
    </nav>
  );
}
