/**
 * Instrument presets for melody maker
 */

import type { InstrumentPreset } from '@core/audio/music';

/** Default instrument presets for melody maker */
export const MELODY_MAKER_INSTRUMENTS: Record<string, InstrumentPreset> = {
  piano: {
    id: 'piano',
    name: 'piano',
    displayName: 'instruments.piano',
    type: 'triangle',
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8
    }
  },
  xylophone: {
    id: 'xylophone',
    name: 'xylophone',
    displayName: 'instruments.xylophone',
    type: 'sine',
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.2,
      release: 0.3
    }
  },
  bell: {
    id: 'bell',
    name: 'bell',
    displayName: 'instruments.bell',
    type: 'sine',
    envelope: {
      attack: 0.01,
      decay: 0.5,
      sustain: 0.1,
      release: 2.0
    }
  },
  flute: {
    id: 'flute',
    name: 'flute',
    displayName: 'instruments.flute',
    type: 'sine',
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.8,
      release: 0.4
    },
    filter: {
      type: 'lowpass',
      frequency: 2000,
      Q: 1
    }
  }
};

/**
 * Get instrument preset by ID
 * @param instrumentId - ID of the instrument
 * @returns Instrument preset or default piano
 */
export function getInstrument(instrumentId: string): InstrumentPreset {
  return MELODY_MAKER_INSTRUMENTS[instrumentId] || MELODY_MAKER_INSTRUMENTS.piano;
}
