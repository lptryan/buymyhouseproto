import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, Loader2 } from 'lucide-react';
import { playButtonSound } from '@/lib/sounds';
import type { Agent } from '@/lib/types';
import CardShell from './CardShell';
import CardHeader from './CardHeader';
import AddressChip from './AddressChip';

interface Stage6Props {
  address: string;
  agent: Agent | null;
  onConfirm: () => Promise<void>;
}

const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const DEFAULT_AGENT: Agent = {
  id: 'default',
  name: 'Regional Specialist',
  title: 'Senior Property Specialist',
  photo_url: '',
  specialization: 'Residential Sales',
  rating: 4.9,
  deals_closed: 127,
  bio: 'I specialize in helping homeowners navigate the selling process with clarity and confidence.',
  phone: '(555) 000-0000',
  email: 'specialist@buymyhouse.com',
  zip_codes: [],
  active: true,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          fill={i <= Math.floor(rating) ? 'hsl(var(--gold))' : 'none'}
          stroke="hsl(var(--gold))"
          strokeWidth={1.5}
        />
      ))}
      <span className="text-[13px] font-semibold text-gold ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Stage6Agent({ address, agent, onConfirm }: Stage6Props) {
  const [loading, setLoading] = useState(false);
  const displayAgent = agent || DEFAULT_AGENT;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const initials = displayAgent.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <CardShell>
        <CardHeader subtitle="Your Specialist is Ready" stage={6} />
        <AddressChip address={address} />

        <div className="px-7 pt-7 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-[18px] font-bold tracking-[-0.3px] text-foreground mb-1">
              Meet Your Dedicated Property Specialist
            </h2>
            <p className="text-[13px] text-text-body mb-6">
              Matched based on your neighborhood and home profile.
            </p>
          </motion.div>

          {/* Agent Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: SPRING, delay: 0.3 }}
            className="rounded-xl p-5 mb-6 bg-card border border-border-light"
            style={{ boxShadow: '0 1px 3px rgba(27,43,75,0.06), 0 4px 12px rgba(27,43,75,0.08)' }}
          >
            <div className="flex gap-4">
              {displayAgent.photo_url ? (
                <img
                  src={displayAgent.photo_url}
                  alt={displayAgent.name}
                  className="w-[72px] h-[72px] rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 bg-navy">
                  <span className="text-[20px] font-bold text-gold">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-bold text-foreground">{displayAgent.name}</h3>
                <p className="text-[12px] text-muted-foreground tracking-[0.3px] mb-2">{displayAgent.title}</p>
                <StarRating rating={displayAgent.rating} />
                <p className="text-[11px] text-text-body mt-1">
                  {displayAgent.deals_closed.toLocaleString()} homes sold
                </p>
              </div>
            </div>
            {displayAgent.bio && (
              <p className="text-[12px] text-text-body mt-4 leading-relaxed line-clamp-2">
                "{displayAgent.bio}"
              </p>
            )}
          </motion.div>

          {/* Trust points */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            {[
              'No-obligation consultation',
              'We come to you — no office visit needed',
              'Response within 2 business hours',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-[13px] text-text-body">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            onClick={handleConfirm}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-[14px] text-[14px] font-bold tracking-[0.3px] cursor-pointer border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-navy text-gold"
            style={{ boxShadow: '0 2px 8px rgba(27,43,75,0.25)', height: 52 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming…
              </>
            ) : (
              'Confirm My Consultation →'
            )}
          </motion.button>
        </div>
      </CardShell>
    </div>
  );
}
