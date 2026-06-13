import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

// Shapes esperadas del backend:
//
// Document: { documentId, fileName, fileType: { fileTypeId, typeName },
//             rawContent, uploadDate, userId }

export const documentoService = {

  // Sube un archivo PDF o DOCX y devuelve el Document guardado
  // Params: file (File), userId (number)
  async uploadDocumento(file, userId) {
    const formData = new FormData();
    formData.append('file',   file);
    formData.append('userId', userId);

    const { data } = await api.post(ENDPOINTS.DOCUMENTOS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Devuelve la lista de documentos del usuario autenticado
  // Params: userId (number)
  async getDocumentosByUsuario(userId) {
    const { data } = await api.get(ENDPOINTS.DOCUMENTOS.LIST_BY_USER(userId));
    return data;
  },

  // Elimina un documento por su ID (y sus quizzes en cascada)
  // Params: documentId (number)
  async deleteDocumento(documentId) {
    await api.delete(ENDPOINTS.DOCUMENTOS.DELETE(documentId));
  },
};