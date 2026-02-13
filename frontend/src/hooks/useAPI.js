import { useState, useCallback } from 'react';
import { showToast } from '../utils/toast';

/**
 * Custom hook for API calls with centralized error handling, loading states, and toast notifications
 * @param {Function} apiFn - The API function to call (from utils/api.js)
 * @param {Object} options - Configuration options
 * @param {boolean} options.showSuccessToast - Show success toast (default: false)
 * @param {boolean} options.showErrorToast - Show error toast (default: true)
 * @param {string} options.successMessage - Custom success message
 * @param {number} options.timeout - Request timeout in ms (default: 30000)
 */
export function useAPI(apiFn, options = {}) {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Success!',
    timeout = 30000
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    );

    try {
      // Race between API call and timeout
      const result = await Promise.race([
        apiFn(...args),
        timeoutPromise
      ]);

      if (result.success) {
        setData(result.data);
        if (showSuccessToast) {
          showToast.success(successMessage);
        }
        return { success: true, data: result.data };
      } else {
        const errorMsg = result.message || 'An error occurred';
        setError(errorMsg);
        if (showErrorToast) {
          showToast.error(errorMsg);
        }
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message === 'Request timeout' 
        ? 'Request timed out. Please try again.' 
        : err.message || 'Network error occurred';
      
      setError(errorMsg);
      if (showErrorToast) {
        showToast.error(errorMsg);
      }
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [apiFn, showSuccessToast, showErrorToast, successMessage, timeout]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset
  };
}

/**
 * Hook for fetching data on mount with automatic error handling
 * @param {Function} apiFn - The API function to call
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 */
export function useFetch(apiFn, autoFetch = true) {
  const { execute, loading, error, data } = useAPI(apiFn, { showErrorToast: true });

  useState(() => {
    if (autoFetch) {
      execute();
    }
  }, []);

  return { loading, error, data, refetch: execute };
}

export default useAPI;
