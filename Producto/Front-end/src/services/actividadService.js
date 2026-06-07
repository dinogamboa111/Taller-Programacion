import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

// Shapes esperadas del backend:
//
// Resumen: { title, readTime, tags: string[], highlights: string[],
//            sections: [{ heading, emoji, body }] }
//
// Trivia:  { title, questions: [{ id, text, options: string[],
//            correct: number, explanation }] }

export const actividadService = {
  async getResumen(actividadId) {
    const { data } = await api.get(ENDPOINTS.ACTIVIDADES.RESUMEN(actividadId));
    return data;
  },

  async getTrivia(actividadId) {
    const { data } = await api.get(ENDPOINTS.ACTIVIDADES.TRIVIA(actividadId));
    return data;
  },

  // Registra el resultado de una sesión de trivia
  async submitTrivia(actividadId, respuestas, puntaje) {
    const { data } = await api.post(ENDPOINTS.ESTADISTICAS.SUBMIT_TRIVIA, {
      actividadId,
      respuestas,
      puntaje,
    });
    return data;
  },
};
