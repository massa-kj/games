/**
 * Sound effects hook for Color Mixer game
 */
export function useColorMixerSounds() {

  const playClickSound = async () => {
    try {
      // Generate simple click sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
  };

  const playMixSound = async () => {
    try {
      // Mixing sound (swirling effect)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.8);

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.warn('Failed to play mix sound:', error);
    }
  };

  const playSuccessSound = async () => {
    try {
      // Success sound (pop effect)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play success sound:', error);
    }
  };

  const playSaveSound = async () => {
    try {
      // Save sound (chime effect)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Failed to play save sound:', error);
    }
  };

  return {
    playClickSound,
    playMixSound,
    playSuccessSound,
    playSaveSound,
  };
}
