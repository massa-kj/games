/**
 * Sound definitions for Memory Cards game
 */

import type { SoundMap } from "@core/audio/types";

/**
 * Complete sound map for the Memory Cards game
 * Demonstrates both procedural tone generation and file-based sounds
 */
export const memoryCardSounds: SoundMap = {
  // Card interaction sounds
  cardFlip: {
    tone: {
      type: "square",
      note: "C6",
      duration: "16n",
      envelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.3,
        release: 0.05
      }
    },
    volume: 0.5,
    tags: ["interaction", "card"]
  },

  cardSelect: {
    tone: {
      type: "sine",
      note: "E6",
      duration: "32n",
      envelope: {
        attack: 0.01,
        decay: 0.02,
        sustain: 0.5,
        release: 0.03
      }
    },
    volume: 0.3,
    tags: ["interaction", "ui"]
  },

  // Match result sounds
  correctMatch: {
    melody: {
      notes: [
        { note: "G5", duration: "16n" },
        { note: "C6", duration: "16n" },
      ],
      bpm: 120, // Slower for more clarity
      type: 'sine',
    },
    volume: 0.6,
    tags: ["feedback", "success"]
  },

  incorrectMatch: {
    tone: {
      type: "sawtooth",
      note: "F3",
      duration: "4n",
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2
      },
      filter: {
        type: "lowpass",
        frequency: 800,
        Q: 2
      }
    },
    volume: 0.4,
    tags: ["feedback", "error"]
  },

  // Game state sounds
  levelComplete: {
    // Simple victory melody: C-E-G-C with better timing
    melody: {
      notes: [
        { note: 'C5', duration: '4n', velocity: 0.8 },
        { note: 'E5', duration: '4n', velocity: 0.9 },
        { note: 'G5', duration: '4n', velocity: 0.9 },
        { note: 'C6', duration: '2n', velocity: 1.0 }
      ],
      bpm: 120,
      type: 'sine',
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.2
      }
    },
    volume: 0.7,
    tags: ["achievement", "completion"]
  },

  gameComplete: {
    // Grand victory fanfare melody - improved spacing and timing
    melody: {
      notes: [
        { note: "C5", duration: "8n" },
        { note: "E5", duration: "8n" },
        { note: "G5", duration: "4n" },
        { note: "C6", duration: "2n" },
      ],
      bpm: 120, // Slower for more clarity
      type: 'triangle',
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.9,
        release: 0.3
      }
    },
    volume: 0.7,
    tags: ["achievement", "victory"]
  },

  // UI feedback sounds
  buttonClick: {
    tone: {
      type: "square",
      note: "A5",
      duration: "32n",
      envelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.2,
        release: 0.05
      }
    },
    volume: 0.3,
    tags: ["ui", "button"]
  },

  buttonHover: {
    tone: {
      type: "sine",
      note: "E5",
      duration: "32n",
      envelope: {
        attack: 0.01,
        decay: 0.02,
        sustain: 0.3,
        release: 0.02
      }
    },
    volume: 0.2,
    tags: ["ui", "hover"]
  },

  // Ambient sounds
  shuffle: {
    tone: {
      type: "noise",
      duration: 0.3,
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.1
      },
      filter: {
        type: "highpass",
        frequency: 500,
        Q: 1
      }
    },
    volume: 0.4,
    tags: ["ambient", "shuffle"]
  },

  // Timer sounds
  timerTick: {
    tone: {
      type: "square",
      note: "C4",
      duration: "16n",
      envelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.1,
        release: 0.05
      }
    },
    volume: 0.3,
    tags: ["timer", "tick"]
  },

  timeWarning: {
    tone: {
      type: "triangle",
      note: "A4",
      duration: "4n",
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.5,
        release: 0.2
      }
    },
    volume: 0.7,
    tags: ["timer", "warning"]
  },

  timeUp: {
    tone: {
      type: "sawtooth",
      note: "C3",
      duration: "2n",
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.4,
        release: 0.3
      }
    },
    volume: 0.8,
    tags: ["timer", "end"]
  }
};
