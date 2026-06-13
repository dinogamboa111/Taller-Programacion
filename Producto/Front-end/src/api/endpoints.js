export const ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    LOGOUT:   '/auth/logout',
    ME:       '/auth/me',
    REGISTER: '/users/register',
  },
  ACTIVIDADES: {
    UPLOAD:  '/actividades/upload',
    STATUS:  (id) => `/actividades/${id}/status`,
    RESUMEN: (id) => `/actividades/${id}/resumen`,
    TRIVIA:  (id) => `/actividades/${id}/trivia`,
    LIST:    '/actividades',
    DELETE:  (id) => `/actividades/${id}`,
  },
  PERFIL: {
    GET:         '/perfil',
    UPDATE:      (id) => `/users/profile/${id}`,
    ESTUDIANTES: '/perfil/estudiantes',
  },
  ESTADISTICAS: {
    GET:           '/estadisticas',
    BY_STUDENT:    (id) => `/estadisticas/estudiante/${id}`,
    SUBMIT_TRIVIA: '/estadisticas/trivia',
  },



  
// -- Documentos  ---
  DOCUMENTOS: {
    UPLOAD:       '/documents/upload',
    LIST_BY_USER: (userId) => `/documents/user/${userId}`,
    DELETE:       (id)     => `/documents/${id}`,
  },

  // -- Resumenes  --
  RESUMENES: {
    GENERATE: (documentId) => `/summary/generate/${documentId}`,
  },

};
