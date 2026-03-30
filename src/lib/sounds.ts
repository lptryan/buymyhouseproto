/** Shared synthesized sound effects for the funnel */
import clickSrc from '@/assets/quick_click.mp3';
/** Subtle whoosh for stage transitions — filtered noise sweep */
export function playWhooshSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // White noise burst shaped into a whoosh
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter sweeping up for the "whoosh" feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(2500, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.22);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.04);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.25);

    setTimeout(() => ctx.close(), 350);
  } catch {}
}


/** Short crisp button click — uses uploaded audio sample */

export function playButtonSound() {
  try {
    const audio = new Audio(clickSrc);
    audio.volume = 0.5;
    audio.play();
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
