/**
 * Audio engine abstraction layer for different audio implementations
 */

import type { SoundDefinition, PlayOptions, MelodyDefinition, AudioEngineCapabilities } from '../types.js';
import { WebAudioEngine } from '../webAudioEngine.js';

/**
 * Abstract interface for audio engines
 */
export interface AudioEngine {
  /** Engine name for identification */
  readonly name: string;

  /** Engine capabilities (optional for backward compatibility) */
  readonly capabilities?: AudioEngineCapabilities;

  /** Whether this engine is supported in current environment */
  isSupported(): boolean;

  /** Initialize the audio engine */
  initialize(): Promise<void>;

  /** Create a sound from definition and return unique ID */
  createSound(definition: SoundDefinition, options?: PlayOptions): Promise<string>;

  /** Create and schedule a melody sequence (optional - check capabilities.supportsMelodies) */
  createMelody?(definition: MelodyDefinition, options?: PlayOptions): Promise<string>;

  /** Play a sound by ID */
  playSound(soundId: string, options?: PlayOptions): Promise<void>;

  /** Stop a specific sound */
  stopSound(soundId: string, when?: number): void;

  /** Stop all currently playing sounds */
  stopAll(): void;

  /** Set master volume (0-1) */
  setVolume(volume: number): void;

  /** Enable or disable the engine */
  setEnabled(enabled: boolean): void;

  /** Check if engine is enabled */
  isEnabled(): boolean;

  /** Clean up resources */
  dispose(): void;
}

/**
 * Engine priority for automatic selection
 */
export enum AudioEnginePriority {
  TONE = 3,      // Highest priority if available
  WEB_AUDIO = 2, // Medium priority
  HTML_AUDIO = 1 // Fallback
}

/**
 * Configuration for engine selection
 */
export interface AudioEngineConfig {
  /** Preferred engine name */
  preferredEngine?: string;
  /** Whether to use Tone.js if available */
  useTone?: boolean;
  /** Custom engine instances */
  customEngines?: AudioEngine[];
}

// Global state
let activeEngine: AudioEngine | null = null;
let engineConfig: AudioEngineConfig = {};

/**
 * Set engine configuration
 */
export function setEngineConfig(config: AudioEngineConfig): void {
  engineConfig = { ...config };
  // Reset active engine to allow reconfiguration
  if (activeEngine) {
    activeEngine.dispose();
    activeEngine = null;
  }
}

/**
 * Get the currently active audio engine, initializing if needed
 */
export async function getAudioEngine(): Promise<AudioEngine> {
  if (activeEngine) {
    return activeEngine;
  }

  activeEngine = await selectBestEngine();
  await activeEngine.initialize();
  return activeEngine;
}

/**
 * Select the best available engine based on configuration and support
 */
async function selectBestEngine(): Promise<AudioEngine> {
  const engines: Array<{ engine: AudioEngine; priority: number }> = [];

  // Add custom engines first
  if (engineConfig.customEngines) {
    engineConfig.customEngines.forEach(engine => {
      if (engine.isSupported()) {
        engines.push({ engine, priority: AudioEnginePriority.TONE + 1 });
      }
    });
  }

  // Check for preferred engine
  if (engineConfig.preferredEngine) {
    const preferredEngine = await createEngineByName(engineConfig.preferredEngine);
    if (preferredEngine?.isSupported()) {
      engines.push({ engine: preferredEngine, priority: AudioEnginePriority.TONE + 2 });
    }
  }

  // Add Tone.js engine if requested and available
  if (engineConfig.useTone !== false) {
    try {
      const { ToneEngine } = await import('./toneEngine.js');
      const toneEngine = new ToneEngine();
      if (toneEngine.isSupported()) {
        engines.push({ engine: toneEngine, priority: AudioEnginePriority.TONE });
      }
    } catch {
      // Tone.js not available, continue with other options
    }
  }

  // Add WebAudio engine
  const webAudioEngine = new WebAudioEngine();
  if (webAudioEngine.isSupported()) {
    engines.push({ engine: webAudioEngine, priority: AudioEnginePriority.WEB_AUDIO });
  }

  // Add HTML Audio engine as fallback
  const { HTMLAudioEngine } = await import('./htmlAudioEngine.js');
  const htmlAudioEngine = new HTMLAudioEngine();
  if (htmlAudioEngine.isSupported()) {
    engines.push({ engine: htmlAudioEngine, priority: AudioEnginePriority.HTML_AUDIO });
  }

  if (engines.length === 0) {
    throw new Error('No supported audio engines available');
  }

  // Sort by priority and return the best one
  engines.sort((a, b) => b.priority - a.priority);
  return engines[0].engine;
}

/**
 * Create an engine instance by name
 */
async function createEngineByName(name: string): Promise<AudioEngine | null> {
  try {
    switch (name.toLowerCase()) {
      case 'tone':
        const { ToneEngine } = await import('./toneEngine.js');
        return new ToneEngine();
      case 'webaudio':
        return new WebAudioEngine();
      case 'html':
      case 'htmlaudio':
        const { HTMLAudioEngine } = await import('./htmlAudioEngine.js');
        return new HTMLAudioEngine();
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Force switch to a specific engine
 */
export async function switchEngine(engineName: string): Promise<AudioEngine> {
  if (activeEngine) {
    activeEngine.dispose();
  }

  const newEngine = await createEngineByName(engineName);
  if (!newEngine || !newEngine.isSupported()) {
    throw new Error(`Engine '${engineName}' is not available or supported`);
  }

  activeEngine = newEngine;
  await activeEngine.initialize();
  return activeEngine;
}

/**
 * Get information about available engines
 */
export async function getAvailableEngines(): Promise<Array<{ name: string; supported: boolean }>> {
  const engines = [
    { name: 'HTML Audio', className: 'HTMLAudioEngine', modulePath: './htmlAudioEngine.js' },
    { name: 'Web Audio', className: 'WebAudioEngine', modulePath: '../webAudioEngine.js' },
    { name: 'Tone.js', className: 'ToneEngine', modulePath: './toneEngine.js' }
  ];

  const results = await Promise.allSettled(
    engines.map(async ({ name, className, modulePath }) => {
      try {
        const module = await import(/* @vite-ignore */ modulePath);
        const Engine = module[className];
        const engine = new Engine();
        return { name, supported: engine.isSupported() };
      } catch {
        return { name, supported: false };
      }
    })
  );

  return results
    .filter((result): result is PromiseFulfilledResult<{ name: string; supported: boolean }> =>
      result.status === 'fulfilled')
    .map(result => result.value);
}
