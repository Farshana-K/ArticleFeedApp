export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  role: 'USER' | 'ADMIN';
  preferences: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface AuthResponse {
  user: User;
}