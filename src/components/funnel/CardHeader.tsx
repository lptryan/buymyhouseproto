import { motion } from 'framer-motion';
import FunnelProgress from './FunnelProgress';

interface CardHeaderProps {
  subtitle: string;
  stage?: 3 | 4 | 5 | 6 | 7;
  rightContent?: React.ReactNode;
}

export default function CardHeader({ subtitle, stage, rightContent }: CardHeaderProps) {
  return (
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
          {subtitle}
        </div>
      </div>
      {rightContent || (stage && <FunnelProgress currentStage={stage} />)}
    </motion.div>
  );
}
