import { get, post, put, del } from '../fetch.service';

export function fetchJobs(params) {
  return get('/jobs', { params });
}

export function fetchJob(id) {
  return get(`/jobs/${id}`);
}

export function createJob(payload) {
  return post('/jobs', payload);
}

export function updateJob(id, payload) {
  return put(`/jobs/${id}`, payload);
}

export function deleteJob(id) {
  return del(`/jobs/${id}`);
}
