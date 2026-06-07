import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  async login(username, password) {
    if (USE_MOCK) {
      if (username === 'usuario' && password === '123') {
        const mockUser = { name: 'Usuario Prueba', username };
        localStorage.setItem('auth_token', 'mock_token');
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        return mockUser;
      }
      throw new Error('Credenciales incorrectas');
    }

    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, { username, password });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data.user;
  },

  async logout() {
    if (!USE_MOCK) {
      try {
        await api.post(ENDPOINTS.AUTH.LOGOUT);
      } catch { /* ignorar errores de red al cerrar sesión */ }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  async getCurrentUser() {
    const { data } = await api.get(ENDPOINTS.AUTH.ME);
    return data;
  },

  getStoredUser() {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
