import { useEffect, useRef, useCallback } from 'react';

export const useAutoSave = ({ data, enabled, onSave, interval = 30000 }) => {
  const saveTimerRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  const saveData = useCallback(async () => {
    if (!enabled) return;
    
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedDataRef.current) {
      return;
    }

    try {
      await onSave(data);
      lastSavedDataRef.current = dataString;
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [data, enabled, onSave]);

  useEffect(() => {
    if (enabled) {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      saveTimerRef.current = setInterval(() => {
        saveData();
      }, interval);
    }

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [enabled, saveData, interval]);

  return { saveData };
};
