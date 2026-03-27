import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Check, ArrowRight } from 'lucide-react';

interface Stage3Props {
  address: string;
  onComplete: () => void;
}

/* ── Easing curves (exact from reference) ── */
const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1];
const GENTLE_SPRING: [number, number, number, number] = [0.34, 1.3, 0.64, 1];

/* ── Step config ── */
interface StepConfig {
  label: string;
  subSources?: string[];
}

function getSteps(address: string): StepConfig[] {
  // Extract zip and city from address for dynamic labels
  const parts = address.split(',').map(s => s.trim());
  const city = parts[1] || 'Scottsdale';
  const zipMatch = address.match(/\d{5}/);
  const zip = zipMatch ? zipMatch[0] : '85251';

  return [
    {
      label: `Pulling MLS records · ZIP ${zip}`,
      subSources: ['ARMLS feed · 90-day window', 'County assessor records', '6 comparable sales located'],
    },
    { label: 'Scoring comparable sales · 6 matches' },
    {
      label: 'Calculating buyer demand index',
      subSources: ['Days-on-market velocity · avg 14d', 'List-to-sale ratio · 101.3%', 'Active buyer index · 87 / 100'],
    },
    { label: 'Establishing estimated value band' },
    { label: `Matching certified agent · ${city}` },
  ];
}

/* ── Timing (exact from reference JS) ── */
const TIMELINE = [
  { show: 700, activate: 900, complete: 2000, masterAt: [{ t: 900, v: 5 }, { t: 1600, v: 22 }], subDelays: [200, 500, 820] },
  { show: 2100, activate: 2250, complete: 3200, masterAt: [{ t: 2250, v: 38 }, { t: 3200, v: 50 }] },
  { show: 3300, activate: 3450, complete: 4600, masterAt: [{ t: 3450, v: 62 }, { t: 4600, v: 74 }], subDelays: [180, 450, 760] },
  { show: 4700, activate: 4850, complete: 5750, masterAt: [{ t: 4850, v: 84 }, { t: 5750, v: 91 }] },
  { show: 5850, activate: 6000, complete: 7000, masterAt: [{ t: 6000, v: 96 }, { t: 7000, v: 100 }] },
];

type StepState = 'pending' | 'visible' | 'active' | 'done';

export default function Stage3Evaluation({ address, onComplete }: Stage3Props) {
  const steps = getSteps(address);
  const [stepStates, setStepStates] = useState<StepState[]>(Array(5).fill('pending'));
  const [masterPct, setMasterPct] = useState(0);
  const [visibleSources, setVisibleSources] = useState<Record<number, number>>({}); // stepIdx → count visible
  const [confirmedSources, setConfirmedSources] = useState<Record<string, boolean>>({}); // "stepIdx-sourceIdx" → true
  const [showResult, setShowResult] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [statShown, setStatShown] = useState<boolean[]>([false, false, false, false]);
  const [advancing, setAdvancing] = useState(false);
  const timersRef = useRef<number[]>([]);
  const cdRef = useRef<number | null>(null);

  const T = useCallback((delay: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, delay));
  }, []);

  const setStep = useCallback((idx: number, state: StepState) => {
    setStepStates(prev => {
      const next = [...prev];
      next[idx] = state;
      return next;
    });
  }, []);

  // Run sequence on mount
  useEffect(() => {
    // Show master progress
    T(600, () => {}); // master is always visible via state

    TIMELINE.forEach((tl, i) => {
      T(tl.show, () => setStep(i, 'visible'));
      T(tl.activate, () => {
        setStep(i, 'active');
        // Sub-sources
        if (tl.subDelays && steps[i].subSources) {
          steps[i].subSources!.forEach((_, si) => {
            T(tl.activate + tl.subDelays![si], () => {
              setVisibleSources(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }));
            });
            T(tl.activate + tl.subDelays![si] + 550, () => {
              setConfirmedSources(prev => ({ ...prev, [`${i}-${si}`]: true }));
            });
          });
        }
      });
      T(tl.complete, () => setStep(i, 'done'));
      tl.masterAt.forEach(({ t, v }) => T(t, () => setMasterPct(v)));
    });

    // Result reveal
    T(7300, () => setShowResult(true));
    // Stats stagger
    T(7700, () => setStatShown(prev => { const n = [...prev]; n[0] = true; return n; }));
    T(7900, () => setStatShown(prev => { const n = [...prev]; n[1] = true; return n; }));
    T(8100, () => setStatShown(prev => { const n = [...prev]; n[2] = true; return n; }));
    T(8300, () => setStatShown(prev => { const n = [...prev]; n[3] = true; return n; }));
    // Action row
    T(8600, () => setShowAction(true));

    return () => {
      timersRef.current.forEach(clearTimeout);
      if (cdRef.current) clearInterval(cdRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown
  useEffect(() => {
    if (!showAction) return;
    setCountdown(3);
    cdRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(cdRef.current!);
          setAdvancing(true);
          setTimeout(onComplete, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (cdRef.current) clearInterval(cdRef.current); };
  }, [showAction, onComplete]);

  const handleAdvance = () => {
    if (cdRef.current) clearInterval(cdRef.current);
    setAdvancing(true);
    setTimeout(onComplete, 400);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SPRING, delay: 0.1 }}
        className="w-full max-w-[560px] bg-card rounded-card overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(27,43,75,0.06), 0 8px 24px rgba(27,43,75,0.08), 0 24px 48px rgba(27,43,75,0.06)' }}
      >
        {/* Accent bar */}
        <div className="h-[3px] accent-bar" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="px-7 pt-6 pb-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F3F7' }}
        >
          <div>
            <div className="text-[13px] font-extrabold tracking-[-0.3px] text-foreground">
              Buy<span className="text-gold">My</span>House
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 tracking-[0.3px]">
              LPT Holdings — Market Assessment
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-badge px-3 py-[5px] text-[11px] font-semibold tracking-[0.3px]"
            style={{ background: '#F0F7FF', border: '1px solid #D0E4F7', color: '#2E6AAA' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-live-pulse" />
            Analyzing
          </div>
        </motion.div>

        {/* Address Row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="px-7 py-[18px] flex items-center gap-3"
          style={{ background: '#F8FAFC', borderBottom: '1px solid #F0F3F7' }}
        >
          <div className="w-[34px] h-[34px] rounded-icon-bg bg-primary flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" style={{ color: '#C8A96E' }} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground mb-0.5">
              Property
            </div>
            <div className="text-[13px] font-semibold text-foreground tracking-[-0.2px]">
              {address || '1847 Ridgeline Dr, Scottsdale AZ 85251'}
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="px-7 pt-6 pb-5">
          {steps.map((step, i) => (
            <StepRow
              key={i}
              step={step}
              state={stepStates[i]}
              index={i}
              visibleSourceCount={visibleSources[i] || 0}
              confirmedSources={confirmedSources}
            />
          ))}
        </div>

        {/* Master Progress */}
        <div className="px-7 pb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[1.5px]" style={{ color: '#9AABB8' }}>
              Overall Progress
            </span>
            <span
              className="text-[13px] font-bold text-foreground"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {masterPct}%
            </span>
          </div>
          <div className="h-1 rounded-sm overflow-hidden relative" style={{ background: '#EEF2F7' }}>
            <div
              className="h-full rounded-sm relative"
              style={{
                width: `${masterPct}%`,
                background: 'linear-gradient(90deg, #1B2B4B 0%, #2E4A7A 60%, #C8A96E 100%)',
                transition: 'width 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Leading edge glow */}
              <div
                className="absolute right-0 rounded-full"
                style={{
                  top: '-2px',
                  width: 8,
                  height: 8,
                  background: '#C8A96E',
                  opacity: 0.7,
                  boxShadow: '0 0 6px 2px rgba(200,169,110,0.4)',
                }}
              />
            </div>
          </div>
          {/* Milestone ticks */}
          <div className="flex justify-between px-px mt-[5px]">
            {[1, 2, 3, 4, 5].map(n => (
              <div
                key={n}
                className="rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: stepStates[n - 1] === 'done' ? '#1B2B4B' : '#D8E3ED',
                  transform: stepStates[n - 1] === 'done' ? 'scale(1.5)' : 'scale(1)',
                  transition: 'background 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Result Card */}
        <AnimatePresence>
          {showResult && (
            <ResultCard
              statShown={statShown}
              address={address}
            />
          )}
        </AnimatePresence>

        {/* Action Row */}
        <AnimatePresence>
          {showAction && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="px-5 pb-6 flex items-center justify-between"
            >
              <span className="text-[11px]" style={{ color: '#9AABB8' }}>
                Continuing in <span className="font-semibold text-foreground">{countdown}</span>s
              </span>
              <button
                onClick={handleAdvance}
                className="flex items-center gap-2 rounded-lg px-6 py-[11px] text-[13px] font-semibold tracking-[0.3px] cursor-pointer border-none transition-all"
                style={{
                  background: advancing ? '#2E9E60' : '#1B2B4B',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(27,43,75,0.25), 0 1px 2px rgba(27,43,75,0.15)',
                }}
              >
                {advancing ? 'Advancing…' : 'Continue to Qualification'}
                {!advancing && (
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ background: 'rgba(200,169,110,0.25)' }}
                  >
                    <ArrowRight className="w-2 h-2" style={{ color: '#C8A96E' }} />
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP ROW
   ════════════════════════════════════════════════════════════ */
interface StepRowProps {
  step: StepConfig;
  state: StepState;
  index: number;
  visibleSourceCount: number;
  confirmedSources: Record<string, boolean>;
}

function StepRow({ step, state, index, visibleSourceCount, confirmedSources }: StepRowProps) {
  const isVisible = state !== 'pending';
  const isActive = state === 'active';
  const isDone = state === 'done';
  const hasSubs = !!step.subSources;

  return (
    <>
      <div
        className="flex items-center gap-3.5 mb-[18px]"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
          transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)',
        }}
      >
        {/* Step dot */}
        <div
          className="relative flex items-center justify-center shrink-0"
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: `1.5px solid ${isDone ? '#1B2B4B' : isActive ? '#1B2B4B' : '#D8E3ED'}`,
            background: isDone ? '#1B2B4B' : isActive ? '#F0F4FA' : '#FFFFFF',
            transition: 'border-color 0.3s ease, background 0.3s ease',
            animation: isDone ? 'dotComplete 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
          }}
        >
          {/* Pulse ring for active */}
          {isActive && (
            <div
              className="absolute rounded-full animate-ring-pulse"
              style={{
                inset: -4,
                border: '1.5px solid #1B2B4B',
                opacity: 0.2,
              }}
            />
          )}
          {/* Checkmark */}
          {isDone && (
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <polyline points="1.5,5.5 4,8 8.5,2.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Step body */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[12.5px] mb-1.5 truncate"
            style={{
              fontWeight: isActive ? 600 : 500,
              color: isActive || isDone ? '#1B2B4B' : '#4A5E72',
              transition: 'color 0.3s ease',
            }}
          >
            {step.label}
          </div>
          {/* Track */}
          <div className="h-0.5 rounded-sm overflow-hidden relative" style={{ background: '#EEF2F7' }}>
            <div
              className="h-full rounded-sm relative"
              style={{
                width: isActive || isDone ? '100%' : '0%',
                background: isDone
                  ? 'linear-gradient(90deg, #1B2B4B, #2E6AAA)'
                  : 'linear-gradient(90deg, #2E4A7A, #1B2B4B)',
                transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Shimmer on active */}
              {isActive && (
                <div
                  className="absolute top-0 h-full"
                  style={{
                    right: -20,
                    width: 20,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    animation: 'shimmer 1.2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Status text */}
        <span
          className="text-[10px] tracking-[0.5px] min-w-[48px] text-right shrink-0"
          style={{
            color: isDone ? '#2E9E60' : isActive ? '#2E6AAA' : '#B0BEC8',
            fontWeight: isDone ? 600 : 400,
            transition: 'color 0.3s ease',
          }}
        >
          {isDone ? 'Done' : isActive ? 'Scanning' : '—'}
        </span>
      </div>

      {/* Sub-sources (Kayak-style) */}
      {hasSubs && (
        <div
          style={{
            marginTop: -10,
            marginBottom: 16,
            marginLeft: 34,
            maxHeight: isActive || isDone ? 80 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {step.subSources!.map((source, si) => {
            const isSourceVisible = si < visibleSourceCount;
            const isConfirmed = confirmedSources[`${index}-${si}`];
            return (
              <div
                key={si}
                className="flex items-center gap-[7px] h-5 text-[11px]"
                style={{
                  opacity: isSourceVisible ? 1 : 0,
                  color: isConfirmed ? '#2E9E60' : isSourceVisible ? '#7A94A8' : '#B0BEC8',
                  transition: 'opacity 0.3s ease, color 0.3s ease',
                }}
              >
                <div
                  className="rounded-full shrink-0"
                  style={{ width: 4, height: 4, background: 'currentColor' }}
                />
                {source}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   RESULT CARD
   ════════════════════════════════════════════════════════════ */
function ResultCard({ statShown, address }: { statShown: boolean[]; address: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] as [number, number, number, number] }}
      className="mx-5 mb-5 rounded-xl relative overflow-hidden"
      style={{
        background: '#F8FAFC',
        border: '1px solid #E4ECF4',
        padding: '20px 22px',
        boxShadow: '0 4px 16px rgba(27,43,75,0.08)',
      }}
    >
      {/* Left accent bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: 'linear-gradient(180deg, #1B2B4B, #C8A96E)',
          borderRadius: '12px 0 0 12px',
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[10px] font-bold tracking-[1.5px] uppercase rounded-badge px-3 py-1"
          style={{ background: '#1B2B4B', color: '#C8A96E' }}
        >
          Strong Alignment
        </motion.div>
        <span className="text-[11px] pt-0.5" style={{ color: '#9AABB8' }}>
          Confidence · 94%
        </span>
      </div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-[22px] font-extrabold tracking-[-0.5px] leading-tight mb-1.5"
        style={{ color: '#1B2B4B' }}
      >
        Top Market Tier
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-[11px] uppercase tracking-[1px] mb-4"
        style={{ color: '#7A94A8' }}
      >
        Active Demand · ZIP {address.match(/\d{5}/)?.[0] || '85251'} · Top Quartile
      </motion.div>

      {/* Typewriter body */}
      <div className="mb-[18px] min-h-[42px]">
        <TypewriterText
          text="Your property aligns strongly with active market conditions. A certified LPT agent will review your assessment and reach out within 48 hours."
          speed={20}
        />
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-4 pt-4"
        style={{ borderTop: '1px solid #E4ECF4' }}
      >
        <StatItem label="Est. Value" value="$487–521K" unit="RANGE" shown={statShown[0]} isText />
        <StatItem label="Demand" value={87} unit="/ 100" shown={statShown[1]} />
        <StatItem label="Days to Offer" value={14} unit="AVG" shown={statShown[2]} />
        <StatItem label="Comps" value={6} unit="MATCHED" shown={statShown[3]} isLast />
      </div>
    </motion.div>
  );
}

/* ── Stat Item ── */
function StatItem({
  label,
  value,
  unit,
  shown,
  isText,
  isLast,
}: {
  label: string;
  value: string | number;
  unit: string;
  shown: boolean;
  isText?: boolean;
  isLast?: boolean;
}) {
  const [displayVal, setDisplayVal] = useState<string>(typeof value === 'string' ? '—' : '—');

  useEffect(() => {
    if (!shown) return;
    if (isText || typeof value === 'string') {
      setDisplayVal(value as string);
      return;
    }
    const target = value as number;
    const duration = target > 50 ? 800 : target > 10 ? 600 : 400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayVal(String(Math.round(target * eased)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [shown, value, isText]);

  return (
    <div
      className="text-center px-1.5"
      style={{
        borderRight: isLast ? 'none' : '1px solid #E4ECF4',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      <div className="text-[9px] tracking-[1.5px] uppercase mb-1" style={{ color: '#9AABB8' }}>
        {label}
      </div>
      <div
        className="text-[16px] font-extrabold leading-none"
        style={{ color: '#1B2B4B', fontVariantNumeric: 'tabular-nums' }}
      >
        {displayVal}
      </div>
      <div className="text-[9px] mt-0.5" style={{ color: '#9AABB8' }}>
        {unit}
      </div>
    </div>
  );
}

/* ── Typewriter ── */
function TypewriterText({ text, speed }: { text: string; speed: number }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  // Blink cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-[13px] leading-[1.65]" style={{ color: '#4A5E72' }}>
      {displayed}
      <span
        className="inline-block align-bottom ml-0.5"
        style={{
          width: 1.5,
          height: 14,
          background: '#1B2B4B',
          opacity: showCursor ? 1 : 0,
        }}
      />
    </p>
  );
}
