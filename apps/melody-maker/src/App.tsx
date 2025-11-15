import { GameHeader, MenuBoard } from '@core/ui';
import type { MenuTab } from '@core/ui';
import { I18nProvider } from '@core/i18n';
import { useL10n } from '@/locales';
import type { NoteIdentifier } from '@core/audio/music';
import { SimplePlayMode } from './components/SimplePlayMode';
import { AdvancedCompositionMode } from './components/AdvancedCompositionMode';
import {
  AccessibilityProvider,
  AccessibleButton,
  AccessibilitySettingsPanel,
  KeyboardNavigation,
  useAccessibility
} from './components/AccessibilityEnhancements';
import { PageTransition } from './components/LoadingComponents';
import { useComposition } from './hooks/useComposition';
import { useMelodyPlayback } from './hooks/useMelodyPlayback';
import type { CompositionNote, Composition } from './types/composition';
import { useState, useCallback, useEffect } from 'react';
import '@/styles.css';

export default function MelodyMakerApp() {
  return (
    <I18nProvider>
      <AccessibilityProvider>
        <GameContent />
      </AccessibilityProvider>
    </I18nProvider>
  );
}

function GameContent() {
  const { t } = useL10n();
  const { } = useAccessibility();
  const [selectedNote, setSelectedNote] = useState<NoteIdentifier | undefined>(undefined);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('4n');
  const [selectedRest, setSelectedRest] = useState<string | undefined>(undefined);
  const [showCompositionManager, setShowCompositionManager] = useState(false);

  // Composition management hook
  const {
    composition,
    createComposition,
    loadComposition,
    replaceSequence,
  } = useComposition();

  // Playback hook
  const playback = useMelodyPlayback(composition, {
    onNoteStart: (note) => console.log('Playing note:', note),
    onNoteEnd: (note) => console.log('Note finished:', note),
    onPlaybackComplete: () => console.log('Playback completed'),
  });

  // Initialize with a new composition if none exists
  useEffect(() => {
    if (!composition) {
      createComposition('My First Melody');
    }
  }, [composition, createComposition]);

  // Handlers
  const handleNoteSelect = useCallback((note: NoteIdentifier) => {
    setSelectedNote(note);
  }, []);

  const handleCompositionChange = useCallback((newSequence: CompositionNote[]) => {
    if (composition) {
      replaceSequence(newSequence);
    }
  }, [composition, replaceSequence]);

  const handleCompositionSelect = useCallback((newComposition: Composition) => {
    loadComposition(newComposition);
    setShowCompositionManager(false);
  }, [loadComposition]);

  const handleCompositionSave = useCallback((savedComposition: Composition) => {
    console.log('Composition saved:', savedComposition.name);
  }, []);

  const handleNewComposition = useCallback(() => {
    createComposition('New Melody');
    setShowCompositionManager(false);
  }, [createComposition]);

  const handleTempoChange = useCallback((newTempo: number) => {
    if (composition) {
      console.log('Tempo changed to:', newTempo);
    }
  }, [composition]);

  const handleKeySignatureChange = useCallback((newKey: string) => {
    if (composition) {
      console.log('Key signature changed to:', newKey);
    }
  }, [composition]);

  const handleRestSelect = useCallback((duration: string) => {
    setSelectedRest(duration);
    setSelectedNote(undefined);
  }, []);

  // Define menu tabs
  const menuTabs: MenuTab[] = [
    {
      id: 'simple-play',
      label: 'Play Music',
      icon: '🎵',
      content: <SimplePlayMode />
    },
    {
      id: 'advanced-compose',
      label: 'Create Music',
      icon: '🎼',
      content: (
        <AdvancedCompositionMode
          composition={composition}
          selectedNote={selectedNote}
          selectedDuration={selectedDuration}
          selectedRest={selectedRest}
          currentPosition={playback.currentPosition}
          duration={playback.duration}
          isPlaying={playback.isPlaying}
          isPaused={playback.isPaused}
          canPlay={playback.canPlay}
          onNoteSelect={handleNoteSelect}
          onDurationChange={setSelectedDuration}
          onRestSelect={handleRestSelect}
          onSequenceChange={handleCompositionChange}
          onCompositionSelect={handleCompositionSelect}
          onCompositionSave={handleCompositionSave}
          onNewComposition={handleNewComposition}
          onTempoChange={handleTempoChange}
          onKeySignatureChange={handleKeySignatureChange}
          onPlay={playback.play}
          onPause={playback.pause}
          onStop={playback.stop}
          onSeek={playback.seekTo}
          onToggleCompositionManager={() => setShowCompositionManager(!showCompositionManager)}
        />
      )
    }
  ];

  return (
    <KeyboardNavigation
      onEscape={() => {
        if (showAccessibilitySettings) setShowAccessibilitySettings(false);
        if (showCompositionManager) setShowCompositionManager(false);
      }}
    >
      <GameHeader
        title={t('title')}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8" id="main-content">
          {/* Main MenuBoard with Tabs */}
          <MenuBoard
            title="Melody Maker"
            tabs={menuTabs}
            size="full"
            variant="inline"
            defaultActiveTab="simple-play"
            tabVariant="pills"
            ariaLabel="Melody Maker Game Modes"
            className="mb-8"
          />

          {/* Quick Actions */}
          {/* <PageTransition>
            <div className="text-center mt-8 space-x-4">
              <AccessibleButton
                onClick={() => setShowAccessibilitySettings(!showAccessibilitySettings)}
                variant="secondary"
                size="lg"
                ariaLabel="Open accessibility settings"
              >
                ♿ Accessibility
              </AccessibleButton>
            </div>
          </PageTransition> */}

          {/* Accessibility Settings Panel */}
          {/* {showAccessibilitySettings && (
            <PageTransition>
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="max-w-md mx-4">
                  <AccessibilitySettingsPanel />
                  <div className="text-center mt-4">
                    <AccessibleButton
                      onClick={() => setShowAccessibilitySettings(false)}
                      variant="secondary"
                      ariaLabel="Close accessibility settings"
                    >
                      Close
                    </AccessibleButton>
                  </div>
                </div>
              </div>
            </PageTransition>
          )} */}
        </div>
      </div>
    </KeyboardNavigation>
  );
}
