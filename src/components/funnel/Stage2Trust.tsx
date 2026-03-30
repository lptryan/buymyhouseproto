import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { playButtonSound } from '@/lib/sounds';

interface Stage2Props {
  onContinue: () => void;
}

const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

const VALUE_PROPS = [
  {
    icon: Zap,
    title: 'Speed',
    desc: 'Get a comprehensive property assessment within 24 hours. No waiting weeks for agent callbacks.',
  },
  {
    icon: ShieldCheck,
    title: 'Certainty',
    desc: 'Data-driven analysis from multiple sources gives you a clear picture of your home\'s market position.',
  },
  {
    icon: Sparkles,
    title: 'Simplicity',
    desc: 'One specialist handles everything. No juggling calls, no open houses unless you want them.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter Your Address', desc: 'Tell us where your property is located' },
  { step: '02', title: 'Get Your Assessment', desc: 'Our system analyzes market data in real-time' },
  { step: '03', title: 'Choose Your Path', desc: 'Work with a dedicated specialist on your terms' },
];

export default function Stage2Trust({ onContinue }: Stage2Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(statsRef, { once: true, amount: 0.5 });

  const sellersCount = useCounter(12400, 1200, isInView);
  const assessedCount = useCounter(21, 1200, isInView);
  const ratingCount = useCounter(49, 800, isInView);

  // Scroll into view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={sectionRef} className="bg-background py-16 px-5">
      <div className="max-w-[560px] mx-auto">
        {/* Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SPRING, delay: 0.1 }}
        >
          <h2
            className="text-[18px] font-bold tracking-[-0.3px] text-center mb-2"
            style={{ color: '#1B2B4B' }}
          >
            Why Sellers Choose BuyMyHouse
          </h2>
          <p className="text-[13px] text-center mb-10" style={{ color: '#4A5E72' }}>
            A smarter way to sell — backed by data, delivered by experts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: SPRING, delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-card overflow-hidden text-center p-6"
              style={{
                boxShadow: '0 1px 3px rgba(27,43,75,0.06), 0 8px 24px rgba(27,43,75,0.08), 0 24px 48px rgba(27,43,75,0.06)',
              }}
            >
              <div className="h-[3px] accent-bar -mx-6 -mt-6 mb-5" />
              <div
                className="w-10 h-10 rounded-icon-bg mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#1B2B4B' }}
              >
                <prop.icon className="w-5 h-5" style={{ color: '#C8A96E' }} strokeWidth={1.8} />
              </div>
              <h3 className="text-[14px] font-bold mb-2" style={{ color: '#1B2B4B' }}>
                {prop.title}
              </h3>
              <p className="text-[12px] leading-relaxed" style={{ color: '#4A5E72' }}>
                {prop.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SPRING, delay: 0.5 }}
          className="bg-card rounded-card overflow-hidden mb-12"
          style={{
            boxShadow: '0 1px 3px rgba(27,43,75,0.06), 0 8px 24px rgba(27,43,75,0.08), 0 24px 48px rgba(27,43,75,0.06)',
          }}
        >
          <div className="h-[3px] accent-bar" />
          <div className="grid grid-cols-3 divide-x py-6" style={{ borderColor: '#E4ECF4' }}>
            <div className="text-center px-4">
              <div
                className="text-[22px] font-extrabold tracking-[-0.5px] mb-1"
                style={{ color: '#1B2B4B', fontVariantNumeric: 'tabular-nums' }}
              >
                {sellersCount.toLocaleString()}+
              </div>
              <div className="text-[9px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#9AABB8' }}>
                Sellers Helped
              </div>
            </div>
            <div className="text-center px-4">
              <div
                className="text-[22px] font-extrabold tracking-[-0.5px] mb-1"
                style={{ color: '#1B2B4B', fontVariantNumeric: 'tabular-nums' }}
              >
                ${(assessedCount / 10).toFixed(1)}B
              </div>
              <div className="text-[9px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#9AABB8' }}>
                Homes Assessed
              </div>
            </div>
            <div className="text-center px-4">
              <div
                className="text-[22px] font-extrabold tracking-[-0.5px] mb-1"
                style={{ color: '#1B2B4B', fontVariantNumeric: 'tabular-nums' }}
              >
                {(ratingCount / 10).toFixed(1)}★
              </div>
              <div className="text-[9px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#9AABB8' }}>
                Average Rating
              </div>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SPRING, delay: 0.6 }}
          className="mb-10"
        >
          <h2
            className="text-[18px] font-bold tracking-[-0.3px] text-center mb-8"
            style={{ color: '#1B2B4B' }}
          >
            How It Works
          </h2>

          <div className="space-y-4">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.34, 1.3, 0.64, 1] as [number, number, number, number], delay: 0.7 + i * 0.08 }}
                className="flex items-center gap-4 bg-card rounded-xl p-4"
                style={{ border: '1px solid #F0F3F7' }}
              >
                <div
                  className="w-10 h-10 rounded-icon-bg flex items-center justify-center shrink-0"
                  style={{ background: '#1B2B4B' }}
                >
                  <span className="text-[12px] font-bold" style={{ color: '#C8A96E' }}>
                    {item.step}
                  </span>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold" style={{ color: '#1B2B4B' }}>
                    {item.title}
                  </h4>
                  <p className="text-[11px]" style={{ color: '#9AABB8' }}>
                    {item.desc}
                  </p>
                </div>
                {/* Connecting line except last */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <motion.button
            onClick={() => { playButtonSound(); onContinue(); }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-[14px] text-[14px] font-bold tracking-[0.3px] cursor-pointer border-none transition-all"
            style={{
              background: '#1B2B4B',
              color: '#C8A96E',
              boxShadow: '0 2px 8px rgba(27,43,75,0.25)',
            }}
          >
            Continue to My Assessment
            <ArrowRight className="w-4 h-4" style={{ color: '#C8A96E' }} />
          </motion.button>
          <p className="text-center text-[10px] mt-3" style={{ color: '#9AABB8' }}>
            No obligation · Takes less than 2 minutes
          </p>
        </motion.div>
      </div>
    </div>
  );
}
