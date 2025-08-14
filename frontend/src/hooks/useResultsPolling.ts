/*
================================================================================
File: src/hooks/useResultsPolling.ts
Description: A custom hook to periodically fetch the results of a
             calculation from MongoDB while a task is active.
================================================================================
*/
import { useState, useEffect } from 'react';

export const useResultsPolling = <T,>(
  isActive: boolean,
  fetchFn: () => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let isCancelled = false;
    const poll = async () => {
      if (isCancelled) return;
      try {
        const result = await fetchFn();
        if (!isCancelled) setData(result);
      } catch (error) {
        console.error("Failed to poll for results:", error);
      }
    };

    poll(); // Initial fetch
    const interval = setInterval(poll, 7000); // Poll every 7 seconds

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isActive, fetchFn]);

  return data;
};
