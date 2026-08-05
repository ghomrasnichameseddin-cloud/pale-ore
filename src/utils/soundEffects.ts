// Web Audio API Synthesized Sound Effects for System Notifications

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playNotification(category: 'achievement' | 'alert' | 'warning' | 'log' | 'note' | string = 'alert') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (category === 'achievement') {
        // Level Up / Fanfare Arpeggio (C5, E5, G5, C6)
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + index * 0.08);

          gain.gain.setValueAtTime(0.01, now + index * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.25, now + index * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + index * 0.08);
          osc.stop(now + index * 0.08 + 0.4);
        });
      } else if (category === 'warning') {
        // Low Caution Double Beep
        [329.63, 293.66].forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + index * 0.15);

          gain.gain.setValueAtTime(0.01, now + index * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.15 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + index * 0.15);
          osc.stop(now + index * 0.15 + 0.25);
        });
      } else if (category === 'log') {
        // Futuristic Sub-pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Standard Crystal Chime (E5 -> B5)
        [659.25, 987.77].forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.09);

          gain.gain.setValueAtTime(0.01, now + index * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.09 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + index * 0.09);
          osc.stop(now + index * 0.09 + 0.3);
        });
      }
    } catch (e) {
      console.warn('Audio playback inhibited by browser policies or context state:', e);
    }
  }
}

export const soundSystem = new SoundSystem();
