import { LoginCredentials } from '../types/auth';
const API_URL = process.env.NEXT_PUBLIC_LEMON_API_URL || '';

export class AuthService {
  static async sign_in(credentials: LoginCredentials): Promise<void> {
    const response = await fetch(`${API_URL}auth/sign_in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
