import { createContext, useContext, useState, useEffect } from 'react';
import * as referenceValuesService from '../services/referenceValues.service';

const ReferenceValuesContext = createContext(null);

export function ReferenceValuesProvider({ children }) {
  const [referenceValues, setReferenceValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReferenceValues = async () => {
      try {
        setLoading(true);
        setError(null);
        const values = await referenceValuesService.fetchAllReferenceValues();
        setReferenceValues(values || []);
      } catch (err) {
        console.error('Failed to load reference values:', err);
        setError(err.message);
        setReferenceValues([]);
      } finally {
        setLoading(false);
      }
    };

    loadReferenceValues();
  }, []);

  /**
   * Get reference values by domain key
   * @param {string} key - The domain key (e.g., 'jobs.status', 'bikes.wheel_size')
   * @returns {Array<{key: string, code: string, description: string}>} Array of reference values for the key
   */
  const getValuesByKey = (key) => {
    return referenceValues.filter((value) => value.key === key);
  };
  
  /**
   * Get a reference value description by key and code
   * @param {string} key - The domain key
   * @param {string} code - The reference code
   * @returns {string|null} The description or null if not found
   */
  const getDescription = (key, code) => {
    const value = referenceValues.find(
      (v) => v.key === key && v.code === code
    );
    return value?.description || null;
  };

  const value = {
    referenceValues,
    loading,
    error,
    getValuesByKey,
    getDescription,
  };

  return (
    <ReferenceValuesContext.Provider value={value}>
      {children}
    </ReferenceValuesContext.Provider>
  );
}

export function useReferenceValues() {
  const context = useContext(ReferenceValuesContext);
  if (!context) {
    throw new Error(
      'useReferenceValues must be used within a ReferenceValuesProvider'
    );
  }
  return context;
}

