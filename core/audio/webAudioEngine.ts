import type { SoundOptions } from '../types.js';

export interface AudioNode {
  connect(destination: AudioNode | AudioParam): void;
  disconnect(): void;
}

export interface AudioEffect {
  input: GainNode;
  output: GainNode;
  enabled: boolean;
  params: Record<string, AudioParam>;
}

export interface SoundSource {
  id: string;
  type: 'buffer' | 'oscillator' | 'stream';
  start(when?: number): void;
  stop(when?: number): void;
  setVolume(volume: number): void;
  setPan(pan: number): void;
  connect(destination: AudioNode): void;
  disconnect(): void;
}

export interface AudioTemplate {
  name: string;
  create(context: AudioContext, params?: Record<string, any>): SoundSource;
}

export class WebAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private sources: Map<string, SoundSource> = new Map();
  private buffers: Map<string, AudioBuffer> = new Map();
  private templates: Map<string, AudioTemplate> = new Map();
  private effects: Map<string, AudioEffect> = new Map();
  private enabled = true;

  constructor() {
    this.initializeAudioContext();
    this.registerDefaultTemplates();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create master gain
      this.masterGain = this.context.createGain();

      // Create compressor for dynamic range control
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.context.currentTime);
      this.compressor.knee.setValueAtTime(30, this.context.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.context.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.context.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.context.currentTime);

      // Connect audio chain: masterGain -> compressor -> destination
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.context.destination);

      // Resume context if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
    } catch (error) {
      console.warn('Failed to initialize Web Audio API:', error);
    }
  }

  private registerDefaultTemplates(): void {
    // Simple tone generation template
    this.registerTemplate('tone', {
      name: 'tone',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 440, type = 'sine', duration = 1 } = params;
        return new OscillatorSource(context, { frequency, type, duration });
      }
    });

    // Beep sound template
    this.registerTemplate('beep', {
      name: 'beep',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 800, duration = 0.1 } = params;
        return new OscillatorSource(context, {
          frequency,
          type: 'square',
          duration,
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.04 }
        });
      }
    });

    // Noise template
    this.registerTemplate('noise', {
      name: 'noise',
      create: (context: AudioContext, params = {}) => {
        const { type = 'white', duration = 1 } = params;
        return new NoiseSource(context, { type, duration });
      }
    });
  }

  async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.context) {
      await this.initializeAudioContext();
    }

    if (!this.context) {
      throw new Error('AudioContext not available');
    }

    if (this.buffers.has(url)) {
      return this.buffers.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.buffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load audio buffer: ${url}`, error);
      return null;
    }
  }

  async createSound(
    template: string | AudioBuffer | string,
    params?: Record<string, any>
  ): Promise<string> {
    if (!this.context || !this.masterGain) {
      await this.initializeAudioContext();
    }

    if (!this.context || !this.masterGain) {
      throw new Error('AudioContext not available');
    }

    const soundId = `sound_${Date.now()}_${Math.random()}`;

    let source: SoundSource;

    if (typeof template === 'string') {
      if (template.startsWith('http') || template.startsWith('/') || template.startsWith('./')) {
        // URL to audio file
        const buffer = await this.loadAudioBuffer(template);
        if (!buffer) throw new Error(`Failed to load audio: ${template}`);
        source = new BufferSource(this.context, buffer, params);
      } else {
        // Template name
        const audioTemplate = this.templates.get(template);
        if (!audioTemplate) throw new Error(`Unknown template: ${template}`);
        source = audioTemplate.create(this.context, params);
      }
    } else {
      // AudioBuffer
      source = new BufferSource(this.context, template, params);
    }

    // Connect to master gain
    source.connect(this.masterGain);
    this.sources.set(soundId, source);

    return soundId;
  }

  playSound(soundId: string, when?: number): void {
    if (!this.enabled) return;

    const source = this.sources.get(soundId);
    if (source) {
      source.start(when);
    }
  }

  stopSound(soundId: string, when?: number): void {
    const source = this.sources.get(soundId);
    if (source) {
      source.stop(when);
      this.sources.delete(soundId);
    }
  }

  stopAllSounds(): void {
    this.sources.forEach((source, id) => {
      source.stop();
      this.sources.delete(id);
    });
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume, this.context?.currentTime || 0);
    }
  }

  registerTemplate(name: string, template: AudioTemplate): void {
    this.templates.set(name, template);
  }

  createEffect(type: string, params?: Record<string, any>): string {
    if (!this.context) throw new Error('AudioContext not available');

    const effectId = `effect_${Date.now()}_${Math.random()}`;
    let effect: AudioEffect;

    switch (type) {
      case 'reverb':
        effect = this.createReverbEffect(params);
        break;
      case 'delay':
        effect = this.createDelayEffect(params);
        break;
      case 'filter':
        effect = this.createFilterEffect(params);
        break;
      default:
        throw new Error(`Unknown effect type: ${type}`);
    }

    this.effects.set(effectId, effect);
    return effectId;
  }

  private createReverbEffect(params: any = {}): AudioEffect {
    if (!this.context) throw new Error('AudioContext not available');

    const input = this.context.createGain();
    const output = this.context.createGain();
    const convolver = this.context.createConvolver();
    const wetGain = this.context.createGain();
    const dryGain = this.context.createGain();

    // Create impulse response for reverb
    const { roomSize = 2, decay = 2 } = params;
    const length = this.context.sampleRate * decay;
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, roomSize);
      }
    }

    convolver.buffer = impulse;

    // Connect audio graph
    input.connect(dryGain);
    input.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(output);
    wetGain.connect(output);

    wetGain.gain.setValueAtTime(0.3, this.context.currentTime);
    dryGain.gain.setValueAtTime(0.7, this.context.currentTime);

    return {
      input,
      output,
      enabled: true,
      params: {
        wet: wetGain.gain,
        dry: dryGain.gain
      }
    };
  }

  private createDelayEffect(params: any = {}): AudioEffect {
    if (!this.context) throw new Error('AudioContext not available');

    const input = this.context.createGain();
    const output = this.context.createGain();
    const delay = this.context.createDelay(1);
    const feedback = this.context.createGain();
    const wetGain = this.context.createGain();

    const { delayTime = 0.3, feedbackAmount = 0.3, wetLevel = 0.5 } = params;

    delay.delayTime.setValueAtTime(delayTime, this.context.currentTime);
    feedback.gain.setValueAtTime(feedbackAmount, this.context.currentTime);
    wetGain.gain.setValueAtTime(wetLevel, this.context.currentTime);

    // Connect audio graph
    input.connect(output); // dry signal
    input.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay); // feedback loop
    delay.connect(wetGain);
    wetGain.connect(output);

    return {
      input,
      output,
      enabled: true,
      params: {
        delayTime: delay.delayTime,
        feedback: feedback.gain,
        wet: wetGain.gain
      }
    };
  }

  private createFilterEffect(params: any = {}): AudioEffect {
    if (!this.context) throw new Error('AudioContext not available');

    const input = this.context.createGain();
    const output = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    const { type = 'lowpass', frequency = 1000, Q = 1 } = params;

    filter.type = type;
    filter.frequency.setValueAtTime(frequency, this.context.currentTime);
    filter.Q.setValueAtTime(Q, this.context.currentTime);

    input.connect(filter);
    filter.connect(output);

    return {
      input,
      output,
      enabled: true,
      params: {
        frequency: filter.frequency,
        Q: filter.Q
      }
    };
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  getContext(): AudioContext | null {
    return this.context;
  }
}

// Individual sound source implementations
class BufferSource implements SoundSource {
  public id: string;
  public type: 'buffer' = 'buffer';
  private context: AudioContext;
  private buffer: AudioBuffer;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private sourceNode: AudioBufferSourceNode | null = null;

  constructor(context: AudioContext, buffer: AudioBuffer, params: any = {}) {
    this.id = `buffer_${Date.now()}_${Math.random()}`;
    this.context = context;
    this.buffer = buffer;

    this.gainNode = context.createGain();
    this.panNode = context.createStereoPanner();

    this.gainNode.connect(this.panNode);

    const { volume = 1, pan = 0 } = params;
    this.setVolume(volume);
    this.setPan(pan);
  }

  start(when: number = 0): void {
    if (this.sourceNode) return; // Already started

    this.sourceNode = this.context.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.connect(this.gainNode);

    this.sourceNode.start(when);

    // Clean up when finished
    this.sourceNode.onended = () => {
      this.sourceNode = null;
    };
  }

  stop(when: number = 0): void {
    if (this.sourceNode) {
      this.sourceNode.stop(when);
      this.sourceNode = null;
    }
  }

  setVolume(volume: number): void {
    this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);
  }

  setPan(pan: number): void {
    this.panNode.pan.setValueAtTime(pan, this.context.currentTime);
  }

  connect(destination: AudioNode): void {
    this.panNode.connect(destination as any);
  }

  disconnect(): void {
    this.panNode.disconnect();
  }
}

class OscillatorSource implements SoundSource {
  public id: string;
  public type: 'oscillator' = 'oscillator';
  private context: AudioContext;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private oscillator: OscillatorNode | null = null;
  private params: any;

  constructor(context: AudioContext, params: any = {}) {
    this.id = `oscillator_${Date.now()}_${Math.random()}`;
    this.context = context;
    this.params = params;

    this.gainNode = context.createGain();
    this.panNode = context.createStereoPanner();

    this.gainNode.connect(this.panNode);

    const { volume = 1, pan = 0 } = params;
    this.setVolume(volume);
    this.setPan(pan);
  }

  start(when: number = 0): void {
    if (this.oscillator) return; // Already started

    this.oscillator = this.context.createOscillator();
    const { frequency = 440, type = 'sine', duration = 1, envelope } = this.params;

    this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    this.oscillator.type = type;
    this.oscillator.connect(this.gainNode);

    // Apply envelope if specified
    if (envelope) {
      const { attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.3 } = envelope;
      const now = this.context.currentTime + when;

      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(1, now + attack);
      this.gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      this.gainNode.gain.setValueAtTime(sustain, now + duration - release);
      this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }

    this.oscillator.start(when);
    this.oscillator.stop(when + duration);

    // Clean up when finished
    this.oscillator.onended = () => {
      this.oscillator = null;
    };
  }

  stop(when: number = 0): void {
    if (this.oscillator) {
      this.oscillator.stop(when);
      this.oscillator = null;
    }
  }

  setVolume(volume: number): void {
    this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);
  }

  setPan(pan: number): void {
    this.panNode.pan.setValueAtTime(pan, this.context.currentTime);
  }

  connect(destination: AudioNode): void {
    this.panNode.connect(destination as any);
  }

  disconnect(): void {
    this.panNode.disconnect();
  }
}

class NoiseSource implements SoundSource {
  public id: string;
  public type: 'buffer' = 'buffer';
  private context: AudioContext;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private sourceNode: AudioBufferSourceNode | null = null;
  private params: any;

  constructor(context: AudioContext, params: any = {}) {
    this.id = `noise_${Date.now()}_${Math.random()}`;
    this.context = context;
    this.params = params;

    this.gainNode = context.createGain();
    this.panNode = context.createStereoPanner();

    this.gainNode.connect(this.panNode);

    const { volume = 1, pan = 0 } = params;
    this.setVolume(volume);
    this.setPan(pan);
  }

  private generateNoiseBuffer(type: string, duration: number): AudioBuffer {
    const length = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
      case 'white':
        for (let i = 0; i < length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        break;
      case 'pink':
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11;
          b6 = white * 0.115926;
        }
        break;
      default:
        throw new Error(`Unknown noise type: ${type}`);
    }

    return buffer;
  }

  start(when: number = 0): void {
    if (this.sourceNode) return; // Already started

    const { type = 'white', duration = 1 } = this.params;
    const buffer = this.generateNoiseBuffer(type, duration);

    this.sourceNode = this.context.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.connect(this.gainNode);

    this.sourceNode.start(when);

    // Clean up when finished
    this.sourceNode.onended = () => {
      this.sourceNode = null;
    };
  }

  stop(when: number = 0): void {
    if (this.sourceNode) {
      this.sourceNode.stop(when);
      this.sourceNode = null;
    }
  }

  setVolume(volume: number): void {
    this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);
  }

  setPan(pan: number): void {
    this.panNode.pan.setValueAtTime(pan, this.context.currentTime);
  }

  connect(destination: AudioNode): void {
    this.panNode.connect(destination as any);
  }

  disconnect(): void {
    this.panNode.disconnect();
  }
}

export const webAudioEngine = new WebAudioEngine();
