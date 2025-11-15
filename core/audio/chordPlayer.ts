/**
 * Chord Player - Multiple simultaneous note playback for harmony
 */

import type { NoteIdentifier } from './music/types.js';

export interface ChordNote {
  note: NoteIdentifier;
  velocity?: number;
}

export interface ChordOptions {
  duration?: number;
  masterVolume?: number;
  fadeOut?: boolean;
}

/**
 * Manages simultaneous playback of multiple notes to create chords
 */
export class ChordPlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNotes: Map<string, { oscillator: OscillatorNode; gain: GainNode }> = new Map();

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
    } catch (error) {
      console.error('Failed to initialize chord player audio context:', error);
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private noteToFrequency(note: NoteIdentifier): number {
    const noteFrequencies: Record<string, number> = {
      'C': 261.63, 'C#': 277.18, 'Db': 277.18,
      'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
      'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
      'A': 440.00, 'A#': 466.16, 'Bb': 466.16, 'B': 493.88
    };

    const baseFreq = noteFrequencies[note.name] || 440;
    const octaveMultiplier = Math.pow(2, note.octave - 4);
    return baseFreq * octaveMultiplier;
  }

  private createNoteKey(note: NoteIdentifier): string {
    return `${note.name}${note.octave}`;
  }

  /**
   * Start playing a note (add to current chord)
   */
  async startNote(note: NoteIdentifier, velocity: number = 0.8): Promise<void> {
    await this.ensureAudioContext();

    if (!this.audioContext || !this.masterGain) return;

    const noteKey = this.createNoteKey(note);

    // Stop existing note if playing
    this.stopNote(note);

    const frequency = this.noteToFrequency(note);
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect audio nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Configure oscillator
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Configure envelope with smooth attack
    const now = this.audioContext.currentTime;
    const attack = 0.02;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * 0.3, now + attack); // Reduced volume for harmony

    // Start oscillator
    oscillator.start(now);

    // Store active note
    this.activeNotes.set(noteKey, { oscillator, gain: gainNode });

    console.log(`Started chord note: ${noteKey} (${frequency.toFixed(2)}Hz)`);
  }

  /**
   * Stop playing a specific note
   */
  stopNote(note: NoteIdentifier): void {
    const noteKey = this.createNoteKey(note);
    const activeNote = this.activeNotes.get(noteKey);

    if (activeNote && this.audioContext) {
      const now = this.audioContext.currentTime;
      const release = 0.1;

      // Fade out
      activeNote.gain.gain.linearRampToValueAtTime(0, now + release);

      // Stop oscillator after fade
      activeNote.oscillator.stop(now + release);

      this.activeNotes.delete(noteKey);

      console.log(`Stopped chord note: ${noteKey}`);
    }
  }

  /**
   * Play a chord (multiple notes simultaneously)
   */
  async playChord(chordNotes: ChordNote[], options: ChordOptions = {}): Promise<void> {
    const duration = options.duration || 2000;

    // Start all notes
    for (const chordNote of chordNotes) {
      await this.startNote(chordNote.note, chordNote.velocity);
    }

    // Stop all notes after duration
    if (duration > 0) {
      setTimeout(() => {
        for (const chordNote of chordNotes) {
          this.stopNote(chordNote.note);
        }
      }, duration);
    }
  }

  /**
   * Stop all currently playing notes
   */
  stopAllNotes(): void {
    for (const [, activeNote] of this.activeNotes.entries()) {
      if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const release = 0.05;

        activeNote.gain.gain.linearRampToValueAtTime(0, now + release);
        activeNote.oscillator.stop(now + release);
      }
    }
    this.activeNotes.clear();
  }

  /**
   * Get currently playing notes
   */
  getActiveNotes(): string[] {
    return Array.from(this.activeNotes.keys());
  }

  /**
   * Set master volume for chord player
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext.currentTime
      );
    }
  }
}

// Export singleton instance
export const chordPlayer = new ChordPlayer();
