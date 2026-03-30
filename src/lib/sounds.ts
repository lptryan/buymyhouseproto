/** Shared synthesized sound effects for the funnel */

/** Short crisp button click — Nintendo eShop inspired */
export function playButtonSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2400, now);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.06);

    setTimeout(() => ctx.close(), 200);
  } catch {}
}

/** Bright completion chime — rising two-note arpeggio */
export function playCompletionChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Note 1: E5
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    g1.gain.setValueAtTime(0.15, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Note 2: G5 (delayed)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12);
    g2.gain.setValueAtTime(0, now);
    g2.gain.setValueAtTime(0.18, now + 0.12);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.4);

    // Shimmer harmonic
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1318.5, now + 0.12);
    g3.gain.setValueAtTime(0, now);
    g3.gain.setValueAtTime(0.06, now + 0.12);
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc3.connect(g3);
    g3.connect(ctx.destination);
    osc3.start(now + 0.12);
    osc3.stop(now + 0.5);

    setTimeout(() => ctx.close(), 600);
  } catch {}
}
