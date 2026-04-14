import { get } from '../fetch.service';

/**
 * Get all reference domains
 * @returns {Promise<string[]>} Array of domain keys (e.g., ['bikes.wheel_size', 'jobs.status'])
 */
export function fetchAllDomains() {
  return get('/reference-values/domains');
}

/**
 * Get reference values by key (domain)
 * @param {string} key - The domain key (e.g., 'jobs.status', 'bikes.wheel_size')
 * @returns {Promise<Array<{key: string, code: string, description: string}>>} Array of reference values
 */
export function fetchReferenceValuesByKey(key) {
  return get(`/reference-values/key/${key}`);
}

/**
 * Get all reference values
 * @returns {Promise<Array<{key: string, code: string, description: string}>>} Array of all reference values
 */
export function fetchAllReferenceValues() {
  return get('/reference-values');
}

