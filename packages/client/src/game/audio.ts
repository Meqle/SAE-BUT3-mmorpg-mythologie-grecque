class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    volume = 0.08,
    delay = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playAttack(style: 'melee' | 'bow' | 'magic' | 'dagger') {
    if (style === 'bow') {
      this.tone(520, 260, 0.11, 'triangle', 0.06);
      this.tone(840, 620, 0.06, 'sine', 0.04, 0.02);
    } else if (style === 'magic') {
      this.tone(420, 780, 0.16, 'sine', 0.06);
      this.tone(640, 980, 0.14, 'triangle', 0.04, 0.03);
    } else if (style === 'dagger') {
      this.tone(680, 240, 0.08, 'sawtooth', 0.04);
    } else {
      this.tone(240, 110, 0.12, 'sawtooth', 0.055);
    }
  }

  playSpecial() {
    this.tone(180, 90, 0.28, 'sawtooth', 0.07);
    this.tone(360, 720, 0.24, 'triangle', 0.06, 0.02);
    this.tone(540, 270, 0.3, 'sine', 0.05, 0.06);
  }

  playHit(crit = false) {
    if (crit) {
      this.tone(580, 880, 0.11, 'triangle', 0.07);
      this.tone(220, 95, 0.12, 'square', 0.045);
    } else {
      this.tone(170, 85, 0.09, 'triangle', 0.06);
    }
  }

  playPlayerHurt() {
    this.tone(150, 70, 0.18, 'sawtooth', 0.075);
  }

  playDash() {
    this.tone(340, 160, 0.12, 'sine', 0.05);
  }

  playHeal() {
    this.tone(440, 554, 0.14, 'sine', 0.06, 0);
    this.tone(554, 659, 0.16, 'sine', 0.06, 0.08);
    this.tone(659, 880, 0.2, 'sine', 0.05, 0.16);
  }

  playQuest() {
    // arpege de lyre grecque
    const notes = [392, 494, 587, 784];
    notes.forEach((n, i) => this.tone(n, n, 0.22, 'triangle', 0.06, i * 0.07));
  }

  playLevelUp() {
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((n, i) => this.tone(n, n, 0.26, 'triangle', 0.07, i * 0.075));
  }

  playPortal() {
    this.tone(320, 640, 0.26, 'sine', 0.055);
    this.tone(480, 960, 0.24, 'triangle', 0.04, 0.05);
  }

  playLoot(rarity: 'commun' | 'rare' | 'epique' | 'legendaire') {
    if (rarity === 'legendaire') {
      [523, 659, 784, 1046, 1318].forEach((n, i) => this.tone(n, n, 0.28, 'triangle', 0.075, i * 0.065));
    } else if (rarity === 'epique') {
      [440, 554, 659, 880].forEach((n, i) => this.tone(n, n, 0.22, 'triangle', 0.065, i * 0.06));
    } else if (rarity === 'rare') {
      this.tone(523, 659, 0.14, 'sine', 0.06, 0);
      this.tone(659, 880, 0.18, 'triangle', 0.055, 0.07);
    } else {
      this.tone(587, 740, 0.1, 'sine', 0.045, 0);
    }
  }

  playCoin() {
    this.tone(880, 1174, 0.08, 'sine', 0.045, 0);
    this.tone(1174, 1318, 0.1, 'triangle', 0.04, 0.045);
  }

  playChest() {
    this.tone(523, 659, 0.12, 'triangle', 0.06, 0);
    this.tone(659, 784, 0.16, 'triangle', 0.06, 0.08);
    this.tone(784, 1046, 0.22, 'sine', 0.06, 0.16);
  }
}

export const sound = new SoundEngine();
