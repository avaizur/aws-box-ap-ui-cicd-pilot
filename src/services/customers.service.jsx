import { get, post, put, del } from '../fetch.service';

export function fetchCustomers(params) {
  return get('/customers', { params });
}

export function fetchCustomer(id) {
  return get(`/customers/${id}`);
}

export function createCustomer(payload) {
  return post('/customers', payload);
}

export function updateCustomer(id, payload) {
  return put(`/customers/${id}`, payload);
}

export function deleteCustomer(id) {
  return del(`/customers/${id}`);
}
