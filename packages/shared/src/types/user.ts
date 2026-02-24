export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string | null;
  role: UserRole;
  createdAt: string;
}

export enum UserRole {
  TRAVELER = 'TRAVELER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
