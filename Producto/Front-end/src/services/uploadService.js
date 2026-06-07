import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

export const uploadService = {
  // Sube un archivo y devuelve { id, status, tipo }
  async uploadDocumento(file, tipo) {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('tipo', tipo); // 'resumen' | 'trivia'

    const { data } = await api.post(ENDPOINTS.ACTIVIDADES.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Consulta el estado del procesamiento: { status: 'processing' | 'ready' | 'error' }
  async getStatus(actividadId) {
    const { data } = await api.get(ENDPOINTS.ACTIVIDADES.STATUS(actividadId));
    return data;
  },

  // Devuelve la lista de materiales subidos por el tutor
  async getList() {
    const { data } = await api.get(ENDPOINTS.ACTIVIDADES.LIST);
    return data;
  },

  async deleteActividad(actividadId) {
    await api.delete(ENDPOINTS.ACTIVIDADES.DELETE(actividadId));
  },
};
