/**
 * useMelodyPlayback - Melody playback control hook
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNotePlayer } from './useNotePlayer.js';
import type { Composition, CompositionNote } from '../types/composition.js';

/**
 * Playback state enum
 */
export enum PlaybackState {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused',
}

/**
 * Note timing information for playback
 */
interface NoteEvent {
  note: CompositionNote;
  startTime: number;     // Absolute time in seconds
  duration: number;      // Duration in seconds
}



/**
 * Hook return type
 */
interface UseMelodyPlaybackReturn {
  // Playback state
  playbackState: PlaybackState;
  currentPosition: number;    // Current playback position (0-1)
  currentTime: number;        // Current time in seconds
  duration: number;           // Total duration in seconds
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  canPlay: boolean;          // Has notes to play

  // Playback controls
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seekTo: (position: number) => void; // Seek to position (0-1)

  // Current playing note info
  currentNotes: CompositionNote[];    // Notes playing at current time
  upcomingNote: CompositionNote | null; // Next note to play

  // Events
  onNoteStart?: (note: CompositionNote) => void;
  onNoteEnd?: (note: CompositionNote) => void;
  onPlaybackComplete?: () => void;
}

/**
 * Convert note duration to seconds based on tempo
 */
function durationToSeconds(duration: string | number, tempo: number): number {
  const baseDuration = 60 / tempo; // Quarter note duration in seconds

  switch (duration) {
    case '1n': return baseDuration * 4;  // Whole note
    case '2n': return baseDuration * 2;  // Half note
    case '4n': return baseDuration;      // Quarter note
    case '8n': return baseDuration / 2;  // Eighth note
    case '16n': return baseDuration / 4; // Sixteenth note
    case '32n': return baseDuration / 8; // Thirty-second note
    default: return baseDuration;
  }
}

/**
 * Convert position (subdivision units) to time in seconds
 */
function positionToTime(position: number, tempo: number, subdivisionsPerBeat: number = 4): number {
  const beatDuration = 60 / tempo; // Seconds per beat
  const subdivisionDuration = beatDuration / subdivisionsPerBeat;
  return position * subdivisionDuration;
}

/**
 * Generate note events for playback scheduling
 */
function generateNoteEvents(composition: Composition): NoteEvent[] {
  if (!composition.sequence.length) return [];

  const events: NoteEvent[] = [];

  composition.sequence.forEach(element => {
    // Only process actual notes, skip rests
    if ('note' in element && 'velocity' in element) {
      const note = element as CompositionNote;
      const startTime = positionToTime(note.position, composition.tempo);
      const duration = durationToSeconds(note.duration, composition.tempo);

      events.push({
        note,
        startTime,
        duration,
      });
    }
  });

  return events.sort((a, b) => a.startTime - b.startTime);
}

/**
 * Melody playback control hook
 *
 * Provides comprehensive playback functionality including:
 * - Play/pause/stop controls
 * - Real-time position tracking
 * - Sequential note scheduling
 * - Visual feedback coordination
 * - Loop playback support
 */
export function useMelodyPlayback(
  composition: Composition | null,
  options: {
    onNoteStart?: (note: CompositionNote) => void;
    onNoteEnd?: (note: CompositionNote) => void;
    onPlaybackComplete?: () => void;
  } = {}
): UseMelodyPlaybackReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.STOPPED);
  const [currentTime, setCurrentTime] = useState(0);
  const playbackStateRef = useRef<PlaybackState>(playbackState);

  // Update playback state ref when state changes
  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  // Use the enhanced note player for individual note playback
  const { playNote } = useNotePlayer();

  // Refs for playback control
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const activeNotesRef = useRef<Set<string>>(new Set());
  const scheduledTimeoutsRef = useRef<Set<number>>(new Set());

  // Generate note events from composition
  const noteEvents = useMemo(() => {
    if (!composition) return [];
    return generateNoteEvents(composition);
  }, [composition]);

  // Calculate total duration
  const duration = useMemo(() => {
    if (!noteEvents.length) return 0;

    // Find the latest note end time
    return Math.max(...noteEvents.map(event => event.startTime + event.duration));
  }, [noteEvents]);

  // Current position (0-1)
  const currentPosition = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  // Playback state checks
  const isPlaying = playbackState === PlaybackState.PLAYING;
  const isPaused = playbackState === PlaybackState.PAUSED;
  const isStopped = playbackState === PlaybackState.STOPPED;
  const canPlay = noteEvents.length > 0;

  // Get currently playing notes
  const currentNotes = useMemo(() => {
    return noteEvents
      .filter(event =>
        currentTime >= event.startTime &&
        currentTime < event.startTime + event.duration
      )
      .map(event => event.note);
  }, [noteEvents, currentTime]);

  // Get next upcoming note
  const upcomingNote = useMemo(() => {
    const upcomingEvent = noteEvents.find(event => event.startTime > currentTime);
    return upcomingEvent?.note || null;
  }, [noteEvents, currentTime]);

  // Animation frame loop for playback timing
  const updatePlaybackTime = useCallback(() => {
    if (playbackState !== PlaybackState.PLAYING) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000; // Convert to seconds
    const newTime = pausedTimeRef.current + elapsed;

    setCurrentTime(newTime);

    // Check if playback is complete
    if (newTime >= duration) {
      if (composition?.loop) {
        // Restart playback for looped compositions
        setCurrentTime(0);
        pausedTimeRef.current = 0;
        startTimeRef.current = now;
        clearScheduledTimeouts(); // Clear scheduled timeouts for loop restart
        scheduleNotesFromTime(0); // Reschedule from beginning
      } else {
        // Stop playback
        setPlaybackState(PlaybackState.STOPPED);
        setCurrentTime(0);
        pausedTimeRef.current = 0;
        clearScheduledTimeouts(); // Clear scheduled timeouts on complete
        options.onPlaybackComplete?.();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
  }, [playbackState, duration, composition?.loop, options]);

  // Clear all scheduled timeouts
  const clearScheduledTimeouts = useCallback(() => {
    scheduledTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    scheduledTimeoutsRef.current.clear();
  }, []);

  // Schedule notes for sequential playback
  const scheduleNotesFromTime = useCallback((fromTime: number) => {
    console.log(`Scheduling notes from time: ${fromTime.toFixed(2)}s`);

    // Clear any existing scheduled timeouts
    clearScheduledTimeouts();

    // Find notes that should play after the current time
    const upcomingEvents = noteEvents.filter(event => event.startTime >= fromTime);

    upcomingEvents.forEach(event => {
      const delay = (event.startTime - fromTime) * 1000; // Convert to milliseconds
      const noteDuration = durationToSeconds(event.note.duration, composition?.tempo || 120) * 1000;

      console.log(`Scheduling note ${event.note.note.name}${event.note.note.octave} in ${delay.toFixed(0)}ms`);

      const timeoutId = window.setTimeout(() => {
        // Check if we're still playing when the timeout fires
        if (playbackStateRef.current === PlaybackState.PLAYING) {
          options.onNoteStart?.(event.note);
          activeNotesRef.current.add(event.note.id);

          playNote(event.note.note, noteDuration, event.note.velocity).catch((error: any) => {
            console.error('Failed to play note:', error);
          });

          // Schedule note end callback
          const endTimeoutId = window.setTimeout(() => {
            activeNotesRef.current.delete(event.note.id);
            options.onNoteEnd?.(event.note);
            scheduledTimeoutsRef.current.delete(endTimeoutId);
          }, noteDuration);

          scheduledTimeoutsRef.current.add(endTimeoutId);
        }

        // Remove this timeout from our tracking
        scheduledTimeoutsRef.current.delete(timeoutId);
      }, Math.max(0, delay));

      scheduledTimeoutsRef.current.add(timeoutId);
    });
  }, [noteEvents, playNote, options, composition?.tempo, clearScheduledTimeouts]);

  // Start playback animation loop
  useEffect(() => {
    if (playbackState === PlaybackState.PLAYING) {
      startTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playbackState, updatePlaybackTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearScheduledTimeouts();
    };
  }, [clearScheduledTimeouts]);

  // Play function
  const play = useCallback(async () => {
    if (!canPlay) return;

    const startTime = playbackState === PlaybackState.PAUSED ? currentTime : 0;

    if (playbackState === PlaybackState.PAUSED) {
      // Resume from pause
      setPlaybackState(PlaybackState.PLAYING);
      scheduleNotesFromTime(currentTime);
    } else {
      // Start from beginning or current position
      setPlaybackState(PlaybackState.PLAYING);
      if (currentTime >= duration) {
        // Reset if at end
        setCurrentTime(0);
        pausedTimeRef.current = 0;
        scheduleNotesFromTime(0);
      } else {
        scheduleNotesFromTime(startTime);
      }
    }
  }, [canPlay, playbackState, currentTime, duration, scheduleNotesFromTime]);

  // Pause function
  const pause = useCallback(() => {
    if (playbackState === PlaybackState.PLAYING) {
      setPlaybackState(PlaybackState.PAUSED);
      pausedTimeRef.current = currentTime;

      // Clear active notes and scheduled timeouts
      activeNotesRef.current.clear();
      clearScheduledTimeouts();
    }
  }, [playbackState, currentTime, clearScheduledTimeouts]);

  // Stop function
  const stop = useCallback(() => {
    setPlaybackState(PlaybackState.STOPPED);
    setCurrentTime(0);
    pausedTimeRef.current = 0;

    // Clear active notes and scheduled timeouts
    activeNotesRef.current.clear();
    clearScheduledTimeouts();
  }, [clearScheduledTimeouts]);

  // Seek to position
  const seekTo = useCallback((position: number) => {
    const newTime = Math.max(0, Math.min(position * duration, duration));
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;

    // Clear active notes and scheduled timeouts when seeking
    activeNotesRef.current.clear();
    clearScheduledTimeouts();

    // If playing, restart timing from new position
    if (playbackState === PlaybackState.PLAYING) {
      startTimeRef.current = performance.now();
      scheduleNotesFromTime(newTime);
    }
  }, [duration, playbackState, clearScheduledTimeouts, scheduleNotesFromTime]);

  return {
    // State
    playbackState,
    currentPosition,
    currentTime,
    duration,
    isPlaying,
    isPaused,
    isStopped,
    canPlay,

    // Controls
    play,
    pause,
    stop,
    seekTo,

    // Current state
    currentNotes,
    upcomingNote,
  };
}
