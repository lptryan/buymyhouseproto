import { motion } from 'framer-motion';
import { MapPin, Check, Share2 } from 'lucide-react';
import type { Agent } from '@/lib/types';

interface Stage7Props {
  address: string;
  agent: Agent | null;
}

const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const NEXT_STEPS = [
  { num: '1', text: (agentName: string) => `${agentName} will call or text you within 2 business hours.` },
  { num: '2', text: () => "They'll schedule a brief walk-through at your convenience." },
  { num: '3', text: () => "You'll receive a written assessment with your options — no obligation." },
];

export default function Stage7Confirmation({ address, agent }: Stage7Props) {
  const agentName = agent?.name || 'Your specialist';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BuyMyHouse.com', text: 'Get a real offer on your home in 24 hours.', url: 'https://buymyhouse.com?ref=share' });
      } catch { /* cancelled */ }
    } else {
      window.open('https://buymyhouse.com?ref=share', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SPRING, delay: 0.1 }}
        className="w-full max-w-[560px] bg-card rounded-card overflow-hidden shadow-card"
      >
        <div className="h-[3px] accent-bar" />

        {/* Header */}
        <div className="px-7 pt-6 pb-5 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border-light))' }}>
          <div>
            <div className="text-[13px] font-extrabold tracking-[-0.3px] text-foreground">
              Buy<span className="text-gold">My</span>House
            </div>
            <div className="text-[11px] text-success mt-0.5 tracking-[0.3px] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> You're Confirmed
            </div>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: 'hsl(var(--gold))' }}
              />
            ))}
          </div>
        </div>

        {/* Address Row */}
        <div className="px-7 py-[18px] flex items-center gap-3 bg-surface-2" style={{ borderBottom: '1px solid hsl(var(--border-light))' }}>
          <div className="w-[34px] h-[34px] rounded-icon-bg bg-primary flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-gold" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground mb-0.5">Property</div>
            <div className="text-[13px] font-semibold text-foreground tracking-[-0.2px]">{address || '123 Main St, Austin TX 78701'}</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-7 pt-8 pb-6 text-center">
          {/* Big checkmark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: SPRING, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-[18px] font-bold tracking-[-0.3px] text-foreground mb-6"
          >
            Your assessment is confirmed.
          </motion.h2>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-xl p-5 text-left mb-8"
            style={{
              background: 'hsl(var(--surface-2))',
              border: '1px solid hsl(var(--border-light))',
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground">Property</span>
                <span className="text-[13px] font-semibold text-foreground">{address || '123 Main St, Austin TX'}</span>
              </div>
              <div className="h-px" style={{ background: 'hsl(var(--border-light))' }} />
              <div className="flex justify-between">
                <span className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground">Specialist</span>
                <span className="text-[13px] font-semibold text-foreground">{agentName}</span>
              </div>
              <div className="h-px" style={{ background: 'hsl(var(--border-light))' }} />
              <div className="flex justify-between">
                <span className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground">Contact by</span>
                <span className="text-[13px] font-semibold text-foreground">Within 2 business hours</span>
              </div>
            </div>
          </motion.div>

          {/* What happens next */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-left mb-8"
          >
            <h3 className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground mb-4">
              What Happens Next
            </h3>
            <div className="space-y-4">
              {NEXT_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.15, duration: 0.35 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-navy"
                  >
                    <span className="text-[11px] font-bold text-gold">{step.num}</span>
                  </div>
                  <p className="text-[13px] text-text-body leading-relaxed">
                    {step.text(agentName)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px mb-6" style={{ background: 'hsl(var(--border-light))' }} />

          {/* Share */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mb-6"
          >
            <p className="text-[13px] text-text-body mb-3">Know someone who wants to sell?</p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[13px] font-semibold cursor-pointer transition-all hover:bg-surface-2"
              style={{ background: 'transparent', border: '1.5px solid hsl(var(--border-input))', color: 'hsl(var(--text-body))' }}
            >
              <Share2 className="w-4 h-4" />
              Share BuyMyHouse.com
            </button>
          </motion.div>

          {/* Footer */}
          <div className="h-px mb-4" style={{ background: 'hsl(var(--border-light))' }} />
          <p className="text-[10px] text-muted-foreground">
            LPT Holdings, Inc. · Licensed Brokerage · <a href="#" className="underline">Privacy Policy</a> · <a href="#" className="underline">Terms of Service</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
