import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardShellProps {
  children: React.ReactNode;
  className?: string;
}

const SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

export default function CardShell({ children, className }: CardShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: SPRING, delay: 0.1 }}
      className={cn(
        'w-full max-w-[560px] bg-card rounded-card overflow-hidden shadow-card',
        className
      )}
    >
      {/* 3px accent bar */}
      <div className="h-[3px] accent-bar" />
      {children}
    </motion.div>
  );
}
