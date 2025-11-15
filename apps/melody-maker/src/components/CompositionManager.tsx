/**
 * CompositionManager - Enhanced save/load compositions UI with loading states
 */

import React, { useState, useEffect, useCallback } from 'react';
import { compositionStorageApi } from '../storage/compositions.js';
import { LoadingSpinner, CompositionSkeleton, LoadingOverlay, PageTransition } from './LoadingComponents.js';
import type { Composition, CompositionMeta } from '../types/composition.js';

/**
 * Simple SVG icons for the composition manager
 */
const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);

const LoadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
  </svg>
);

/**
 * Component props
 */
interface CompositionManagerProps {
  currentComposition: Composition | null;
  onCompositionSelect: (composition: Composition) => void;
  onCompositionSave: (composition: Composition) => void;
  onNewComposition: () => void;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in minutes:seconds
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * CompositionManager component provides save/load functionality
 *
 * Features:
 * - Save current composition with custom name
 * - Load existing compositions from storage
 * - Delete unwanted compositions
 * - Display composition metadata (duration, note count, date)
 * - Responsive list layout
 * - Confirmation dialogs for destructive actions
 */
export const CompositionManager: React.FC<CompositionManagerProps> = ({
  currentComposition,
  onCompositionSelect,
  onCompositionSave,
  onNewComposition,
}) => {
  const [compositions, setCompositions] = useState<CompositionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Load compositions on mount
  useEffect(() => {
    loadCompositions();
  }, []);

  // Update save name when current composition changes
  useEffect(() => {
    if (currentComposition) {
      setSaveName(currentComposition.name);
    }
  }, [currentComposition]);

  // Load compositions from storage with enhanced loading states
  const loadCompositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingMessage('Loading compositions...');

      // Simulate minimum loading time for smooth UX
      const [loadedCompositions] = await Promise.all([
        compositionStorageApi.listCompositions(),
        new Promise(resolve => setTimeout(resolve, 300))
      ]);

      setCompositions(loadedCompositions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compositions');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, []);

  // Save current composition with loading state
  const handleSave = useCallback(async () => {
    if (!currentComposition || !saveName.trim()) return;

    try {
      setOperationLoading(true);
      setLoadingMessage('Saving composition...');
      setError(null);

      const compositionToSave: Composition = {
        ...currentComposition,
        name: saveName.trim(),
        modifiedAt: new Date(),
      };

      await Promise.all([
        compositionStorageApi.saveComposition(compositionToSave),
        new Promise(resolve => setTimeout(resolve, 500)) // Smooth UX delay
      ]);

      onCompositionSave(compositionToSave);
      setSaveDialogOpen(false);
      setSaveName('');
      await loadCompositions(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save composition');
    } finally {
      setOperationLoading(false);
      setLoadingMessage('');
    }
  }, [currentComposition, saveName, onCompositionSave, loadCompositions]);

  // Load selected composition with loading state
  const handleLoad = useCallback(async (id: string) => {
    try {
      setOperationLoading(true);
      setLoadingMessage('Loading composition...');
      setError(null);

      const [composition] = await Promise.all([
        compositionStorageApi.loadComposition(id),
        new Promise(resolve => setTimeout(resolve, 300)) // Smooth UX delay
      ]);

      if (composition) {
        onCompositionSelect(composition);
      } else {
        setError('Composition not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load composition');
    } finally {
      setOperationLoading(false);
      setLoadingMessage('');
    }
  }, [onCompositionSelect]);

  // Delete composition with loading state
  const handleDelete = useCallback(async (id: string) => {
    try {
      setOperationLoading(true);
      setLoadingMessage('Deleting composition...');
      setError(null);

      const [success] = await Promise.all([
        compositionStorageApi.deleteComposition(id),
        new Promise(resolve => setTimeout(resolve, 300)) // Smooth UX delay
      ]);

      if (success) {
        setDeleteConfirmId(null);
        await loadCompositions(); // Refresh list
      } else {
        setError('Failed to delete composition');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete composition');
    } finally {
      setOperationLoading(false);
      setLoadingMessage('');
    }
  }, [loadCompositions]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSaveDialogOpen(false);
      setDeleteConfirmId(null);
    }
  }, []);

  const canSave = currentComposition && currentComposition.sequence.length > 0;

  return (
    <LoadingOverlay isVisible={operationLoading} message={loadingMessage}>
      <PageTransition isLoading={loading}>
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <FolderIcon className="w-5 h-5" />
          Compositions
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onNewComposition}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="New composition"
          >
            New
          </button>
          <button
            onClick={() => setSaveDialogOpen(true)}
            disabled={!canSave}
            className={`
              px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1
              ${canSave
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            title="Save current composition"
          >
            <SaveIcon className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Compositions list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {loading ? (
          <CompositionSkeleton count={3} />
        ) : compositions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No compositions saved yet.
            <br />
            <span className="text-sm">Create and save your first melody!</span>
          </div>
        ) : (
          compositions.map((composition) => (
            <div
              key={composition.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {composition.name}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>{composition.noteCount} notes</span>
                  <span>{formatDuration(composition.duration)}</span>
                  <span>{formatDate(composition.modifiedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleLoad(composition.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Load composition"
                >
                  <LoadIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(composition.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete composition"
                >
                  <DeleteIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-[90%]">
            <h3 className="text-lg font-semibold mb-4">Save Composition</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter composition name..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  setSaveDialogOpen(false);
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className={`
                  px-4 py-2 rounded-lg transition-colors
                  ${saveName.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-[90%]">
            <h3 className="text-lg font-semibold mb-4">Delete Composition</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this composition? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </PageTransition>
    </LoadingOverlay>
  );
};
