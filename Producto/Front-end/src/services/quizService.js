import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

export const quizService = {

  async generarQuiz(documentId) {
    const { data } = await api.post(ENDPOINTS.QUIZ.GENERATE(documentId));
    return data;
  },

  async getQuizzesPorDocumento(documentId) {
    const { data } = await api.get(ENDPOINTS.QUIZ.GET_BY_DOCUMENT(documentId));
    return data;
  },

  async getQuizPorId(quizId) {
    const { data } = await api.get(ENDPOINTS.QUIZ.GET_BY_ID(quizId));
    return data;
  },

  async eliminarQuiz(quizId) {
    await api.delete(ENDPOINTS.QUIZ.DELETE(quizId));
  },

  async getQuizzesPorUsuario(userId) {
    const { data } = await api.get(ENDPOINTS.QUIZ.GET_BY_USER(userId));
    return data;
  },
};
