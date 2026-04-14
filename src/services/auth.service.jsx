import { post } from '../fetch.service';

export function login(email, password) {
  const response = post('/auth/login', { email, password });
  console.log('login response', response);
  return response;
//  return post('/auth/login', { email, password });
}

export function createAccount(email, password, confirmPassword, displayName, role) {
  return post('/auth/register', { email, password, confirmPassword, displayName, role });
}

export function forgotPassword(email) {
  return post('/auth/forgot-password', { email });
}
