import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Share2 } from 'lucide-react';
import type { Agent } from '@/lib/types';
import CardShell from './CardShell';
import CardHeader from './CardHeader';
import AddressChip from './AddressChip';

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major chord arpeggio
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.6);
    });
  } catch { /* silent fallback */ }
}

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

// Confetti-like burst particles
function ConfettiDots() {
  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const radius = 60 + Math.random() * 30;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    const colors = ['hsl(var(--success))', 'hsl(var(--gold))', 'hsl(var(--navy))'];
    return { x, y, color: colors[i % 3], size: 4 + Math.random() * 4, delay: i * 0.04 };
  });

  return (
    <>
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], x: dot.x, y: dot.y, scale: [0, 1.2, 0] }}
          transition={{ duration: 0.8, delay: 0.3 + dot.delay, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{ width: dot.size, height: dot.size, backgroundColor: dot.color }}
        />
      ))}
    </>
  );
}

export default function Stage7Confirmation({ address, agent }: Stage7Props) {
  const agentName = agent?.name || 'Your specialist';
  const soundPlayed = useRef(false);

  useEffect(() => {
    if (!soundPlayed.current) {
      soundPlayed.current = true;
      const timer = setTimeout(() => {
        playSuccessSound();
        // Haptic feedback on supported devices
        if (navigator.vibrate) {
          navigator.vibrate([30, 50, 30]); // subtle double-tap pattern
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

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
          {/* Big checkmark with confetti */}
          <div className="relative flex items-center justify-center mb-4">
            <ConfettiDots />
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
              animate={{ opacity: 1, scale: [0.3, 1.15, 1], rotate: [-20, 5, 0] }}
              transition={{ duration: 0.7, ease: SPRING, delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-success flex items-center justify-center relative z-10"
            >
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </motion.div>
          </div>

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
