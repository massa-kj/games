import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = function () { };

// Mock Web Audio API for tests
const mockAudioContext = {
  createOscillator: () => ({
    connect: () => {},
    start: () => {},
    stop: () => {},
    frequency: { setValueAtTime: () => {} },
    type: 'sine'
  }),
  createGain: () => ({
    connect: () => {},
    gain: { setValueAtTime: () => {} }
  }),
  createDynamicsCompressor: () => ({
    connect: () => {},
    threshold: { setValueAtTime: () => {} },
    knee: { setValueAtTime: () => {} },
    ratio: { setValueAtTime: () => {} },
    attack: { setValueAtTime: () => {} },
    release: { setValueAtTime: () => {} }
  }),
  createBufferSource: () => ({
    connect: () => {},
    start: () => {},
    stop: () => {},
    buffer: null
  }),
  createBuffer: () => ({}),
  decodeAudioData: () => Promise.resolve({}),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
  resume: () => Promise.resolve(),
  suspend: () => Promise.resolve(),
  close: () => Promise.resolve()
};

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: function() {
    return mockAudioContext;
  }
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: function() {
    return mockAudioContext;
  }
});

// Reset DOM state before each test
beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});
