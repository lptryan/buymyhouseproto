import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, Plane, Home, ArrowDownRight, ArrowUpRight, RefreshCw, Search, Clock, Calendar, Timer, Hourglass, Compass, Sparkles, ThumbsUp, Wrench, AlertTriangle, HardHat, ArrowLeft } from 'lucide-react';
import type { Motivation, Timeline, Condition } from '@/lib/types';

interface Stage4Props {
  address: string;
  onComplete: (motivation: Motivation, timeline: Timeline, condition: Condition) => void;
  onBack: () => void;
}

const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const MOTIVATION_OPTIONS: { value: Motivation; label: string; sub: string; icon: typeof DollarSign }[] = [
  { value: 'financial_pressure', label: 'Financial Pressure', sub: 'Need to free up equity or cash', icon: DollarSign },
  { value: 'relocating', label: 'Relocating', sub: 'Moving for work or personal reasons', icon: Plane },
  { value: 'inherited', label: 'Inherited Property', sub: 'Managing an estate or inherited home', icon: Home },
  { value: 'downsizing', label: 'Downsizing', sub: 'Looking for something smaller', icon: ArrowDownRight },
  { value: 'upgrading', label: 'Upgrading', sub: 'Ready for a larger home', icon: ArrowUpRight },
  { value: 'divorce', label: 'Life Change', sub: 'Divorce or relationship transition', icon: RefreshCw },
  { value: 'other', label: 'Just Exploring', sub: 'Curious about what my home is worth', icon: Search },
];

const TIMELINE_OPTIONS: { value: Timeline; label: string; sub: string; icon: typeof Clock }[] = [
  { value: 'asap', label: 'ASAP — Under 30 Days', sub: 'I need to move quickly', icon: Clock },
  { value: '1_3_months', label: '1–3 Months', sub: 'Moderate urgency', icon: Calendar },
  { value: '3_6_months', label: '3–6 Months', sub: 'Planning ahead', icon: Timer },
  { value: '6_plus', label: '6+ Months', sub: 'No immediate rush', icon: Hourglass },
  { value: 'exploring', label: 'Just Exploring', sub: 'No timeline yet', icon: Compass },
];

const CONDITION_OPTIONS: { value: Condition; label: string; sub: string; icon: typeof Sparkles }[] = [
  { value: 'excellent', label: 'Move-In Ready', sub: 'Updated, well-maintained', icon: Sparkles },
  { value: 'good', label: 'Good Condition', sub: 'Minor wear, no major issues', icon: ThumbsUp },
  { value: 'fair', label: 'Fair — Some Updates Needed', sub: 'Cosmetic work required', icon: Wrench },
  { value: 'needs_work', label: 'Needs Work', sub: 'Multiple updates or repairs needed', icon: AlertTriangle },
  { value: 'major_repairs', label: 'Major Repairs', sub: 'Significant structural or system issues', icon: HardHat },
];

const QUESTIONS = [
  { title: "What's your primary reason for selling?", options: MOTIVATION_OPTIONS },
  { title: "How soon are you looking to move?", options: TIMELINE_OPTIONS },
  { title: "What's the current condition of the home?", options: CONDITION_OPTIONS },
];

export default function Stage4Qualification({ address, onComplete, onBack }: Stage4Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null, null]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedValue(null);
      if (currentQ < 2) {
        setDirection(1);
        setCurrentQ(currentQ + 1);
      } else {
        onComplete(
          newAnswers[0] as Motivation,
          newAnswers[1] as Timeline,
          newAnswers[2] as Condition,
        );
      }
    }, 350);
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(currentQ - 1);
    } else {
      onBack();
    }
  };

  const question = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SPRING, delay: 0.1 }}
        className="w-full max-w-[560px] bg-card rounded-card overflow-hidden shadow-card"
      >
        {/* Accent bar */}
        <div className="h-[3px] accent-bar" />

        {/* Header */}
        <div className="px-7 pt-6 pb-5 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border-light))' }}>
          <div>
            <div className="text-[13px] font-extrabold tracking-[-0.3px] text-foreground">
              Buy<span className="text-gold">My</span>House
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 tracking-[0.3px]">
              LPT Holdings — Qualification
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-text-body">Question {currentQ + 1} of 3</span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-[6px] h-[6px] rounded-full transition-all duration-300"
                  style={{
                    background: i <= currentQ ? 'hsl(var(--navy))' : 'hsl(var(--border-input))',
                    transform: i === currentQ ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
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

        {/* Question content */}
        <div className="px-7 pt-7 pb-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQ}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: [0.34, 1.3, 0.64, 1] as [number, number, number, number] }}
            >
              <h2 className="text-[18px] font-bold tracking-[-0.3px] text-foreground mb-6">
                {question.title}
              </h2>

              <div className="space-y-3">
                {question.options.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedValue === opt.value || (selectedValue === null && answers[currentQ] === opt.value);
                  return (
                    <motion.button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center gap-3.5 rounded-xl p-4 cursor-pointer text-left transition-all duration-200"
                      style={{
                        background: isSelected ? 'hsl(214 40% 96%)' : 'hsl(var(--card))',
                        border: `1.5px solid ${isSelected ? 'hsl(var(--navy))' : 'hsl(var(--border-input))'}`,
                        borderLeft: isSelected ? '4px solid hsl(var(--gold))' : '1.5px solid hsl(var(--border-input))',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-icon-bg flex items-center justify-center shrink-0"
                        style={{ background: 'hsl(var(--navy))' }}
                      >
                        <Icon className="w-5 h-5 text-gold" strokeWidth={1.8} />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-foreground">{opt.label}</div>
                        <div className="text-[11px] text-muted-foreground">{opt.sub}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Back button */}
        <div className="px-7 pb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[13px] font-medium text-text-body hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
