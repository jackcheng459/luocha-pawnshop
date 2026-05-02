type OscillatorTypeName = OscillatorType;

const storageKey = "luocha-sound-enabled";
const bgmUrl = "/audio/bgm/a-really-dark-alley.mp3";

class AudioEngine {
  private context?: AudioContext;
  private master?: GainNode;
  private music?: GainNode;
  private sfx?: GainNode;
  private bgm?: HTMLAudioElement;
  private bgmFadeTimer?: number;
  private pulseTimer?: number;
  private enabled = true;
  private started = false;
  private lastHoverAt = 0;

  constructor() {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    this.enabled = saved !== "off";
  }

  isEnabled() {
    return this.enabled;
  }

  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, enabled ? "on" : "off");
    }
    if (!enabled) {
      this.fadeMusic(0);
      this.fadeBgm(0, true);
      return;
    }
    await this.unlock();
    this.fadeMusic(0.06);
    this.fadeBgm(0.22);
  }

  async toggle() {
    await this.setEnabled(!this.enabled);
    return this.enabled;
  }

  async unlock() {
    if (typeof window === "undefined" || !this.enabled) return;
    const context = this.ensureContext();
    if (context.state === "suspended") await context.resume();
    if (!this.started) this.startMusic();
  }

  playHover() {
    if (!this.canPlay()) return;
    const now = performance.now();
    if (now - this.lastHoverAt < 180) return;
    this.lastHoverAt = now;
    // 木鱼/竹敲击感
    this.tone(420, 0.03, "triangle", 0.02, -15);
    this.noise(0.02, 0.015, 800);
  }

  playChoice() {
    if (!this.canPlay()) return;
    this.tone(330, 0.08, "triangle", 0.045);
    window.setTimeout(() => this.tone(440, 0.08, "triangle", 0.04), 70);
  }

  playDoor() {
    if (!this.canPlay()) return;
    this.noise(0.5, 0.06, 700);
    this.sweepTone(200, 80, 0.4, 0.04);
    this.tone(65, 0.38, "sawtooth", 0.03, -20);
    window.setTimeout(() => this.tone(55, 0.25, "sine", 0.025), 200);
  }

  playSeal() {
    if (!this.canPlay()) return;
    this.tone(188, 0.16, "triangle", 0.055);
    window.setTimeout(() => this.tone(92, 0.2, "sine", 0.05), 70);
  }

  playPaper() {
    if (!this.canPlay()) return;
    this.noise(0.12, 0.035, 2200);
  }

  playPawn() {
    if (!this.canPlay()) return;
    this.tone(60, 0.18, "sine", 0.05);
    this.tone(260, 0.08, "triangle", 0.045);
    window.setTimeout(() => this.tone(174, 0.14, "triangle", 0.05), 80);
    window.setTimeout(() => this.noise(0.1, 0.03, 1800), 120);
    window.setTimeout(() => this.tone(55, 0.12, "sine", 0.035), 160);
  }

  playCoin() {
    if (!this.canPlay()) return;
    [660, 880, 1180].forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, 0.075, "sine", 0.042), index * 42);
    });
  }

  playDeny() {
    if (!this.canPlay()) return;
    this.tone(130, 0.12, "sawtooth", 0.035, -35);
  }

  playLot() {
    if (!this.canPlay()) return;
    this.noise(0.16, 0.035, 1200);
    window.setTimeout(() => this.tone(520, 0.14, "triangle", 0.045), 120);
  }

  playReceipt() {
    if (!this.canPlay()) return;
    this.tone(220, 0.12, "triangle", 0.045);
    window.setTimeout(() => this.tone(330, 0.18, "triangle", 0.04), 120);
  }

  playLeave() {
    if (!this.canPlay()) return;
    this.noise(1.2, 0.04, 500);
    window.setTimeout(() => this.tone(262, 0.8, "sine", 0.035), 400);
    window.setTimeout(() => this.tone(196, 1.0, "sine", 0.025), 600);
    this.fadeMusic(0.06);
    this.fadeBgm(0.08);
    window.setTimeout(() => this.fadeMusic(0), 2000);
    window.setTimeout(() => this.fadeBgm(0, true), 2000);
  }

  playShake() {
    if (!this.canPlay()) return;
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      window.setTimeout(() => {
        this.noise(0.06, 0.025 + Math.random() * 0.015, 2400 + Math.random() * 800);
      }, i * 180 + Math.random() * 60);
    }
  }

  private ensureContext() {
    if (this.context) return this.context;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextCtor();
    const master = context.createGain();
    const music = context.createGain();
    const sfx = context.createGain();
    master.gain.value = 0.84;
    music.gain.value = 0;
    sfx.gain.value = 0.72;
    music.connect(master);
    sfx.connect(master);
    master.connect(context.destination);
    this.context = context;
    this.master = master;
    this.music = music;
    this.sfx = sfx;
    return context;
  }

  private startMusic() {
    this.ensureContext();
    if (!this.music) return;
    this.started = true;
    this.prepareBgm();
    void this.playBgm();
    // 使用公开授权 BGM，关闭合成器埙声和风声底噪
    // this.startDrone(73.42, "sine", 0.1); // D2
    // this.startWind();
    this.fadeMusic(0); // 完全关闭合成音乐轨
    this.fadeBgm(0.65); // 调大MP3背景音乐音量
    if (this.pulseTimer) window.clearInterval(this.pulseTimer);
    // this.schedulePulse();
    // this.playPulse();
  }

  private prepareBgm() {
    if (this.bgm || typeof Audio === "undefined") return;
    const bgm = new Audio(bgmUrl);
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = 0;
    this.bgm = bgm;
  }

  private async playBgm() {
    if (!this.bgm || !this.enabled) return;
    try {
      await this.bgm.play();
    } catch {
      // Browser autoplay policies can still reject until the next direct user gesture.
    }
  }

  private schedulePulse() {
    const delay = 4500 + Math.random() * 4000;
    this.pulseTimer = window.setTimeout(() => {
      this.playPulse();
      this.schedulePulse();
    }, delay);
  }

  private playPulse() {
    if (!this.canPlay()) return;
    // D Minor Pentatonic (D, F, G, A, C) for desolate / folk horror vibe
    const pentatonic = [293.66, 349.23, 392.00, 440.00, 523.25];
    const targetFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
    this.playXun(targetFreq);
  }

  private playXun(freq: number) {
    const context = this.ensureContext();
    if (!this.music) return;

    const duration = 2.5 + Math.random() * 2.5;
    const volume = 0.18 + Math.random() * 0.1;

    // 1. Core Sine with Vibrato
    const osc = context.createOscillator();
    const lfo = context.createOscillator();
    const gain = context.createGain();
    const lfoGain = context.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    lfo.type = "sine";
    lfo.frequency.value = 4.5 + Math.random() * 1.5; // Vibrato speed
    lfoGain.gain.value = 3; // Vibrato depth
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.8);
    gain.gain.setValueAtTime(volume, context.currentTime + duration - 1.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.music);

    osc.start(context.currentTime);
    lfo.start(context.currentTime);
    osc.stop(context.currentTime + duration);
    lfo.stop(context.currentTime + duration);

    // 2. Breath Noise (Airy sound of Xiao/Xun)
    this.playBreath(freq, duration, volume * 0.6);
  }

  private playBreath(freq: number, duration: number, volume: number) {
    const context = this.ensureContext();
    if (!this.music) return;

    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.8);
    gain.gain.setValueAtTime(volume, context.currentTime + duration - 1.5);
    gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.music);
    source.start(context.currentTime);
  }

  private fadeMusic(value: number) {
    if (!this.context || !this.music) return;
    this.music.gain.cancelScheduledValues(this.context.currentTime);
    this.music.gain.setTargetAtTime(value, this.context.currentTime, 0.45);
  }

  private fadeBgm(value: number, pauseWhenDone = false) {
    if (!this.bgm) return;
    if (this.bgmFadeTimer) window.clearInterval(this.bgmFadeTimer);
    const target = Math.max(0, Math.min(1, value));
    this.bgmFadeTimer = window.setInterval(() => {
      if (!this.bgm) return;
      const diff = target - this.bgm.volume;
      if (Math.abs(diff) < 0.012) {
        this.bgm.volume = target;
        if (pauseWhenDone && target === 0) this.bgm.pause();
        if (this.bgmFadeTimer) window.clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = undefined;
        return;
      }
      this.bgm.volume = Math.max(0, Math.min(1, this.bgm.volume + diff * 0.22));
    }, 45);
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorTypeName,
    volume: number,
    detune = 0
  ) {
    const context = this.ensureContext();
    if (!this.sfx) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    oscillator.type = type;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(this.sfx);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
  }

  private noise(duration: number, volume: number, filterFrequency: number) {
    const context = this.ensureContext();
    if (!this.sfx) return;
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = filterFrequency;
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfx);
    source.start();
  }

  private sweepTone(freqStart: number, freqEnd: number, duration: number, volume: number) {
    const context = this.ensureContext();
    if (!this.sfx) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freqStart, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(freqEnd, context.currentTime + duration);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(this.sfx);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
  }

  private canPlay() {
    return Boolean(this.enabled && this.context && this.master && this.context.state === "running");
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const audioEngine = new AudioEngine();
