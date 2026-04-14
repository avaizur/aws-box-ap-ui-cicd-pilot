import { get, post, put, del } from '../fetch.service';

export function createInitiative(payload) {
  return post('/initiatives', payload);
}

export function getInitiative(id) {
  return get(`/initiatives/${id}`);
}

export function updateInitiative(id, payload) {
  return put(`/initiatives/${id}`, payload);
}

export function getAllInitiativeSummaries() {
  return get('/initiatives/summaries');
}

export function deleteInitiative(id) {
  return del(`/initiatives/${id}`);
}
