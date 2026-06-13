import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      if (email === 'usuario' && password === '123') {
        const mockUser = { id: 1, firstName: 'Usuario', lastName: 'Prueba', email };
        localStorage.setItem('auth_token', 'mock_token');
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        return mockUser;
      }
      throw new Error('Credenciales incorrectas');
    }

    // Llamada al backend de Spring Boot (Endpoint 1)
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    
    // Mapeamos los datos exactos que nos devuelve el AuthController
    const userObj = {
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName
    };

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(userObj));
    return userObj;
  },

  async register(firstName, lastName, email, password) {
    // Llamada al backend de Spring Boot (Endpoint 2)
    const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, { 
      firstName, 
      lastName, 
      email, 
      password 
    });
    return data;
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