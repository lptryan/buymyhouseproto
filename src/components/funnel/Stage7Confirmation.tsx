import { motion } from 'framer-motion';
import { Check, Share2 } from 'lucide-react';
import type { Agent } from '@/lib/types';
import CardShell from './CardShell';
import CardHeader from './CardHeader';
import AddressChip from './AddressChip';

interface Stage7Props {
  address: string;
  agent: Agent | null;
}

const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const NEXT_STEPS = [
  { num: '1', text: (name: string) => `${name} will call or text you within 2 business hours.` },
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
      <CardShell>
        <CardHeader
          subtitle=""
          stage={7}
          rightContent={
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-[6px] h-[6px] rounded-full bg-gold" />
                ))}
              </div>
            </div>
          }
        />

        {/* Override subtitle with green confirmed */}
        <div className="px-7 -mt-10 mb-4">
          <div className="text-[11px] text-success font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> You're Confirmed
          </div>
        </div>

        <AddressChip address={address} />

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
            className="rounded-xl p-5 text-left mb-8 bg-surface-2 border border-border-light"
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground">Property</span>
                <span className="text-[13px] font-semibold text-foreground">{address || '123 Main St, Austin TX'}</span>
              </div>
              <div className="h-px bg-border-light" />
              <div className="flex justify-between">
                <span className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground">Specialist</span>
                <span className="text-[13px] font-semibold text-foreground">{agentName}</span>
              </div>
              <div className="h-px bg-border-light" />
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
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-navy">
                    <span className="text-[11px] font-bold text-gold">{step.num}</span>
                  </div>
                  <p className="text-[13px] text-text-body leading-relaxed">
                    {step.text(agentName)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="h-px bg-border-light mb-6" />

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
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[13px] font-semibold cursor-pointer transition-all bg-transparent border border-border-input text-text-body hover:bg-surface-2"
              style={{ borderWidth: '1.5px' }}
            >
              <Share2 className="w-4 h-4" />
              Share BuyMyHouse.com
            </button>
          </motion.div>

          <div className="h-px bg-border-light mb-4" />
          <p className="text-[10px] text-muted-foreground">
            LPT Holdings, Inc. · Licensed Brokerage · <a href="#" className="underline">Privacy Policy</a> · <a href="#" className="underline">Terms of Service</a>
          </p>
        </div>
      </CardShell>
    </div>
  );
}
