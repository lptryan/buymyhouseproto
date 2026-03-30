import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { playCompletionChime } from '@/lib/sounds';
import CardShell from './CardShell';
import AddressChip from './AddressChip';

/* ── Synthesized loading sound (Nintendo eShop-inspired gentle chime loop) ── */
function createLoadingSound() {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let intervalId: number | null = null;
  let stopped = false;

  const start = () => {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.12;
      masterGain.connect(ctx.destination);

      // Gentle pentatonic notes for a warm, techy feel
      const notes = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33];
      let noteIndex = 0;

      const playNote = () => {
        if (stopped || !ctx || !masterGain) return;

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Soft sine/triangle blend
        osc.type = noteIndex % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = notes[noteIndex % notes.length];

        // Gentle low-pass for warmth
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;

        // Soft envelope
        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.3, now + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.5);
        noteIndex++;
      };

      // Play first note immediately, then loop
      playNote();
      intervalId = window.setInterval(playNote, 500);
    } catch { /* silent fallback */ }
  };

  const stop = () => {
    stopped = true;
    if (intervalId) clearInterval(intervalId);
    if (masterGain && ctx) {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => ctx?.close(), 400);
    }
  };

  return { start, stop };
}

interface Stage3Props {
  address: string;
  onComplete: () => void;
}

/* ── Easing curves ── */
const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/* ── Step config ── */
interface StepConfig {
  label: string;
  subSources?: string[];
}

function getSteps(address: string): StepConfig[] {
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

/* ── Timing ── */
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
  const [visibleSources, setVisibleSources] = useState<Record<number, number>>({});
  const [confirmedSources, setConfirmedSources] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [statShown, setStatShown] = useState<boolean[]>([false, false, false, false]);
  const [advancing, setAdvancing] = useState(false);
  const timersRef = useRef<number[]>([]);
  const cdRef = useRef<number | null>(null);
  const loadingSoundRef = useRef<ReturnType<typeof createLoadingSound> | null>(null);

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

  useEffect(() => {
    // Start loading sound
    const sound = createLoadingSound();
    loadingSoundRef.current = sound;
    T(600, () => sound.start()); // slight delay to sync with first step appearing

    TIMELINE.forEach((tl, i) => {
      T(tl.show, () => setStep(i, 'visible'));
      T(tl.activate, () => {
        setStep(i, 'active');
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

    T(7300, () => {
      setShowResult(true);
      // Stop loading sound when results appear
      loadingSoundRef.current?.stop();
    });
    T(7700, () => setStatShown(prev => { const n = [...prev]; n[0] = true; return n; }));
    T(7900, () => setStatShown(prev => { const n = [...prev]; n[1] = true; return n; }));
    T(8100, () => setStatShown(prev => { const n = [...prev]; n[2] = true; return n; }));
    T(8300, () => setStatShown(prev => { const n = [...prev]; n[3] = true; return n; }));
    T(8600, () => setShowAction(true));

    return () => {
      timersRef.current.forEach(clearTimeout);
      if (cdRef.current) clearInterval(cdRef.current);
      loadingSoundRef.current?.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <CardShell>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="px-7 pt-6 pb-5 flex items-center justify-between border-b border-border-light"
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
            style={{ background: 'hsl(210 100% 97%)', border: '1px solid hsl(209 64% 89%)', color: 'hsl(var(--link-blue))' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-live-pulse" />
            Analyzing
          </div>
        </motion.div>

        <AddressChip address={address} />

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
            <span className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-[13px] font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {masterPct}%
            </span>
          </div>
          <div className="h-1 rounded-sm overflow-hidden relative" style={{ background: 'hsl(var(--body-bg))' }}>
            <div
              className="h-full rounded-sm relative"
              style={{
                width: `${masterPct}%`,
                background: 'linear-gradient(90deg, hsl(var(--navy)) 0%, hsl(var(--mid-blue)) 60%, hsl(var(--gold)) 100%)',
                transition: 'width 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div
                className="absolute right-0 rounded-full"
                style={{
                  top: '-2px',
                  width: 8,
                  height: 8,
                  background: 'hsl(var(--gold))',
                  opacity: 0.7,
                  boxShadow: '0 0 6px 2px hsla(var(--gold) / 0.4)',
                }}
              />
            </div>
          </div>
          <div className="flex justify-between px-px mt-[5px]">
            {[0, 1, 2, 3, 4].map(n => (
              <div
                key={n}
                className="rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: stepStates[n] === 'done' ? 'hsl(var(--navy))' : 'hsl(var(--border-input))',
                  transform: stepStates[n] === 'done' ? 'scale(1.5)' : 'scale(1)',
                  transition: 'background 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Result Card */}
        <AnimatePresence>
          {showResult && <ResultCard statShown={statShown} address={address} />}
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
              <span className="text-[11px] text-muted-foreground">
                Continuing in <span className="font-semibold text-foreground">{countdown}</span>s
              </span>
              <button
                onClick={handleAdvance}
                className="flex items-center gap-2 rounded-lg px-6 py-[11px] text-[13px] font-semibold tracking-[0.3px] cursor-pointer border-none transition-all bg-navy text-white"
                style={{
                  background: advancing ? 'hsl(var(--success))' : 'hsl(var(--navy))',
                  boxShadow: '0 2px 8px rgba(27,43,75,0.25), 0 1px 2px rgba(27,43,75,0.15)',
                }}
              >
                {advancing ? 'Advancing…' : 'Continue to Qualification'}
                {!advancing && (
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ background: 'hsla(var(--gold) / 0.25)' }}
                  >
                    <ArrowRight className="w-2 h-2 text-gold" />
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardShell>
    </div>
  );
}

/* ═══ STEP ROW ═══ */
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
            border: `1.5px solid ${isDone || isActive ? 'hsl(var(--navy))' : 'hsl(var(--border-input))'}`,
            background: isDone ? 'hsl(var(--navy))' : isActive ? 'hsl(214 40% 96%)' : 'hsl(var(--card))',
            transition: 'border-color 0.3s ease, background 0.3s ease',
            animation: isDone ? 'dotComplete 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
          }}
        >
          {isActive && (
            <div
              className="absolute rounded-full animate-ring-pulse"
              style={{ inset: -4, border: '1.5px solid hsl(var(--navy))', opacity: 0.2 }}
            />
          )}
          {isDone && (
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <polyline points="1.5,5.5 4,8 8.5,2.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Step body */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[12.5px] mb-1.5 truncate"
            style={{
              fontWeight: isActive ? 600 : 500,
              color: isActive || isDone ? 'hsl(var(--navy))' : 'hsl(var(--text-body))',
              transition: 'color 0.3s ease',
            }}
          >
            {step.label}
          </div>
          <div className="h-0.5 rounded-sm overflow-hidden relative" style={{ background: 'hsl(var(--body-bg))' }}>
            <div
              className="h-full rounded-sm relative"
              style={{
                width: isActive || isDone ? '100%' : '0%',
                background: isDone
                  ? 'linear-gradient(90deg, hsl(var(--navy)), hsl(var(--link-blue)))'
                  : 'linear-gradient(90deg, hsl(var(--mid-blue)), hsl(var(--navy)))',
                transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
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
            color: isDone ? 'hsl(var(--success))' : isActive ? 'hsl(var(--link-blue))' : 'hsl(var(--text-dim))',
            fontWeight: isDone ? 600 : 400,
            transition: 'color 0.3s ease',
          }}
        >
          {isDone ? 'Done' : isActive ? 'Scanning' : '—'}
        </span>
      </div>

      {/* Sub-sources */}
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
                  color: isConfirmed ? 'hsl(var(--success))' : isSourceVisible ? 'hsl(var(--text-muted))' : 'hsl(var(--text-dim))',
                  transition: 'opacity 0.3s ease, color 0.3s ease',
                }}
              >
                <div className="rounded-full shrink-0" style={{ width: 4, height: 4, background: 'currentColor' }} />
                {source}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ═══ RESULT CARD ═══ */
function ResultCard({ statShown, address }: { statShown: boolean[]; address: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] as [number, number, number, number] }}
      className="mx-5 mb-5 rounded-xl relative overflow-hidden bg-surface-2 border border-border-light"
      style={{ padding: '20px 22px', boxShadow: '0 4px 16px rgba(27,43,75,0.08)' }}
    >
      {/* Left accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl accent-bar"
        style={{ background: 'linear-gradient(180deg, hsl(var(--navy)), hsl(var(--gold)))' }}
      />

      <div className="flex items-start justify-between mb-3">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[10px] font-bold tracking-[1.5px] uppercase rounded-badge px-3 py-1 bg-navy text-gold"
        >
          Strong Alignment
        </motion.div>
        <span className="text-[11px] pt-0.5 text-muted-foreground">Confidence · 94%</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-[22px] font-extrabold tracking-[-0.5px] leading-tight mb-1.5 text-foreground"
      >
        Top Market Tier
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-[11px] uppercase tracking-[1px] mb-4 text-muted-foreground"
      >
        Active Demand · ZIP {address.match(/\d{5}/)?.[0] || '85251'} · Top Quartile
      </motion.div>

      <div className="mb-[18px] min-h-[42px]">
        <TypewriterText
          text="Your property aligns strongly with active market conditions. A certified LPT agent will review your assessment and reach out within 48 hours."
          speed={20}
        />
      </div>

      <div className="grid grid-cols-4 pt-4 border-t border-border-light">
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
  label, value, unit, shown, isText, isLast,
}: {
  label: string; value: string | number; unit: string; shown: boolean; isText?: boolean; isLast?: boolean;
}) {
  const [displayVal, setDisplayVal] = useState<string>('—');

  useEffect(() => {
    if (!shown) return;
    if (isText || typeof value === 'string') { setDisplayVal(value as string); return; }
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
        borderRight: isLast ? 'none' : '1px solid hsl(var(--border-light))',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      <div className="text-[9px] tracking-[1.5px] uppercase mb-1 text-muted-foreground">{label}</div>
      <div className="text-[16px] font-extrabold leading-none text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {displayVal}
      </div>
      <div className="text-[9px] mt-0.5 text-muted-foreground">{unit}</div>
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

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-[13px] leading-[1.65] text-text-body">
      {displayed}
      <span
        className="inline-block align-bottom ml-0.5 bg-foreground"
        style={{ width: 1.5, height: 14, opacity: showCursor ? 1 : 0 }}
      />
    </p>
  );
}
