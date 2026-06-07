import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

export const perfilService = {
  async getPerfil() {
    const { data } = await api.get(ENDPOINTS.PERFIL.GET);
    return data;
  },

  async updatePerfil(updates) {
    const { data } = await api.put(ENDPOINTS.PERFIL.UPDATE, updates);
    return data;
  },

  async getEstudiantes() {
    const { data } = await api.get(ENDPOINTS.PERFIL.ESTUDIANTES);
    return data;
  },
};
