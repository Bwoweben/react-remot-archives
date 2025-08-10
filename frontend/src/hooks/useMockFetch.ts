import { useState, useEffect } from 'react';

export function useMockFetch<T>(
  apiCall: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiCall]); // Reruns when the apiCall function changes

  return { data, isLoading, error };
}
