import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Shield, Clock, DollarSign } from 'lucide-react';

interface Stage1HeroProps {
  onSubmitAddress: (address: string, city: string, state: string, zip: string) => void;
}

const springEntry = [0.34, 1.56, 0.64, 1] as const;

const testimonials = [
  { name: 'Sarah M.', location: 'Austin, TX', text: '"Got a fair offer in 18 hours. No repairs, no hassle."' },
  { name: 'James R.', location: 'Phoenix, AZ', text: '"They were transparent from day one. Closed in 12 days."' },
  { name: 'Linda K.', location: 'Orlando, FL', text: '"Best decision I made. My agent was incredible."' },
];

export default function Stage1Hero({ onSubmitAddress }: Stage1HeroProps) {
  const [address, setAddress] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Rotate testimonials
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    // Parse a basic address — in production use Google Places
    onSubmitAddress(address.trim(), '', '', '');
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
            BuyMyHouse
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
              Join 12,400+ homeowners who got clarity on their home's value — no obligation, no agent fees, no surprises.
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
                  className="w-full pl-12 pr-4 py-4 rounded-lg border border-border-input bg-card text-foreground text-[15px] placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 bg-primary text-primary-foreground font-semibold text-[15px] py-[14px] rounded-lg transition-colors hover:opacity-95"
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
                  <div className="w-7 h-7 rounded-icon-bg bg-surface-2 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[13px] font-medium text-text-body">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Testimonial ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="border-t border-border-light pt-5"
            >
              <AnimatedTestimonial testimonial={testimonials[currentTestimonial]} />
            </motion.div>
          </motion.div>

          {/* Right column - hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: springEntry, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-card bg-card shadow-card overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 accent-bar h-[3px]" />
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full bg-surface-2 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gold" />
                </div>
                <p className="text-[18px] font-bold text-foreground tracking-[-0.3px] mb-2">
                  Your Home, Valued
                </p>
                <p className="text-[13px] text-text-body">
                  Get a comprehensive property assessment backed by real market data.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[18px] font-bold text-foreground">12.4K+</p>
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground">Sellers</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-foreground">$2.1B</p>
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground">Assessed</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-foreground">4.9★</p>
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AnimatedTestimonial({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <motion.div
      key={testimonial.name}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-[13px] text-text-body italic mb-1">{testimonial.text}</p>
      <p className="text-[11px] font-semibold text-muted-foreground">
        — {testimonial.name}, {testimonial.location}
      </p>
    </motion.div>
  );
}
