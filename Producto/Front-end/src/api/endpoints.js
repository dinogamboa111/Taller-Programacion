export const ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    LOGOUT:   '/auth/logout',
    ME:       '/auth/me',
    REGISTER: '/users/register',
  },
  DOCUMENTOS: {
    UPLOAD:       '/documents/upload',
    LIST_BY_USER: (userId)     => `/documents/user/${userId}`,
    DELETE:       (documentId) => `/documents/${documentId}`,
  },
  RESUMENES: {
    GENERATE:           (documentId) => `/summary/generate/${documentId}`,
    GET_BY_DOCUMENT:    (documentId) => `/summary/document/${documentId}`,
    DELETE_BY_DOCUMENT: (documentId) => `/summary/document/${documentId}`,
  },
  QUIZ: {
    GENERATE:        (documentId) => `/quiz/generate/${documentId}`,
    GET_BY_ID:       (quizId)     => `/quiz/${quizId}`,
    GET_BY_DOCUMENT: (documentId) => `/quiz/document/${documentId}`,
    GET_BY_USER:     (userId)     => `/quiz/user/${userId}`,
    DELETE:          (quizId)     => `/quiz/${quizId}`,
  },
  PERFIL: {
    UPDATE: (id) => `/users/profile/${id}`,
    DELETE: (id) => `/users/${id}`,
  },
};