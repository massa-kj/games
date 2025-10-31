import type { AudioTemplate } from './webAudioEngine.js';

/**
 * Collection of audio effect templates commonly used in game development
 *
 * Usage example:
 * ```typescript
 * import { gameAudioTemplates } from './gameAudioTemplates';
 * import { advancedSoundManager } from './hybridSoundManager';
 *
 * // Register templates
 * gameAudioTemplates.registerAll(advancedSoundManager);
 *
 * // Usage
 * await advancedSoundManager.playTemplate('coin-collect');
 * await advancedSoundManager.playTemplate('power-up', { frequency: 600 });
 * await advancedSoundManager.playTemplate('explosion', { intensity: 0.8 });
 * ```
 */

export class GameAudioTemplates {
  private templates: Map<string, AudioTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Coin/point collection sound
    this.templates.set('coin-collect', {
      name: 'coin-collect',
      create: (context: AudioContext, params = {}) => {
        const { pitch = 1, duration = 0.3 } = params;
        return this.createMultiToneSequence(context, [
          { frequency: 659.25 * pitch, duration: 0.1, type: 'square' },
          { frequency: 830.61 * pitch, duration: 0.2, type: 'square' }
        ]);
      }
    });

    // Power-up sound
    this.templates.set('power-up', {
      name: 'power-up',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 440, duration = 0.6 } = params;
        return this.createSweepTone(context, {
          startFreq: frequency,
          endFreq: frequency * 2,
          duration,
          type: 'sawtooth',
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.1 }
        });
      }
    });

    // Jump sound
    this.templates.set('jump', {
      name: 'jump',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 320, duration = 0.2 } = params;
        return this.createSweepTone(context, {
          startFreq: frequency,
          endFreq: frequency * 1.5,
          duration,
          type: 'square',
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.14 }
        });
      }
    });

    // Explosion sound
    this.templates.set('explosion', {
      name: 'explosion',
      create: (context: AudioContext, params = {}) => {
        const { intensity = 1, duration = 0.5 } = params;
        return this.createExplosionSound(context, { intensity, duration });
      }
    });

    // Laser sound
    this.templates.set('laser', {
      name: 'laser',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 800, duration = 0.1 } = params;
        return this.createSweepTone(context, {
          startFreq: frequency,
          endFreq: frequency * 0.3,
          duration,
          type: 'sawtooth',
          envelope: { attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.077 }
        });
      }
    });

    // Failure/error sound
    this.templates.set('error', {
      name: 'error',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 200, duration = 0.3 } = params;
        return this.createSweepTone(context, {
          startFreq: frequency,
          endFreq: frequency * 0.8,
          duration,
          type: 'square',
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.19 }
        });
      }
    });

    // Success/completion sound
    this.templates.set('success', {
      name: 'success',
      create: (context: AudioContext, params = {}) => {
        const { pitch = 1 } = params;
        return this.createMultiToneSequence(context, [
          { frequency: 523.25 * pitch, duration: 0.15, type: 'sine' },
          { frequency: 659.25 * pitch, duration: 0.15, type: 'sine' },
          { frequency: 783.99 * pitch, duration: 0.3, type: 'sine' }
        ]);
      }
    });

    // Button click sound
    this.templates.set('button-click', {
      name: 'button-click',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 1000, duration = 0.05 } = params;
        return this.createSimpleTone(context, {
          frequency,
          duration,
          type: 'square',
          envelope: { attack: 0.001, decay: 0.01, sustain: 0.3, release: 0.039 }
        });
      }
    });

    // Hover sound
    this.templates.set('hover', {
      name: 'hover',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 800, duration = 0.03 } = params;
        return this.createSimpleTone(context, {
          frequency,
          duration,
          type: 'sine',
          envelope: { attack: 0.001, decay: 0.005, sustain: 0.5, release: 0.024 }
        });
      }
    });

    // Notification sound
    this.templates.set('notification', {
      name: 'notification',
      create: (context: AudioContext, params = {}) => {
        const { pitch = 1, urgency = 'normal' } = params;

        let sequence;
        switch (urgency) {
          case 'low':
            sequence = [
              { frequency: 440 * pitch, duration: 0.2, type: 'sine' as OscillatorType }
            ];
            break;
          case 'high':
            sequence = [
              { frequency: 880 * pitch, duration: 0.1, type: 'sine' as OscillatorType },
              { frequency: 0, duration: 0.05, type: 'sine' as OscillatorType },
              { frequency: 880 * pitch, duration: 0.1, type: 'sine' as OscillatorType }
            ];
            break;
          default: // normal
            sequence = [
              { frequency: 659.25 * pitch, duration: 0.15, type: 'sine' as OscillatorType },
              { frequency: 523.25 * pitch, duration: 0.15, type: 'sine' as OscillatorType }
            ];
        }

        return this.createMultiToneSequence(context, sequence);
      }
    });

    // Countdown sound
    this.templates.set('countdown', {
      name: 'countdown',
      create: (context: AudioContext, params = {}) => {
        const { frequency = 800, isFinal = false } = params;

        if (isFinal) {
          // Final count is high pitch
          return this.createSimpleTone(context, {
            frequency: frequency * 1.5,
            duration: 0.5,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.39 }
          });
        } else {
          // Normal count is low pitch
          return this.createSimpleTone(context, {
            frequency,
            duration: 0.2,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.135 }
          });
        }
      }
    });

    // Ambient/background sound (for short loops)
    this.templates.set('ambient-loop', {
      name: 'ambient-loop',
      create: (context: AudioContext, params = {}) => {
        const { type = 'wind', intensity = 0.3, duration = 2 } = params;

        switch (type) {
          case 'wind':
            return this.createFilteredNoise(context, {
              noiseType: 'pink',
              duration,
              filterFreq: 200,
              intensity
            });
          case 'rain':
            return this.createFilteredNoise(context, {
              noiseType: 'white',
              duration,
              filterFreq: 8000,
              intensity: intensity * 0.7
            });
          default:
            return this.createFilteredNoise(context, {
              noiseType: 'pink',
              duration,
              filterFreq: 500,
              intensity
            });
        }
      }
    });
  }

  // Helper methods

  private createSimpleTone(context: AudioContext, params: any): any {
    // OscillatorSource implementation needed (from webAudioEngine.ts)
    // Simplified to return only type for now
    return {
      id: `tone_${Date.now()}`,
      type: 'oscillator',
      start: () => { },
      stop: () => { },
      setVolume: () => { },
      setPan: () => { },
      connect: () => { },
      disconnect: () => { }
    };
  }

  private createSweepTone(context: AudioContext, params: any): any {
    // Implementation of tone with changing frequency
    return {
      id: `sweep_${Date.now()}`,
      type: 'oscillator',
      start: () => { },
      stop: () => { },
      setVolume: () => { },
      setPan: () => { },
      connect: () => { },
      disconnect: () => { }
    };
  }

  private createMultiToneSequence(context: AudioContext, sequence: any[]): any {
    // Implementation to play multiple tones in sequence
    return {
      id: `sequence_${Date.now()}`,
      type: 'buffer',
      start: () => { },
      stop: () => { },
      setVolume: () => { },
      setPan: () => { },
      connect: () => { },
      disconnect: () => { }
    };
  }

  private createExplosionSound(context: AudioContext, params: any): any {
    // Explosion sound implementation (noise + envelope)
    return {
      id: `explosion_${Date.now()}`,
      type: 'buffer',
      start: () => { },
      stop: () => { },
      setVolume: () => { },
      setPan: () => { },
      connect: () => { },
      disconnect: () => { }
    };
  }

  private createFilteredNoise(context: AudioContext, params: any): any {
    // Filtered noise implementation
    return {
      id: `filtered_noise_${Date.now()}`,
      type: 'buffer',
      start: () => { },
      stop: () => { },
      setVolume: () => { },
      setPan: () => { },
      connect: () => { },
      disconnect: () => { }
    };
  }

  // Public methods

  getTemplate(name: string): AudioTemplate | undefined {
    return this.templates.get(name);
  }

  getAllTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }

  registerTemplate(name: string, template: AudioTemplate): void {
    this.templates.set(name, template);
  }

  registerAll(soundManager: any): void {
    this.templates.forEach((template, name) => {
      soundManager.registerSoundTemplate(name, template);
    });
  }

  // Get template names by category
  getUITemplates(): string[] {
    return ['button-click', 'hover', 'notification'];
  }

  getGameplayTemplates(): string[] {
    return ['coin-collect', 'power-up', 'jump', 'explosion', 'laser'];
  }

  getFeedbackTemplates(): string[] {
    return ['success', 'error', 'countdown'];
  }

  getAmbientTemplates(): string[] {
    return ['ambient-loop'];
  }
}

// Singleton instance
export const gameAudioTemplates = new GameAudioTemplates();

// Utility functions with usage examples
export class GameAudioUtils {
  static async playGameEvent(
    soundManager: any,
    event: string,
    params: Record<string, any> = {}
  ): Promise<string | void> {
    switch (event) {
      case 'score':
        return soundManager.playTemplate('coin-collect', params);

      case 'levelUp':
        return soundManager.playTemplate('power-up', {
          frequency: 440,
          ...params
        });

      case 'gameOver':
        return soundManager.playTemplate('error', {
          frequency: 150,
          duration: 1,
          ...params
        });

      case 'victory':
        return soundManager.playTemplate('success', params);

      case 'action':
        return soundManager.playTemplate('button-click', params);

      default:
        console.warn(`Unknown game event: ${event}`);
    }
  }

  static async playUIFeedback(
    soundManager: any,
    action: 'click' | 'hover' | 'success' | 'error',
    params: Record<string, any> = {}
  ): Promise<string | void> {
    const templateMap = {
      click: 'button-click',
      hover: 'hover',
      success: 'success',
      error: 'error'
    };

    const template = templateMap[action];
    if (template) {
      return soundManager.playTemplate(template, params);
    }
  }

  static createAudioPreset(name: string, settings: Record<string, any>): Record<string, any> {
    const presets: Record<string, Record<string, any>> = {
      retro: {
        waveType: 'square',
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2
      },
      modern: {
        waveType: 'sine',
        attack: 0.001,
        decay: 0.05,
        sustain: 0.7,
        release: 0.3
      },
      aggressive: {
        waveType: 'sawtooth',
        attack: 0.001,
        decay: 0.02,
        sustain: 0.5,
        release: 0.1
      }
    };

    return { ...presets[name], ...settings };
  }
}

export default gameAudioTemplates;
