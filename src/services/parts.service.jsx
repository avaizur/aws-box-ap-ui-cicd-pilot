import { get, post, put, del } from '../fetch.service';

export function fetchParts(params) {
  return get('/parts', { params });
}

export function fetchPart(id) {
  return get(`/parts/${id}`);
}

export function createPart(payload) {
  return post('/parts', payload);
}

export function updatePart(id, payload) {
  return put(`/parts/${id}`, payload);
}

export function deletePart(id) {
  return del(`/parts/${id}`);
}










