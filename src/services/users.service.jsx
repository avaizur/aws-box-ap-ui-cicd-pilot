import { get, post, put, del } from '../fetch.service';

export function fetchUsers(params) {
  return get('/users', { params });
}

export function fetchUser(id) {
  return get(`/users/${id}`);
}

export function createUser(payload) {
  return post('/users', payload);
}

export function updateUser(id, payload) {
  return put(`/users/${id}`, payload);
}

export function deleteUser(id) {
  return del(`/users/${id}`);
}










