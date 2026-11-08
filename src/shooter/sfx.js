// Tiny synthesized sound effects (no audio files). Created lazily on the first user gesture.
export class Sfx {
  constructor() { this.ctx = null; this.volume = 0.5; }
  unlock() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
      this.master = this.ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  _env(node, t0, a, d, peak = 1) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    node.connect(g); g.connect(this.master);
    return g;
  }
  _tone(type, f0, f1, a, d, peak = 0.5, when = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + a + d);
    this._env(o, t, a, d, peak);
    o.start(t); o.stop(t + a + d + 0.05);
  }
  _noise(d, peak = 0.4, hp = 800) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const n = Math.floor(this.ctx.sampleRate * d);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    src.connect(f); this._env(f, t, 0.005, d, peak);
    src.start(t);
  }
  shot(size = 1) { this._tone('square', 520 / size, 140 / size, 0.01, 0.09, 0.25); this._noise(0.06, 0.18, 1200); }
  bounce() { this._tone('sine', 700, 300, 0.005, 0.06, 0.15); }
  hitmarker() { this._tone('triangle', 1400, 900, 0.005, 0.05, 0.25); }
  hurt() { this._tone('sawtooth', 220, 90, 0.01, 0.18, 0.3); this._noise(0.12, 0.2, 400); }
  kill() { this._tone('square', 300, 900, 0.02, 0.18, 0.3); this._tone('square', 450, 1300, 0.02, 0.22, 0.25, 0.08); }
  death() { this._tone('sawtooth', 300, 40, 0.02, 0.6, 0.35); this._noise(0.3, 0.25, 200); }
  shield() { this._tone('sine', 900, 1800, 0.01, 0.2, 0.25); }
  tick() { this._tone('sine', 880, 880, 0.005, 0.08, 0.25); }
  go() { this._tone('sine', 660, 1320, 0.01, 0.3, 0.3); }
  reload() { this._tone('square', 300, 600, 0.005, 0.06, 0.12); this._tone('square', 600, 300, 0.005, 0.06, 0.12, 0.12); }
  pick() { this._tone('triangle', 500, 1000, 0.01, 0.2, 0.25); }
  win() { [0, 0.12, 0.24, 0.36].forEach((w, i) => this._tone('square', [523, 659, 784, 1047][i], [523, 659, 784, 1047][i], 0.01, 0.2, 0.2, w)); }
  dash() { this._noise(0.15, 0.15, 300); }
}
