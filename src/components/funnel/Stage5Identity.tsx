import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import { z } from 'zod';
import CardShell from './CardShell';
import CardHeader from './CardHeader';
import AddressChip from './AddressChip';

interface Stage5Props {
  address: string;
  onComplete: (name: string, email: string, phone: string) => void;
}

const identitySchema = z.object({
  name: z.string().min(2, 'Please enter your full name').max(100),
  email: z.string().email('Please enter a valid email address').max(255),
  phone: z.string()
    .transform(v => v.replace(/\D/g, ''))
    .refine(v => v.length === 10, 'Please enter a 10-digit US phone number'),
});

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export default function Stage5Identity({ address, onComplete }: Stage5Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = identitySchema.safeParse({ name, email, phone });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onComplete(name.trim(), email.trim(), result.data.phone);
    }, 600);
  };

  const inputClasses = (field: string) =>
    `w-full px-4 py-[14px] rounded-lg text-[14px] text-foreground placeholder:text-text-dim focus:outline-none transition-all`;

  const inputStyle = (field: string) => ({
    background: 'hsl(var(--surface-2))',
    border: `1.5px solid ${errors[field] ? 'hsl(0 84% 60%)' : 'hsl(var(--border-input))'}`,
    boxShadow: errors[field] ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <CardShell>
        <CardHeader subtitle="LPT Holdings — Almost There" stage={5} />
        <AddressChip address={address} />

        <form onSubmit={handleSubmit} className="px-7 pt-7 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <h2 className="text-[18px] font-bold tracking-[-0.3px] text-foreground mb-1">
              Who should we contact?
            </h2>
            <p className="text-[13px] text-text-body mb-6">
              Just you and your specialist — we never share or sell your information.
            </p>
          </motion.div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && emailRef.current?.focus()}
                placeholder="Your full name"
                autoComplete="name"
                className={inputClasses('name')}
                style={inputStyle('name')}
              />
              {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
              <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground mb-1.5 block">Email Address</label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && phoneRef.current?.focus()}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClasses('email')}
                style={inputStyle('email')}
              />
              {errors.email && <p className="text-[11px] text-destructive mt-1">{errors.email}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
              <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-foreground mb-1.5 block">Phone Number</label>
              <input
                ref={phoneRef}
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="(555) 555-5555"
                autoComplete="tel"
                className={inputClasses('phone')}
                style={inputStyle('phone')}
              />
              {errors.phone && <p className="text-[11px] text-destructive mt-1">{errors.phone}</p>}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-2 mt-5 mb-6"
          >
            <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By submitting, you agree to be contacted by your specialist. Msg & data rates may apply.
            </p>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-[14px] text-[14px] font-bold tracking-[0.3px] cursor-pointer border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-navy text-gold"
            style={{ boxShadow: '0 2px 8px rgba(27,43,75,0.25)', height: 52 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Finding your specialist…
              </>
            ) : (
              'Complete My Assessment →'
            )}
          </motion.button>
        </form>
      </CardShell>
    </div>
  );
}
