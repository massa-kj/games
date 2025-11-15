// Main audio system exports
export { soundManager } from './soundManager';
export { advancedSoundManager } from './hybridSoundManager';
export { webAudioEngine } from './webAudioEngine';
export { gameAudioTemplates, GameAudioUtils } from './gameAudioTemplates';

// Chord player for harmony support
export { chordPlayer, ChordPlayer } from './chordPlayer';
export type { ChordNote, ChordOptions } from './chordPlayer';

// Engine abstraction
export { getAudioEngine, setEngineConfig, switchEngine, getAvailableEngines } from './engine/index.js';
export type { AudioEngine, AudioEngineConfig } from './engine/index.js';

// Audio utilities
export {
  noteToFrequency,
  durationToSeconds,
  midiNoteToFrequency,
  frequencyToNote,
  clamp,
  lerp,
  dbToGain,
  gainToDb
} from './utils';

// Types
export type {
  SoundOptions,
  PlayOptions,
  SoundManager,
  AdvancedSoundManager,
  SoundMap,
  SoundDefinition,
  ToneDefinition,
  NoteDuration,
  WaveType,
  EnvelopeConfig,
  FilterConfig
} from './types';

// Speech synthesis (existing)
export { speak, stopSpeech, isSpeechSupported } from './speech';
export type { SpeechOptions } from './speech';
