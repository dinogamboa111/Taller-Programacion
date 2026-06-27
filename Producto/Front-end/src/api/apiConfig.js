import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }

    if (error.response?.status === 429) {
      const friendly429 = new Error(
        '¡Ups! La IA está un poco saturada en este momento. ' +
        'Espera unos segundos y vuelve a intentarlo. 🤖💤'
      );
      friendly429.is429 = true;
      return Promise.reject(friendly429);
    }

    return Promise.reject(error);
  }
);

export default api;