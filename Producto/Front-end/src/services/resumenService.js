import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

export const resumenService = {

  async getResumenPorDocumento(documentId) {
    const { data } = await api.get(ENDPOINTS.RESUMENES.GET_BY_DOCUMENT(documentId));
    return data;
  },

  async generarResumen(documentId) {
    const { data } = await api.get(ENDPOINTS.RESUMENES.GENERATE(documentId));
    return data;
  },

  async eliminarResumen(documentId) {
    await api.delete(ENDPOINTS.RESUMENES.DELETE_BY_DOCUMENT(documentId));
  },
};
