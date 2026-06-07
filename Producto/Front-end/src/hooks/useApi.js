import { useState, useCallback } from 'react';

// Uso: const { data, loading, error, execute } = useApi(authService.login);
export function useApi(serviceFn) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error inesperado';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serviceFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
