import { motion } from 'framer-motion';

interface FunnelProgressProps {
  currentStage: 3 | 4 | 5 | 6 | 7;
}

const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

export default function FunnelProgress({ currentStage }: FunnelProgressProps) {
  // Stage 3 = dot 0, Stage 7 = dot 4
  const dotIndex = currentStage - 3;

  return (
    <div className="flex gap-1.5">
      {[0, 1, 2, 3, 4].map(i => {
        const isCompleted = i < dotIndex;
        const isCurrent = i === dotIndex;
        const isFinal = currentStage === 7 && isCurrent;

        return (
          <motion.div
            key={i}
            className="w-[6px] h-[6px] rounded-full"
            style={{
              background: isFinal
                ? 'hsl(var(--gold))'
                : isCompleted || isCurrent
                ? 'hsl(var(--navy))'
                : 'hsl(var(--border-input))',
            }}
            animate={
              isCompleted
                ? { scale: [1, 1.3, 1] }
                : {}
            }
            transition={{
              duration: 0.3,
              ease: SPRING,
            }}
          />
        );
      })}
    </div>
  );
}
