
import { api } from './api';

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export async function getProfile() {
  return api.get('/users/profile');
}

export async function updateProfile(input: UpdateProfileInput) {
  return api.put('/users/profile', input);
}

export async function changePassword(input: ChangePasswordInput) {
  return api.put('/users/password', input);
}

export async function updatePreferences(preferences: string[]) {
  return api.put('/users/preferences', { preferences });
}

