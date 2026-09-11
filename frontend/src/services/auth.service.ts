
import { api } from './api';

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  preferences: string[];
}

export async function login(input: LoginInput) {
  return api.post('/auth/login', input);
}

export async function register(input: RegisterInput) {
  return api.post('/auth/register', input);
}

export async function getCurrentUser() {
  return api.get('/auth/me');
}

export async function logout() {
  return api.post('/auth/logout');
}

