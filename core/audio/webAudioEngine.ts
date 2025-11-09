import type { ToneDefinition, PlayOptions, SoundDefinition, MelodyDefinition, MelodyNote } from './types.js';
import type { AudioEngine } from './engine/index.js';
import { noteToFrequency, durationToSeconds } from './utils.js';

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

export class WebAudioEngine implements AudioEngine {
  readonly name = 'WebAudio';

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

  isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  async initialize(): Promise<void> {
    await this.initializeAudioContext();
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
    definition: SoundDefinition,
    options?: PlayOptions
  ): Promise<string> {
    if (!this.context || !this.masterGain) {
      await this.initializeAudioContext();
    }

    if (!this.context || !this.masterGain) {
      throw new Error('AudioContext not available');
    }

    // Handle different sound types
    if (definition.melody) {
      return this.createMelody(definition.melody, options);
    } else if (definition.tone) {
      return this.createToneSound(definition.tone, options);
    } else if (definition.src) {
      const buffer = await this.loadAudioBuffer(definition.src);
      if (!buffer) throw new Error(`Failed to load audio: ${definition.src}`);
      return this.createSoundFromTemplate(buffer, { volume: definition.volume });
    } else {
      throw new Error('Invalid sound definition');
    }
  }

  async createMelody(definition: MelodyDefinition, options?: PlayOptions): Promise<string> {
    if (!this.context || !this.masterGain) {
      await this.initializeAudioContext();
    }

    if (!this.context || !this.masterGain) {
      throw new Error('AudioContext not available');
    }

    const melodyId = `melody_${Date.now()}_${Math.random()}`;
    const bpm = definition.bpm || 120;

    // Create a melody source that schedules all notes
    const melodySource = new MelodySource(this.context, {
      notes: definition.notes,
      bpm,
      type: definition.type || 'sine',
      envelope: definition.envelope,
      filter: definition.filter,
      loop: definition.loop || false,
      volume: options?.volume || 1
    });

    melodySource.connect(this.masterGain);
    this.sources.set(melodyId, melodySource);

    return melodyId;
  }

  // Legacy createSound method renamed
  async createSoundFromTemplate(
    template: string | AudioBuffer,
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

  async playSound(soundId: string, options?: PlayOptions): Promise<void> {
    if (!this.enabled) return;

    console.log('playSound called with soundId:', soundId, 'options:', options);

    const source = this.sources.get(soundId);
    console.log('Found source:', source ? source.type : 'null');

    if (source) {
      const when = options?.when || 0;
      console.log('Starting source at time:', when);
      source.start(when);
    } else {
      console.warn('No source found for soundId:', soundId);
    }
  }

  // Legacy playSound method renamed
  playSoundLegacy(soundId: string, when?: number): void {
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

  // AudioEngine interface methods
  stopAll(): void {
    this.stopAllSounds();
  }

  setVolume(volume: number): void {
    this.setMasterVolume(volume);
  }

  dispose(): void {
    this.stopAll();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
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

  /**
   * Create a sound from a ToneDefinition
   *
   * @param definition Tone configuration
   * @param options Additional playback options
   * @returns Promise resolving to sound ID
   */
  async createToneSound(definition: ToneDefinition, options?: PlayOptions): Promise<string> {
    if (!this.context || !this.masterGain) {
      await this.initializeAudioContext();
    }

    if (!this.context || !this.masterGain) {
      throw new Error('AudioContext not available');
    }

    // Determine frequency
    let frequency: number;
    if (definition.note) {
      frequency = noteToFrequency(definition.note);
    } else if (definition.frequency) {
      frequency = definition.frequency;
    } else {
      frequency = 440; // Default to A4
    }

    // Convert duration to seconds
    const duration = durationToSeconds(definition.duration, 120); // Default 120 BPM

    // Create appropriate source based on type
    let source: SoundSource;
    if (definition.type === 'noise') {
      source = new NoiseSource(this.context, {
        type: 'white', // Default noise type
        duration,
        volume: options?.volume,
        envelope: definition.envelope,
        filter: definition.filter
      });
    } else {
      source = new OscillatorSource(this.context, {
        frequency,
        type: definition.type,
        duration,
        volume: options?.volume,
        envelope: definition.envelope,
        filter: definition.filter
      });
    }

    const soundId = `tone_${Date.now()}_${Math.random()}`;
    source.connect(this.masterGain);
    this.sources.set(soundId, source);

    return soundId;
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
  private filterNode: BiquadFilterNode | null = null;
  private oscillator: OscillatorNode | null = null;
  private params: any;

  constructor(context: AudioContext, params: any = {}) {
    this.id = `oscillator_${Date.now()}_${Math.random()}`;
    this.context = context;
    this.params = params;

    this.gainNode = context.createGain();
    this.panNode = context.createStereoPanner();

    // Create filter if specified
    if (params.filter) {
      this.filterNode = context.createBiquadFilter();
      this.filterNode.type = params.filter.type || 'lowpass';
      this.filterNode.frequency.setValueAtTime(
        params.filter.frequency || 1000,
        context.currentTime
      );
      if (params.filter.Q) {
        this.filterNode.Q.setValueAtTime(params.filter.Q, context.currentTime);
      }

      // Chain: gainNode -> filterNode -> panNode
      this.gainNode.connect(this.filterNode);
      this.filterNode.connect(this.panNode);
    } else {
      // Direct chain: gainNode -> panNode
      this.gainNode.connect(this.panNode);
    }

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
    } else {
      // Simple fade out to avoid clicks
      const now = this.context.currentTime + when;
      const volume = this.params.volume || 1;
      this.gainNode.gain.setValueAtTime(volume, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }

    const startTime = when || this.context.currentTime;
    const stopTime = startTime + duration;

    this.oscillator.start(startTime);
    this.oscillator.stop(stopTime);

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
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.setValueAtTime(clampedVolume, this.context.currentTime);
  }

  setPan(pan: number): void {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    this.panNode.pan.setValueAtTime(clampedPan, this.context.currentTime);
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
  private filterNode: BiquadFilterNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private params: any;

  constructor(context: AudioContext, params: any = {}) {
    this.id = `noise_${Date.now()}_${Math.random()}`;
    this.context = context;
    this.params = params;

    this.gainNode = context.createGain();
    this.panNode = context.createStereoPanner();

    // Create filter if specified
    if (params.filter) {
      this.filterNode = context.createBiquadFilter();
      this.filterNode.type = params.filter.type || 'lowpass';
      this.filterNode.frequency.setValueAtTime(
        params.filter.frequency || 1000,
        context.currentTime
      );
      if (params.filter.Q) {
        this.filterNode.Q.setValueAtTime(params.filter.Q, context.currentTime);
      }

      // Chain: gainNode -> filterNode -> panNode
      this.gainNode.connect(this.filterNode);
      this.filterNode.connect(this.panNode);
    } else {
      // Direct chain: gainNode -> panNode
      this.gainNode.connect(this.panNode);
    }

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

    const { type = 'white', duration = 1, envelope } = this.params;
    const buffer = this.generateNoiseBuffer(type, duration);

    this.sourceNode = this.context.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.connect(this.gainNode);

    // Apply envelope if specified
    if (envelope) {
      const { attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.3 } = envelope;
      const now = this.context.currentTime + when;

      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(1, now + attack);
      this.gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      this.gainNode.gain.setValueAtTime(sustain, now + duration - release);
      this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } else {
      // Simple fade out to avoid clicks
      const now = this.context.currentTime + when;
      this.gainNode.gain.setValueAtTime(this.params.volume || 1, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }

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
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.setValueAtTime(clampedVolume, this.context.currentTime);
  }

  setPan(pan: number): void {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    this.panNode.pan.setValueAtTime(clampedPan, this.context.currentTime);
  }

  connect(destination: AudioNode): void {
    this.panNode.connect(destination as any);
  }

  disconnect(): void {
    this.panNode.disconnect();
  }
}

/**
 * Melody source for playing sequences of notes
 */
class MelodySource implements SoundSource {
  public id: string;
  public type: 'buffer' = 'buffer';
  private context: AudioContext;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private params: any;
  private isPlaying = false;
  private scheduledSources: OscillatorNode[] = [];

  constructor(context: AudioContext, params: any = {}) {
    this.id = `melody_${Date.now()}_${Math.random()}`;
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
    if (this.isPlaying) return;

    const { notes, bpm = 120, type = 'sine', envelope } = this.params;
    let currentTime = this.context.currentTime + when;

    // Schedule each note
    notes.forEach((note: MelodyNote) => {
      const duration = durationToSeconds(note.duration, bpm);

      if (note.note === 'rest') {
        // Silent note - just advance time
        currentTime += duration;
        return;
      }

      try {
        const frequency = noteToFrequency(note.note);
        const velocity = note.velocity || 1;

        // Create oscillator for this note
        const oscillator = this.context.createOscillator();
        const noteGain = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, currentTime);

        // Connect: oscillator -> noteGain -> this.gainNode
        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);

        // Apply envelope if specified
        if (envelope) {
          const { attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.3 } = envelope;
          const noteVolume = velocity * (this.params.volume || 1);

          noteGain.gain.setValueAtTime(0, currentTime);
          noteGain.gain.linearRampToValueAtTime(noteVolume, currentTime + attack);
          noteGain.gain.linearRampToValueAtTime(noteVolume * sustain, currentTime + attack + decay);
          noteGain.gain.setValueAtTime(noteVolume * sustain, currentTime + duration - release);
          noteGain.gain.linearRampToValueAtTime(0, currentTime + duration);
        } else {
          // Simple fade to avoid clicks
          const noteVolume = velocity * (this.params.volume || 1);
          noteGain.gain.setValueAtTime(noteVolume, currentTime);
          noteGain.gain.linearRampToValueAtTime(0, currentTime + duration - 0.01);
        }

        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
        this.scheduledSources.push(oscillator);

        // Clean up when note ends
        oscillator.onended = () => {
          const sourceIndex = this.scheduledSources.indexOf(oscillator);
          if (sourceIndex > -1) {
            this.scheduledSources.splice(sourceIndex, 1);
          }
        };

        // Advance time for next note
        currentTime += duration;
      } catch (error) {
        // Still advance time even if note fails
        currentTime += duration;
      }
    });

    this.isPlaying = true;

    // Mark as stopped when all notes complete
    setTimeout(() => {
      this.isPlaying = false;
    }, (currentTime - this.context.currentTime - when) * 1000);
  }

  stop(when: number = 0): void {
    this.scheduledSources.forEach(source => {
      try {
        source.stop(when);
      } catch (error) {
        // Source may already be stopped
      }
    });
    this.scheduledSources = [];
    this.isPlaying = false;
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.setValueAtTime(clampedVolume, this.context.currentTime);
  }

  setPan(pan: number): void {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    this.panNode.pan.setValueAtTime(clampedPan, this.context.currentTime);
  }

  connect(destination: AudioNode): void {
    this.panNode.connect(destination as any);
  }

  disconnect(): void {
    this.panNode.disconnect();
  }
}

export const webAudioEngine = new WebAudioEngine();
