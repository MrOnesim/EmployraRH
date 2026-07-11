import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import HeroSection from '../components/landing/HeroSection';
import MarqueeLogosSection from '../components/landing/MarqueeLogosSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import AISection from '../components/landing/AISection';
import WhyUsSection from '../components/landing/WhyUsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import FooterSection from '../components/landing/FooterSection';
import ScrollSpy from '../components/landing/ScrollSpy';
import { usePageMeta } from '../hooks/usePageMeta';

function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
        >
          <Link
            to="/register-company"
            className="group bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 font-semibold text-sm"
          >
            Essai gratuit
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            className="bg-green-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center"
            aria-label="Chat en direct"
          >
            <MessageCircle size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  usePageMeta({
    title: 'EmployéPro Africa — La plateforme RH & paie des PME africaines',
    description:
      "Gérez employés, paie, présence, congés et conformité sociale dans une seule solution cloud pensée pour l'Afrique francophone.",
  });
  return (
    <div className="pt-16">
      <PublicNav />
      <HeroSection />
      <MarqueeLogosSection />
      <FeaturesSection />
      <ShowcaseSection />
      <AISection />
      <WhyUsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
      <ScrollSpy />
      <FloatingCTA />
    </div>
  );
}
