import { get, put } from '../fetch.service';

/**
 * GET /data-stores — getAllDataStores
 */
export function getAllDataStores() {
  return get('/data-stores');
}

/**
 * GET /data-stores/{id} — getDataStore
 */
export function getDataStore(id) {
  return get(`/data-stores/${id}`);
}

/**
 * GET /data-stores/name/{name} — getDataStoreByName
 */
export function getDataStoreByName(name) {
  const encoded = encodeURIComponent(String(name));
  return get(`/data-stores/name/${encoded}`);
}

/**
 * PUT /data-stores/name/{name} — updateDataStore
 */
export function updateDataStore(name, payload) {
  const encoded = encodeURIComponent(String(name));
  return put(`/data-stores/name/${encoded}`, payload);
}
