import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Shield, Clock, DollarSign } from 'lucide-react';
import { playButtonSound } from '@/lib/sounds';
import Stage2Trust from './Stage2Trust';

interface Stage1HeroProps {
  onSubmitAddress: (address: string, city: string, state: string, zip: string) => void;
  onContinueToAssessment: () => void;
}

const springEntry: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const testimonials = [
  { name: 'Sarah M.', location: 'Austin, TX', text: '"Got a fair offer in 18 hours. No repairs, no hassle."' },
  { name: 'James R.', location: 'Phoenix, AZ', text: '"They were transparent from day one. Closed in 12 days."' },
  { name: 'Linda K.', location: 'Orlando, FL', text: '"Best decision I made. My agent was incredible."' },
];

export default function Stage1Hero({ onSubmitAddress, onContinueToAssessment }: Stage1HeroProps) {
  const [address, setAddress] = useState('');
  const [showStage2, setShowStage2] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    playButtonSound();
    onSubmitAddress(address.trim(), '', '', '');
    setShowStage2(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-extrabold tracking-[-0.3px] text-foreground">
            Buy<span className="text-gold">My</span>House
          </span>
          <span className="text-[13px] font-extrabold tracking-[-0.3px] text-gold">.com</span>
        </div>
        <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground">
          By LPT Holdings, Inc.
        </span>
      </motion.nav>

      {/* Hero */}
      <div className="flex-1 flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: springEntry, delay: 0.1 }}
          >
            <h1 className="text-[32px] font-bold tracking-[-0.8px] text-foreground leading-tight mb-4">
              Get a Real Offer on Your{' '}
              <br className="hidden sm:block" />
              Home in 24 Hours
            </h1>
            <p className="text-[15px] text-text-body mb-8 leading-relaxed">
              Join 12,400+ homeowners who got clarity on their home's value — no obligation, no agent fees, no surprises..
            </p>

            {/* Address form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your property address…"
                  className="w-full pl-12 pr-4 py-4 rounded-lg border text-foreground text-[15px] focus:outline-none transition-all"
                  style={{
                    background: '#F8FAFC',
                    borderColor: '#D8E3ED',
                    borderWidth: '1.5px',
                  }}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 rounded-lg text-[14px] font-bold tracking-[0.3px] py-[14px] cursor-pointer border-none transition-all"
                style={{
                  background: '#1B2B4B',
                  color: '#C8A96E',
                  boxShadow: '0 2px 8px rgba(27,43,75,0.25)',
                  height: 52,
                }}
              >
                Get My Free Offer →
              </motion.button>
            </form>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              {[
                { icon: Shield, label: 'No obligation' },
                { icon: DollarSign, label: 'No agent fees' },
                { icon: Clock, label: '24-hour response' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-icon-bg flex items-center justify-center"
                    style={{ background: '#F8FAFC' }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: '#9AABB8' }} strokeWidth={1.8} />
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: '#4A5E72' }}>{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Testimonial ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-5"
              style={{ borderTop: '1px solid #F0F3F7' }}
            >
              <AnimatePresence mode="wait">
                <AnimatedTestimonial key={currentTestimonial} testimonial={testimonials[currentTestimonial]} />
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right column - hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: springEntry, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div
              className="relative w-full max-w-md aspect-square rounded-card bg-card overflow-hidden flex items-center justify-center"
              style={{
                boxShadow: '0 1px 3px rgba(27,43,75,0.06), 0 8px 24px rgba(27,43,75,0.08), 0 24px 48px rgba(27,43,75,0.06)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] accent-bar" />
              <div className="text-center p-8">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: '#F8FAFC' }}
                >
                  <MapPin className="w-8 h-8" style={{ color: '#C8A96E' }} />
                </div>
                <p className="text-[18px] font-bold tracking-[-0.3px] mb-2" style={{ color: '#1B2B4B' }}>
                  Your Home, Valued
                </p>
                <p className="text-[13px]" style={{ color: '#4A5E72' }}>
                  Get a comprehensive property assessment backed by real market data.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[18px] font-bold" style={{ color: '#1B2B4B' }}>12.4K+</p>
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#9AABB8' }}>Sellers</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold" style={{ color: '#1B2B4B' }}>$2.1B</p>
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#9AABB8' }}>Assessed</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold" style={{ color: '#1B2B4B' }}>4.9★</p>
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#9AABB8' }}>Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stage 2 — Below the fold, revealed after address entry */}
      {showStage2 && (
        <Stage2Trust onContinue={onContinueToAssessment} />
      )}
    </div>
  );
}

function AnimatedTestimonial({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-[13px] italic mb-1" style={{ color: '#4A5E72' }}>{testimonial.text}</p>
      <p className="text-[11px] font-semibold" style={{ color: '#9AABB8' }}>
        — {testimonial.name}, {testimonial.location}
      </p>
    </motion.div>
  );
}
