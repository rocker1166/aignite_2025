import { useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { SaveStatus } from './types';

/**
 * Creates a debounced save function with status management
 * @param onSave - The save function to call
 * @param setSaveStatus - Function to update save status
 * @param minimumDisplayTime - Minimum time to show "saved" status
 * @returns Debounced save function and refs for tracking
 */
export const createDebouncedSave = (
  onSave: (() => Promise<void>) | undefined,
  setSaveStatus: (status: SaveStatus) => void,
  minimumDisplayTime: number = 1000
) => {
  const isSaving = useRef(false);
  const lastSavedTime = useRef<number>(0);

  const debouncedSave = useCallback(
    debounce(async () => {
      if (isSaving.current || !onSave) return;
      
      try {
        isSaving.current = true;
        setSaveStatus('saving');
        await onSave();
        
        // Record the time when save completed
        const currentTime = Date.now();
        lastSavedTime.current = currentTime;
        
        // Show "saved" status with smooth transition
        setSaveStatus('saved');
        
        // After minimum display time, if no new changes, keep showing saved
        setTimeout(() => {
          // Only reset if this was the last save operation and we haven't had new changes
          if (lastSavedTime.current === currentTime) {
            // Keep showing saved status - don't flicker back and forth
          }
        }, minimumDisplayTime);
        
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('unsaved');
      } finally {
        isSaving.current = false;
      }
    }, 1500), // 1.5 second debounce
    [onSave, setSaveStatus, minimumDisplayTime]
  );

  return {
    debouncedSave,
    isSaving,
    lastSavedTime
  };
};

/**
 * Determines if the selected element is a node (vs edge)
 * @param selectedElement - The selected element
 * @returns true if element is a node, false if edge
 */
export const isNodeElement = (selectedElement: any): boolean => {
  return selectedElement && !('source' in selectedElement);
}; 