/**
 * Tactile Web Audio Synthesizer
 * Zero-dependency UI sound feedback for senior UX polish
 */
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  playClick() {
    this.playTone(600, 'triangle', 0.04, 0.03);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.playTone(523.25, 'sine', 0.08, 0.04); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.04), 60); // E5
  }

  playPop() {
    this.playTone(880, 'sine', 0.05, 0.03);
  }

  playWhoosh() {
    this.playTone(350, 'sine', 0.12, 0.04);
  }
}

export const sounds = new SoundEffects();
