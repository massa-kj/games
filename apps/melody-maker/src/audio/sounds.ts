/**
 * Sound definitions for Melody Maker game
 */

import type { SoundMap } from "@core/audio/types";

/**
 * Complete sound map for the Melody Maker game
 * Focuses on musical note generation and composition sounds
 */
export const melodyMakerSounds: SoundMap = {
  // Note preview sounds - generated dynamically
  notePreview: {
    tone: {
      type: "triangle",
      note: "C4", // Will be overridden dynamically
      duration: "4n",
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3
      }
    },
    volume: 0.8,
    tags: ["note", "preview"]
  },

  // Composition playback
  compositionPlay: {
    melody: {
      notes: [], // Will be populated dynamically
      bpm: 120,
      type: "triangle",
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.2
      }
    },
    volume: 0.8,
    tags: ["composition", "playback"]
  },

  // UI feedback sounds
  blockPlace: {
    tone: {
      type: "sine",
      note: "G5",
      duration: "16n",
      envelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.3,
        release: 0.1
      }
    },
    volume: 0.5,
    tags: ["ui", "placement"]
  },

  blockRemove: {
    tone: {
      type: "square",
      note: "F4",
      duration: "16n",
      envelope: {
        attack: 0.01,
        decay: 0.03,
        sustain: 0.2,
        release: 0.05
      }
    },
    volume: 0.4,
    tags: ["ui", "removal"]
  },

  scaleChange: {
    melody: {
      notes: [
        { note: "C4", duration: "16n", velocity: 0.6 },
        { note: "D4", duration: "16n", velocity: 0.7 },
        { note: "E4", duration: "16n", velocity: 0.8 }
      ],
      bpm: 200,
      type: "sine"
    },
    volume: 0.6,
    tags: ["ui", "scale"]
  },

  compositionSave: {
    tone: {
      type: "triangle",
      note: "A5",
      duration: "4n",
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.6,
        release: 0.3
      }
    },
    volume: 0.7,
    tags: ["ui", "save"]
  },

  compositionLoad: {
    tone: {
      type: "sine",
      note: "C5",
      duration: "4n",
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.8,
        release: 0.4
      }
    },
    volume: 0.7,
    tags: ["ui", "load"]
  }
};
