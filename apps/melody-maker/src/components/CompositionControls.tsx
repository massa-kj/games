/**
 * CompositionControls - Tempo and key signature controls
 */

import React, { useState, useCallback } from 'react';

/**
 * Available key signatures
 */
export const KEY_SIGNATURES = [
  { key: 'C', label: 'C Major', sharps: 0, flats: 0 },
  { key: 'G', label: 'G Major', sharps: 1, flats: 0 },
  { key: 'D', label: 'D Major', sharps: 2, flats: 0 },
  { key: 'A', label: 'A Major', sharps: 3, flats: 0 },
  { key: 'E', label: 'E Major', sharps: 4, flats: 0 },
  { key: 'F', label: 'F Major', sharps: 0, flats: 1 },
  { key: 'Bb', label: 'B♭ Major', sharps: 0, flats: 2 },
  { key: 'Eb', label: 'E♭ Major', sharps: 0, flats: 3 },
  { key: 'Ab', label: 'A♭ Major', sharps: 0, flats: 4 },
] as const;

/**
 * Props for CompositionControls
 */
interface CompositionControlsProps {
  tempo: number;
  keySignature: string;
  onTempoChange: (tempo: number) => void;
  onKeySignatureChange: (key: string) => void;
  className?: string;
}

/**
 * CompositionControls component for tempo and key signature
 */
export const CompositionControls: React.FC<CompositionControlsProps> = ({
  tempo,
  keySignature,
  onTempoChange,
  onKeySignatureChange,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTempo, setTempTempo] = useState(tempo.toString());

  // Handle tempo input changes
  const handleTempoInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempTempo(e.target.value);
  }, []);

  // Handle tempo input blur (commit changes)
  const handleTempoBlur = useCallback(() => {
    const newTempo = parseInt(tempTempo, 10);
    if (!isNaN(newTempo) && newTempo >= 60 && newTempo <= 180) {
      onTempoChange(newTempo);
    } else {
      setTempTempo(tempo.toString()); // Reset to valid value
    }
    setIsEditing(false);
  }, [tempTempo, tempo, onTempoChange]);

  // Handle tempo input key press
  const handleTempoKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTempoBlur();
    } else if (e.key === 'Escape') {
      setTempTempo(tempo.toString());
      setIsEditing(false);
    }
  }, [handleTempoBlur, tempo]);

  // Handle tempo slider change
  const handleTempoSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value, 10);
    onTempoChange(newTempo);
    setTempTempo(newTempo.toString());
  }, [onTempoChange]);

  // Get current key signature info
  const currentKeyInfo = KEY_SIGNATURES.find(k => k.key === keySignature) || KEY_SIGNATURES[0];

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Composition Settings</h3>

      {/* Tempo Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Tempo (BPM)
        </label>

        <div className="flex items-center gap-3">
          {/* Tempo Slider */}
          <input
            type="range"
            min="60"
            max="180"
            step="5"
            value={tempo}
            onChange={handleTempoSliderChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((tempo - 60) / (180 - 60)) * 100}%, #d1d5db ${((tempo - 60) / (180 - 60)) * 100}%, #d1d5db 100%)`
            }}
          />

          {/* Tempo Value Display/Input */}
          {isEditing ? (
            <input
              type="number"
              min="60"
              max="180"
              value={tempTempo}
              onChange={handleTempoInputChange}
              onBlur={handleTempoBlur}
              onKeyDown={handleTempoKeyPress}
              className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-16 px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            >
              {tempo}
            </button>
          )}
        </div>

        {/* Tempo Indicator */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Slow</span>
          <span className="font-medium">
            {tempo < 80 ? 'Largo' :
             tempo < 100 ? 'Andante' :
             tempo < 120 ? 'Moderato' :
             tempo < 140 ? 'Allegro' : 'Presto'}
          </span>
          <span>Fast</span>
        </div>
      </div>

      {/* Key Signature Control */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Key Signature
        </label>

        <div className="grid grid-cols-3 gap-2">
          {KEY_SIGNATURES.map((key) => (
            <button
              key={key.key}
              onClick={() => onKeySignatureChange(key.key)}
              className={`
                p-2 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center text-center
                hover:scale-105
                ${keySignature === key.key
                  ? 'border-blue-500 bg-blue-100 text-blue-800 shadow-md'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }
              `}
              title={key.label}
            >
              <div className="font-bold text-lg">{key.key}</div>
              <div className="text-xs opacity-75">
                {key.sharps > 0 && `${key.sharps}♯`}
                {key.flats > 0 && `${key.flats}♭`}
                {key.sharps === 0 && key.flats === 0 && '♮'}
              </div>
            </button>
          ))}
        </div>

        {/* Current Key Info */}
        <div className="mt-2 text-sm text-gray-600 text-center">
          <span className="font-medium">{currentKeyInfo.label}</span>
          {(currentKeyInfo.sharps > 0 || currentKeyInfo.flats > 0) && (
            <span className="ml-2 opacity-75">
              ({currentKeyInfo.sharps > 0
                ? `${currentKeyInfo.sharps} sharp${currentKeyInfo.sharps > 1 ? 's' : ''}`
                : `${currentKeyInfo.flats} flat${currentKeyInfo.flats > 1 ? 's' : ''}`})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
