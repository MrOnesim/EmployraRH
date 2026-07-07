import { createAuthClient } from 'better-auth/client';
import type { Employee, Company } from '../types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const authClient = createAuthClient({
  baseURL,
});

export interface AuthProfile {
  user: Employee;
  company: Company;
}

export async function login(credentials: { email: string; password: string }): Promise<{ user: Employee; company: Company }> {
  const { data } = await authClient.signIn.email(credentials);
  if (!data) throw new Error('Login failed');
  return data as unknown as { user: Employee; company: Company };
}

export async function signUp(data: { email: string; password: string; name: string }) {
  return authClient.signUp.email(data);
}

export async function logout(): Promise<void> {
  await authClient.signOut();
}

export async function getSession() {
  const { data } = await authClient.getSession();
  return data;
}

export async function getProfile(): Promise<AuthProfile> {
  const session = await getSession();
  if (!session?.user) throw new Error('Not authenticated');
  return session as unknown as AuthProfile;
}
