type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Tiny Web Audio synth:
 *  - a looping band-passed noise whose volume follows scratch speed
 *  - soft bell chimes when a heart is revealed
 * Nothing is created until the first user gesture (autoplay-policy safe).
 */
class ScratchSound {
  enabled = true;
  private ctx: AudioContext | null = null;
  private noiseGain: GainNode | null = null;
  private band: BiquadFilterNode | null = null;
  private master: GainNode | null = null;

  private idleTimer: number | undefined;

  private init() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AC) return;

    // Mix with (rather than interrupt) any music the visitor is playing — Safari 17+.
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) {
      try {
        nav.audioSession.type = "ambient";
      } catch {
        /* ignore */
      }
    }

    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    // Gritty noise: white noise with sparse crackles, looped.
    const length = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      const crackle = Math.random() < 0.015 ? (Math.random() * 2 - 1) * 1.6 : 0;
      data[i] = white * 0.55 + crackle;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 900;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3000;
    band.Q.value = 0.85;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;

    source.connect(highpass);
    highpass.connect(band);
    band.connect(noiseGain);
    noiseGain.connect(master);
    source.start();

    this.ctx = ctx;
    this.master = master;
    this.noiseGain = noiseGain;
    this.band = band;
  }

  /** Call from a pointerdown / click handler. */
  unlock() {
    if (!this.enabled) return;
    window.clearTimeout(this.idleTimer);
    try {
      this.init();
      if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
    } catch {
      /* audio unavailable — stay silent */
    }
  }

  /** Suspend the audio engine after a few quiet seconds (saves battery). */
  private scheduleIdle() {
    window.clearTimeout(this.idleTimer);
    this.idleTimer = window.setTimeout(() => {
      if (this.ctx && this.ctx.state === "running") void this.ctx.suspend().catch(() => {});
    }, 6000);
  }

  private hold(param: AudioParam, t: number) {
    const p = param as AudioParam & { cancelAndHoldAtTime?: (t: number) => AudioParam };
    if (typeof p.cancelAndHoldAtTime === "function") {
      p.cancelAndHoldAtTime(t);
    } else {
      const v = param.value;
      param.cancelScheduledValues(t);
      param.setValueAtTime(v, t);
    }
  }

  /** Distance scratched this frame (CSS px). Volume follows speed and fades by itself. */
  scratch(distance: number) {
    if (!this.enabled || !this.ctx || !this.noiseGain || !this.band) return;
    window.clearTimeout(this.idleTimer);
    if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
    const t = this.ctx.currentTime;
    const intensity = Math.min(1, distance / 26);
    const g = this.noiseGain.gain;
    this.hold(g, t);
    g.setTargetAtTime(0.05 + intensity * 0.2, t, 0.012);
    g.setTargetAtTime(0, t + 0.07, 0.045);
    this.band.frequency.setTargetAtTime(2300 + intensity * 2600, t, 0.03);
  }

  stop() {
    if (!this.ctx || !this.noiseGain) return;
    const t = this.ctx.currentTime;
    this.hold(this.noiseGain.gain, t);
    this.noiseGain.gain.setTargetAtTime(0, t, 0.03);
    this.scheduleIdle();
  }

  /** A soft bell. `step` walks up a pentatonic scale. */
  chime(step = 0, volume = 0.1) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    this.scheduleIdle();
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    const freq = 659.25 * Math.pow(2, scale[step % scale.length] / 12);
    const t = ctx.currentTime + 0.01;

    const partials: Array<[number, number]> = [
      [1, 1],
      [2, 0.35],
      [3.01, 0.12],
    ];
    for (const [mult, amp] of partials) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume * amp, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / mult);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 1.7);
    }
  }

  /** A brass temple bell (ghanta): inharmonic partials with a slow shimmer, struck twice. */
  templeBell(volume = 0.14) {
    const ctx = this.ctx;
    const master = this.master;
    if (!this.enabled || !ctx || !master) return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    this.scheduleIdle();

    const base = 523.25;
    // [frequency ratio, level, decay seconds]
    const partials: Array<[number, number, number]> = [
      [0.5, 0.25, 3.2],
      [1, 1, 3.4],
      [1.183, 0.4, 2.6],
      [1.506, 0.28, 2.2],
      [2, 0.42, 2],
      [2.74, 0.2, 1.4],
      [3.9, 0.1, 0.9],
    ];

    [0, 0.95].forEach((offset, strike) => {
      const t = ctx.currentTime + 0.02 + offset;
      const level = volume * (strike === 0 ? 1 : 0.6);
      for (const [ratio, amp, decay] of partials) {
        for (const cents of [-3, 3]) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = base * ratio;
          osc.detune.value = cents; // slight detune → the bell's shimmer
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(level * amp * 0.5, t + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
          osc.connect(gain);
          gain.connect(master);
          osc.start(t);
          osc.stop(t + decay + 0.05);
        }
      }
    });
  }

  /** Little rising arpeggio for the grand reveal. */
  fanfare() {
    [0, 2, 3, 5].forEach((step, i) => {
      window.setTimeout(() => this.chime(step, 0.09), i * 140);
    });
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stop();
  }
}

export const sound = new ScratchSound();
