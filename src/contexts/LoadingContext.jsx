import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => {
      const newStates = { ...prev, [key]: isLoading };
      // Update global loading state if any loading is active
      const hasAnyLoading = Object.values(newStates).some(state => state);
      setGlobalLoading(hasAnyLoading);
      return newStates;
    });
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const clearLoading = useCallback((key) => {
    setLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      const hasAnyLoading = Object.values(newStates).some(state => state);
      setGlobalLoading(hasAnyLoading);
      return newStates;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
    setGlobalLoading(false);
  }, []);

  const value = {
    loadingStates,
    globalLoading,
    setLoading,
    isLoading,
    clearLoading,
    clearAllLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
