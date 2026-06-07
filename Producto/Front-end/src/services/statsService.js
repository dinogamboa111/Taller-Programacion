import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

export const statsService = {
  async getEstadisticas() {
    const { data } = await api.get(ENDPOINTS.ESTADISTICAS.GET);
    return data;
  },

  async getEstadisticasPorEstudiante(estudianteId) {
    const { data } = await api.get(ENDPOINTS.ESTADISTICAS.BY_STUDENT(estudianteId));
    return data;
  },
};
