import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Stage3Props {
  address: string;
  onComplete: () => void;
}

const springEntry: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const smoothExit: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface AnalysisStep {
  label: string;
  sources: string[];
}

const STEPS: AnalysisStep[] = [
  { label: 'Property Records & Tax History', sources: ['County Assessor', 'MLS History', 'Title Records'] },
  { label: 'Market Comparable Sales', sources: ['Zillow', 'Redfin', 'MLS Active'] },
  { label: 'Neighborhood Demand Score', sources: ['Days on Market', 'Absorption Rate'] },
  { label: 'Renovation & Value-Add Potential', sources: ['Permit History', 'ARV Comps'] },
  { label: 'Investor & Buyer Demand Index', sources: ['Active Buyers', 'Cash Buyer Pool'] },
];

const STEP_DURATION = 1600;
const SOURCE_STAGGER = 300;

export default function Stage3Evaluation({ address, onComplete }: Stage3Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [visibleSources, setVisibleSources] = useState<Record<number, number>>({});

  const totalSteps = STEPS.length;
  const progress = isComplete ? 100 : (completedSteps.length / totalSteps) * 100;

  // Run analysis sequence
  useEffect(() => {
    if (activeStep >= totalSteps) {
      setTimeout(() => setIsComplete(true), 400);
      setTimeout(onComplete, 2500);
      return;
    }

    setExpandedStep(activeStep);

    // Animate sources appearing one by one
    const sources = STEPS[activeStep].sources;
    sources.forEach((_, i) => {
      setTimeout(() => {
        setVisibleSources(prev => ({ ...prev, [activeStep]: i + 1 }));
      }, SOURCE_STAGGER * (i + 1));
    });

    // Complete step after duration
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, activeStep]);
      setExpandedStep(null);
      setTimeout(() => setActiveStep(prev => prev + 1), 200);
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [activeStep, totalSteps, onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: springEntry, delay: 0.1 }}
        className="w-full max-w-[560px] bg-card rounded-card shadow-card overflow-hidden"
      >
        {/* Accent bar */}
        <div className="h-[3px] accent-bar" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-extrabold tracking-[-0.3px] text-foreground">
              BuyMyHouse
            </span>
            <span className="text-[13px] font-extrabold tracking-[-0.3px] text-gold">.com</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-2 rounded-badge px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-success">
              Live Analysis
            </span>
          </div>
        </div>

        {/* Address row */}
        <div className="mx-6 mb-5 flex items-center gap-3 bg-surface-2 rounded-lg px-4 py-3">
          <div className="w-8 h-8 rounded-icon-bg bg-primary flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <p className="text-[13px] font-medium text-foreground truncate">
            {address || '123 Main St, Anytown, USA'}
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 pb-4 space-y-2">
          {STEPS.map((step, i) => {
            const isActive = activeStep === i;
            const isDone = completedSteps.includes(i);
            const isExpanded = expandedStep === i;
            const sourcesVisible = visibleSources[i] || 0;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.34, 1.3, 0.64, 1], delay: i * 0.08 }}
              >
                {/* Step header */}
                <div className="flex items-center gap-3 py-2">
                  {/* Step dot */}
                  <motion.div
                    animate={isDone ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.3, ease: springEntry }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-success'
                        : isActive
                        ? 'bg-primary'
                        : 'bg-surface-2'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-card" />
                    ) : (
                      <span className={`text-[10px] font-semibold ${
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-[13px] font-medium ${
                        isDone ? 'text-foreground' : isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                      <span className={`text-[10px] font-medium ml-2 shrink-0 ${
                        isDone ? 'text-success' : isActive ? 'text-muted-foreground' : 'text-text-dim'
                      }`}>
                        {isDone ? '✓ Complete' : isActive ? 'Analyzing…' : 'Pending'}
                      </span>
                    </div>

                    {/* Progress bar for active step */}
                    {isActive && (
                      <div className="mt-2 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: STEP_DURATION / 1000, ease: smoothExit }}
                          className="h-full bg-primary rounded-full relative overflow-hidden"
                        >
                          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-card/60 to-transparent" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded sources (Kayak-style) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: smoothExit }}
                      className="overflow-hidden"
                    >
                      <div className="pl-9 pb-2 space-y-1">
                        {step.sources.map((source, si) => (
                          <motion.div
                            key={si}
                            initial={{ opacity: 0, x: -8 }}
                            animate={si < sourcesVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">{source}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Master progress */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-[13px] font-semibold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: smoothExit }}
              className="h-full bg-primary rounded-full relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-card/60 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Result summary */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: springEntry }}
              className="mx-6 mb-6 bg-primary rounded-lg p-5 text-center"
            >
              <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-primary-foreground/60 mb-1">
                Analysis Complete
              </p>
              <TypewriterText
                text="847 Active Buyers in Your Market"
                className="text-[18px] font-bold tracking-[-0.3px] text-primary-foreground"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <p className={className}>{displayed}<span className="animate-pulse">|</span></p>;
}
