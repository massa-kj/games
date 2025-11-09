/**
 * Tests for melody functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MelodyDefinition, MelodyNote, SoundMap, NoteDuration } from './types';
import { soundManager } from './soundManager';

describe('Melody System', () => {
  beforeEach(() => {
    // Mock AudioContext for testing environment
    global.AudioContext = vi.fn().mockImplementation(() => ({
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }
      }),
      createStereoPanner: vi.fn().mockReturnValue({
        connect: vi.fn(),
        pan: { setValueAtTime: vi.fn() }
      }),
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        type: 'sine',
        onended: null
      }),
      destination: {},
      currentTime: 0,
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined)
    }));
  });

  describe('MelodyNote validation', () => {
    it('should accept valid note names', () => {
      const validNotes: MelodyNote[] = [
        { note: 'C4', duration: '4n' as const },
        { note: 'A#5', duration: '8n' as const },
        { note: 'Bb3', duration: '16n' as const },
        { note: 'rest', duration: '2n' as const }
      ];

      validNotes.forEach(note => {
        expect(note.note).toBeDefined();
        expect(note.duration).toBeDefined();
      });
    });

    it('should handle velocity and tie properties', () => {
      const noteWithVelocity: MelodyNote = {
        note: 'C4',
        duration: '4n' as const,
        velocity: 0.8,
        tie: true
      };

      expect(noteWithVelocity.velocity).toBe(0.8);
      expect(noteWithVelocity.tie).toBe(true);
    });
  });

  describe('MelodyDefinition structure', () => {
    it('should create valid melody definitions', () => {
      const melody: MelodyDefinition = {
        notes: [
          { note: 'C4', duration: '4n' as const },
          { note: 'E4', duration: '4n' as const },
          { note: 'G4', duration: '2n' as const }
        ],
        bpm: 120,
        type: 'sine',
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.8,
          release: 0.2
        }
      };

      expect(melody.notes).toHaveLength(3);
      expect(melody.bpm).toBe(120);
      expect(melody.type).toBe('sine');
      expect(melody.envelope).toBeDefined();
    });

    it('should work with minimal melody definition', () => {
      const simpleMelody: MelodyDefinition = {
        notes: [
          { note: 'C4', duration: '4n' as const }
        ]
      };

      expect(simpleMelody.notes).toHaveLength(1);
      expect(simpleMelody.bpm).toBeUndefined(); // Optional
    });
  });

  describe('SoundManager melody methods', () => {
    it('should register and play melodies', async () => {
      const testMelody: MelodyDefinition = {
        notes: [
          { note: 'C4', duration: '4n' as const },
          { note: 'E4', duration: '4n' as const }
        ],
        bpm: 100
      };

      // Register melody
      soundManager.registerMelody('test-melody', testMelody);

      // Should not throw when playing registered melody
      await expect(
        soundManager.playRegisteredMelody('test-melody')
      ).resolves.not.toThrow();
    });

    it('should handle non-existent melody gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await soundManager.playRegisteredMelody('non-existent');

      expect(consoleWarnSpy).toHaveBeenCalledWith("Melody 'non-existent' not found");

      consoleWarnSpy.mockRestore();
    });

    it('should play melody directly', async () => {
      const testMelody: MelodyDefinition = {
        notes: [{ note: 'C4', duration: '4n' as const }]
      };

      // Should not throw when playing melody directly
      await expect(
        soundManager.playMelody(testMelody)
      ).resolves.not.toThrow();
    });
  });

  describe('Integration with SoundMap', () => {
    it('should play melodies defined in sound maps', async () => {
      const soundMap = {
        'victory': {
          melody: {
            notes: [
              { note: 'C4', duration: '4n' as const },
              { note: 'E4', duration: '4n' as const },
              { note: 'G4', duration: '2n' as const }
            ],
            bpm: 120
          },
          volume: 0.8,
          tags: ['victory']
        }
      };

      // Should not throw when playing melody from sound map
      await expect(
        soundManager.playSound('victory', soundMap)
      ).resolves.not.toThrow();
    });
  });
});
