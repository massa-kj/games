/**
 * Advanced Composition Mode - Full feature music composition interface
 *
 * Features:
 * - Complete composition sequencer
 * - Playback controls
 * - Tempo and key controls
 * - Composition management
 * - Duration editing
 * - Rest insertion
 */

import { useCallback } from 'react';
import type { NoteIdentifier } from '@core/audio/music';
import { NotePalette } from './NotePalette';
import { BlockSequencer } from './BlockSequencer';
import { PlaybackControls } from './PlaybackControls';
import { CompositionManager } from './CompositionManager';
import { SequencerSkeleton, PageTransition } from './LoadingComponents';
import { DurationSelector } from './DurationSelector';
import { CompositionControls } from './CompositionControls';
import { RestPalette } from './RestBlock';
import { useNotePlayer } from '../hooks/useNotePlayer';
import type { CompositionNote, Composition } from '../types/composition';

/**
 * Props for Advanced Composition Mode
 */
interface AdvancedCompositionModeProps {
  // Composition state
  composition: Composition | null;
  selectedNote: NoteIdentifier | undefined;
  selectedDuration: string;
  selectedRest: string | undefined;

  // Playback state
  currentPosition: number;
  duration: number;
  isPlaying: boolean;
  isPaused: boolean;
  canPlay: boolean;

  // Handlers
  onNoteSelect: (note: NoteIdentifier) => void;
  onDurationChange: (duration: string) => void;
  onRestSelect: (duration: string) => void;
  onSequenceChange: (sequence: CompositionNote[]) => void;
  onCompositionSelect: (composition: Composition) => void;
  onCompositionSave: (composition: Composition) => void;
  onNewComposition: () => void;
  onTempoChange: (tempo: number) => void;
  onKeySignatureChange: (key: string) => void;

  // Playback controls
  onPlay: () => Promise<void>;
  onPause: () => void;
  onStop: () => void;
  onSeek: (position: number) => void;

  // Management
  onToggleCompositionManager: () => void;
}

/**
 * Advanced Composition Mode Component
 */
export function AdvancedCompositionMode({
  composition,
  selectedNote,
  selectedDuration,
  selectedRest,
  currentPosition,
  duration,
  isPlaying,
  isPaused,
  canPlay,
  onNoteSelect,
  onDurationChange,
  onRestSelect,
  onSequenceChange,
  onCompositionSelect,
  onCompositionSave,
  onNewComposition,
  onTempoChange,
  onKeySignatureChange,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onToggleCompositionManager,
}: AdvancedCompositionModeProps) {
  const { playNote } = useNotePlayer();

  const handleNotePlay = useCallback((note: NoteIdentifier) => {
    // Play single note preview with Web Audio API
    playNote(note, 800, 0.6); // 800ms duration, 0.6 volume
  }, [playNote]);

  return (
    <div className="advanced-composition-mode space-y-6">
      {/* Current Composition Info */}
      {composition && (
        <PageTransition>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {composition.name}
            </h2>
            <p className="text-gray-600">
              {composition.sequence.length} notes • Modified {composition.modifiedAt?.toLocaleDateString()}
            </p>
          </div>
        </PageTransition>
      )}

      {/* Mobile: Horizontal Control Palette */}
      <div className="lg:hidden">
        <PageTransition>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <NotePalette
                selectedNote={selectedNote}
                onNoteSelect={onNoteSelect}
                onNotePlay={handleNotePlay}
                size="sm"
                scale="major"
                octave={4}
                colorScheme="hsl-wheel"
                availableNotes={[
                  { name: 'C', octave: 4 },
                  { name: 'D', octave: 4 },
                  { name: 'E', octave: 4 },
                  { name: 'F', octave: 4 },
                  { name: 'G', octave: 4 },
                  { name: 'A', octave: 4 },
                  { name: 'B', octave: 4 }
                ]}
                layout="grid"
              />
            </div>

            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <RestPalette
                onRestSelect={onRestSelect}
                selectedRest={selectedRest}
              />
            </div>

            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <DurationSelector
                selectedDuration={selectedDuration}
                onDurationChange={onDurationChange}
                orientation="horizontal"
                showLabels={false}
                showBeats={false}
              />
            </div>
          </div>
        </PageTransition>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Left Panel - Note Palette & Controls */}
        <div className="hidden lg:block col-span-1 space-y-6">
          <PageTransition>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
              <NotePalette
                selectedNote={selectedNote}
                onNoteSelect={onNoteSelect}
                onNotePlay={handleNotePlay}
                size="md"
                scale="major"
                octave={4}
                colorScheme="hsl-wheel"
                availableNotes={[
                  { name: 'C', octave: 4 },
                  { name: 'D', octave: 4 },
                  { name: 'E', octave: 4 },
                  { name: 'F', octave: 4 },
                  { name: 'G', octave: 4 },
                  { name: 'A', octave: 4 },
                  { name: 'B', octave: 4 }
                ]}
                layout="grid"
              />
            </div>
          </PageTransition>

          <PageTransition>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
              <RestPalette
                onRestSelect={onRestSelect}
                selectedRest={selectedRest}
              />
            </div>
          </PageTransition>

          <PageTransition>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
              <DurationSelector
                selectedDuration={selectedDuration}
                onDurationChange={onDurationChange}
                orientation="vertical"
                showLabels={true}
                showBeats={true}
              />
            </div>
          </PageTransition>
        </div>

        {/* Central Panel - Composition Sequencer */}
        <div className="col-span-1 lg:col-span-2">
          <PageTransition isLoading={!composition}>
            {composition ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 overflow-x-auto">
                <BlockSequencer
                  sequence={composition.sequence.filter((element): element is CompositionNote =>
                    'note' in element && 'velocity' in element
                  )}
                  maxBars={2}
                  beatsPerBar={4}
                  subdivisions={4}
                  playheadPosition={currentPosition}
                  isPlaying={isPlaying}
                  orientation="horizontal"
                  gridSize="normal"
                  onSequenceChange={onSequenceChange}
                  onNoteClick={(note, index) => console.log('Note clicked:', note, index)}
                  onPositionClick={(position) => console.log('Position clicked:', position)}
                  showGrid={true}
                  showBarLines={true}
                  showBeatNumbers={true}
                />
              </div>
            ) : (
              <SequencerSkeleton />
            )}
          </PageTransition>
        </div>

        {/* Right Panel - Controls & Management */}
        <div className="col-span-1 space-y-6">
          <PageTransition>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 lg:p-6">
              <CompositionControls
                tempo={composition?.tempo || 120}
                keySignature={composition?.key?.root || 'C'}
                onTempoChange={onTempoChange}
                onKeySignatureChange={onKeySignatureChange}
              />
            </div>
          </PageTransition>

          <PageTransition>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 lg:p-6">
              <PlaybackControls
                isPlaying={isPlaying}
                isPaused={isPaused}
                canPlay={canPlay}
                progress={currentPosition}
                duration={duration}
                onPlay={onPlay}
                onPause={onPause}
                onStop={onStop}
                onSeek={onSeek}
                showProgress={true}
                showDuration={true}
                size="md"
              />
            </div>
          </PageTransition>

          <PageTransition>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 lg:p-6">
              <CompositionManager
                currentComposition={composition}
                onCompositionSelect={onCompositionSelect}
                onCompositionSave={onCompositionSave}
                onNewComposition={onNewComposition}
              />
            </div>
          </PageTransition>
        </div>
      </div>

      {/* Quick Actions */}
      <PageTransition>
        <div className="text-center mt-8 space-x-4">
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={!canPlay}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>

          <button
            onClick={onStop}
            disabled={!isPlaying && !isPaused}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            ⏹️ Stop
          </button>

          <button
            onClick={onToggleCompositionManager}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
          >
            📁 Manage
          </button>
        </div>
      </PageTransition>

      {/* Instructions */}
      <PageTransition>
        <div className="mt-12 text-center text-gray-600">
          <p className="text-lg mb-4">
            Drag notes from the palette to the sequencer to compose your melody
          </p>
          <p className="text-sm">
            Use the playback controls to hear your composition
          </p>
        </div>
      </PageTransition>
    </div>
  );
}
