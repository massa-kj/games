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
    volume: 0.6,
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
    volume: 0.4,
    tags: ["interaction", "ui"]
  },

  // Match result sounds
  correctMatch: {
    tone: {
      type: "triangle",
      note: "C5",
      duration: "8n",
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.1
      }
    },
    volume: 0.8,
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
    volume: 0.5,
    tags: ["feedback", "error"]
  },

  // Game state sounds
  levelComplete: {
    tone: {
      type: "sine",
      note: "C6",
      duration: "2n",
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.7,
        release: 0.5
      }
    },
    volume: 0.9,
    tags: ["achievement", "completion"]
  },

  gameComplete: {
    // Grand victory fanfare with sparkly sound
    tone: {
      type: "triangle",
      note: "C6", // Higher pitch for more celebratory feel
      duration: "2n",
      envelope: {
        attack: 0.02,
        decay: 0.4,
        sustain: 0.9,
        release: 0.6
      },
      filter: {
        type: "highpass",
        frequency: 200,
        Q: 0.5
      }
    },
    volume: 0.9,
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

/**
 * Sound categories for easy filtering
 */
export const soundCategories = {
  interaction: ["cardFlip", "cardSelect", "buttonClick", "buttonHover"] as const,
  feedback: ["correctMatch", "incorrectMatch", "levelComplete", "gameComplete"] as const,
  timer: ["timerTick", "timeWarning", "timeUp"] as const,
  ambient: ["shuffle"] as const,
} as const;

/**
 * Get sounds by category
 */
export function getSoundsByCategory(category: keyof typeof soundCategories): string[] {
  return [...soundCategories[category]];
}

/**
 * Get sounds by tag
 */
export function getSoundsByTag(tag: string): string[] {
  return Object.entries(memoryCardSounds)
    .filter(([, definition]) => definition.tags?.includes(tag))
    .map(([name]) => name);
}
