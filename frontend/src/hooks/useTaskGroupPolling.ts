import { useState, useEffect } from 'react';
import { getTaskGroupProgress } from '../services/co2Api';

export const useTaskGroupPolling = (
  groupId: string | null,
  onProgressUpdate: (progress: { completed: number, total: number }) => void,
  onSuccess: () => void
) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!groupId) {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    const interval = setInterval(async () => {
      try {
        const response = await getTaskGroupProgress(groupId);
        onProgressUpdate({ completed: response.completed || 0, total: response.total || 0 });

        if (response.status === 'COMPLETE') {
          clearInterval(interval);
          setIsActive(false);
          onSuccess();
        }
      } catch (error) {
        console.error("Failed to get task group progress:", error);
        clearInterval(interval);
        setIsActive(false);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [groupId, onProgressUpdate, onSuccess]);

  return isActive;
};
