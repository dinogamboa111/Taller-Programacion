import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

// Shapes esperadas del backend:
//
// Resumen: { fileName, summary }

export const resumenService = {

  // Llama a la IA del backend y devuelve { fileName, summary }
  // Params: documentId (number)
  async generarResumen(documentId) {
    const { data } = await api.get(ENDPOINTS.RESUMENES.GENERATE(documentId));
    return data;
  },
};