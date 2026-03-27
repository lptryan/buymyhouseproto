import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface AddressChipProps {
  address: string;
  label?: string;
}

export default function AddressChip({ address, label = 'Property' }: AddressChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.55 }}
      className="px-7 py-[18px] flex items-center gap-3 bg-surface-2 border-y border-border-light"
    >
      <div className="w-[34px] h-[34px] rounded-icon-bg bg-navy flex items-center justify-center shrink-0">
        <MapPin className="w-4 h-4 text-gold" strokeWidth={1.8} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground mb-0.5">
          {label}
        </div>
        <div className="text-[13px] font-semibold text-foreground tracking-[-0.2px]">
          {address || '123 Main St, Austin TX 78701'}
        </div>
      </div>
    </motion.div>
  );
}
