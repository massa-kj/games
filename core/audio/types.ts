export interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

/**
 * Extended options for sound playback with additional features
 */
export interface PlayOptions extends SoundOptions {
  when?: number;
  fadeIn?: number;
  fadeOut?: number;
}

/**
 * Musical note durations in note value format or seconds
 */
export type NoteDuration = '1n' | '2n' | '4n' | '8n' | '16n' | '32n' | number;

/**
 * Waveform types for oscillator-based sound generation
 */
export type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'noise';

/**
 * ADSR envelope configuration for sound shaping
 */
export interface EnvelopeConfig {
  /** Attack time in seconds */
  attack: number;
  /** Decay time in seconds */
  decay: number;
  /** Sustain level (0-1) */
  sustain: number;
  /** Release time in seconds */
  release: number;
}

/**
 * Filter configuration for tone shaping
 */
export interface FilterConfig {
  type: BiquadFilterType;
  frequency: number;
  Q?: number;
}

/**
 * Definition for procedurally generated tones (similar to Tone.js syntax)
 */
export interface ToneDefinition {
  /** Waveform type */
  type: WaveType;
  /** Musical note (e.g., 'C4', 'A#5') - alternative to frequency */
  note?: string;
  /** Direct frequency in Hz - alternative to note */
  frequency?: number;
  /** Duration in note values or seconds */
  duration: NoteDuration;
  /** Volume envelope shaping */
  envelope?: EnvelopeConfig;
  /** Audio filter configuration */
  filter?: FilterConfig;
}

/**
 * Individual note in a melody sequence
 */
export interface MelodyNote {
  /** Musical note (e.g., 'C4', 'A#5') - use 'rest' for silence */
  note: string | 'rest';
  /** Duration in note values or seconds */
  duration: NoteDuration;
  /** Optional velocity/volume for this note (0-1) */
  velocity?: number;
  /** Optional tie to next note (extends duration) */
  tie?: boolean;
}

/**
 * Complete melody definition with sequence and properties
 */
export interface MelodyDefinition {
  /** Sequence of notes to play */
  notes: MelodyNote[];
  /** Tempo in beats per minute */
  bpm?: number;
  /** Waveform type for all notes */
  type?: WaveType;
  /** Volume envelope for all notes */
  envelope?: EnvelopeConfig;
  /** Audio filter for all notes */
  filter?: FilterConfig;
  /** Whether to loop the melody */
  loop?: boolean;
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Audio engine capabilities
 */
export interface AudioEngineCapabilities {
  /** Supports file-based audio playback */
  supportsFiles: boolean;
  /** Supports procedural tone generation */
  supportsTones: boolean;
  /** Supports melody sequences */
  supportsMelodies: boolean;
  /** Supports advanced features like effects and filters */
  supportsAdvancedFeatures: boolean;
  /** Supports real-time audio analysis */
  supportsAnalysis: boolean;
  /** Maximum concurrent sounds */
  maxConcurrentSounds?: number;
  /** Supported audio formats */
  supportedFormats?: string[];
}

/**
 * Complete sound definition supporting file-based, generated audio, and melodies
 */
export interface SoundDefinition {
  /** Path to audio file */
  src?: string;
  /** Procedural tone definition */
  tone?: ToneDefinition;
  /** Melody definition for sequence of notes */
  melody?: MelodyDefinition;
  /** Default volume level */
  volume?: number;
  /** Whether to loop the sound */
  loop?: boolean;
  /** Tags for categorization */
  tags?: string[];
  /** Fallback sound definition if primary is not supported */
  fallback?: Pick<SoundDefinition, 'src' | 'tone'>;
}

/**
 * Collection of named sound definitions for a game or application
 */
export interface SoundMap {
  [soundName: string]: SoundDefinition;
}

export interface SoundManager {
  play(src: string, options?: SoundOptions): Promise<void>;
  stopAll(): void;
  setGlobalVolume(volume: number): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

export interface AdvancedSoundManager extends SoundManager {
  // Web Audio API specific methods
  playTemplate(template: string, params?: Record<string, any>): Promise<string>;
  playTone(frequency: number, duration?: number, options?: SoundOptions): Promise<string>;
  playBeep(options?: { frequency?: number; duration?: number }): Promise<string>;
  playNoise(type: 'white' | 'pink', duration?: number, options?: SoundOptions): Promise<string>;

  // Melody playback methods
  playMelody(melodyDefinition: MelodyDefinition, options?: PlayOptions): Promise<string>;
  registerMelody(name: string, melodyDefinition: MelodyDefinition): void;
  playRegisteredMelody(name: string, options?: PlayOptions): Promise<string>;

  // Effect management
  createEffect(type: string, params?: Record<string, any>): string;
  applyEffect(soundId: string, effectId: string): void;

  // Advanced playback control
  scheduledPlay(src: string, when: number, options?: SoundOptions): Promise<string>;
  fadeIn(soundId: string, duration: number): void;
  fadeOut(soundId: string, duration: number): void;

  // Audio analysis
  getAnalyser(): AnalyserNode | null;

  // Template registration
  registerSoundTemplate(name: string, template: any): void;

  // New SoundMap-based methods
  playSound(soundName: string, soundMap: SoundMap, options?: PlayOptions): Promise<void>;
  registerSoundMap(name: string, soundMap: SoundMap): void;
}
