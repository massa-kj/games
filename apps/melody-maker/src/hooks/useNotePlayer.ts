/**
 * Enhanced sound management for different note pitches using Web Audio API
 */

import { useCallback, useRef } from 'react';
import type { NoteIdentifier } from '@core/audio/music';

/**
 * Convert note name to frequency in Hz
 */
function noteToFrequency(note: NoteIdentifier): number {
  const noteFrequencies: Record<string, number> = {
    'C': 261.63,
    'C#': 277.18, 'Db': 277.18,
    'D': 293.66,
    'D#': 311.13, 'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99, 'Gb': 369.99,
    'G': 392.00,
    'G#': 415.30, 'Ab': 415.30,
    'A': 440.00,
    'A#': 466.16, 'Bb': 466.16,
    'B': 493.88
  };

  const baseFreq = noteFrequencies[note.name] || 440;
  // Calculate frequency for the specific octave (4 is the base octave)
  const octaveMultiplier = Math.pow(2, note.octave - 4);
  return baseFreq * octaveMultiplier;
}

/**
 * Hook for playing individual notes with correct pitch using Web Audio API
 */
export function useNotePlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNote = useCallback(async (note: NoteIdentifier, duration: number = 500, velocity: number = 0.8) => {
    try {
      const audioContext = getAudioContext();

      // Resume audio context if it's suspended (required by browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const frequency = noteToFrequency(note);

      // Create oscillator for the tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure oscillator
      oscillator.type = 'triangle'; // Warm sound
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // Configure envelope (ADSR)
      const now = audioContext.currentTime;
      const attack = 0.01;
      const decay = 0.1;
      const sustain = 0.7;
      const release = 0.3;
      const noteDuration = duration / 1000; // Convert to seconds

      // Attack
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocity, now + attack);

      // Decay
      gainNode.gain.linearRampToValueAtTime(velocity * sustain, now + attack + decay);

      // Release
      const releaseTime = now + noteDuration - release;
      gainNode.gain.setValueAtTime(velocity * sustain, releaseTime);
      gainNode.gain.linearRampToValueAtTime(0, releaseTime + release);

      // Start and stop the oscillator
      oscillator.start(now);
      oscillator.stop(now + noteDuration);

      console.log(`Playing note: ${note.name}${note.octave} (${frequency.toFixed(2)}Hz) at volume ${velocity}`);

    } catch (error) {
      console.error('Failed to play note:', note, error);
    }
  }, [getAudioContext]);

  return { playNote };
}
