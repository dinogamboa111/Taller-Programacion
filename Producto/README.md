# Kydira

Plataforma educativa inteligente para niños. Permite subir documentos PDF, generar resúmenes y quizzes automáticos usando inteligencia artificial (Google Gemini), y llevar un seguimiento del aprendizaje.

---

## Tecnologías

### Backend
| Tecnología | Versión |
|------------|---------|
| Java | 17 |
| Spring Boot | 3.2.5 |
| Spring Security + JWT | JJWT 0.11.5 |
| Spring Data JPA | — |
| PostgreSQL (Supabase) | — |
| Apache PDFBox | 3.0.1 |
| Apache POI | 5.2.5 |
| Google Gemini API | — |
| Springdoc OpenAPI (Swagger) | 2.5.0 |
| Maven | 3.x |

### Frontend
| Tecnología | Versión |
|------------|---------|
| React | 19 |
| Vite | 8 |
| React Router DOM | 7 |
| Axios | 1.17 |
| Bootstrap + React Bootstrap | 5.3 |
| Framer Motion | 12 |

---

## Requisitos previos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- **Java 17** o superior → verificar con `java -version`
- **Node.js 18** o superior → verificar con `node -v`
- **npm** → verificar con `npm -v`
- Acceso a internet (para conectar con Supabase y Google Gemini API)

---

## Estructura del proyecto

```
Producto/
├── Back-end/
│   └── kydira-api/
│       └── kydira-api/          ← proyecto Maven (aquí se ejecutan los comandos)
│           ├── src/
│           │   ├── main/java/com/kydira_api/
│           │   │   ├── controller/      ← endpoints REST
│           │   │   ├── service/impl/    ← lógica de negocio
│           │   │   ├── model/           ← entidades JPA
│           │   │   ├── repository/      ← acceso a BD
│           │   │   ├── security/        ← JWT + Spring Security
│           │   │   ├── dto/             ← objetos de transferencia
│           │   │   ├── config/          ← configuración CORS, Gemini
│           │   │   └── exception/       ← manejo global de errores
│           │   └── main/resources/
│           │       └── application.properties
│           ├── .env.template            ← plantilla de variables de entorno
│           ├── pom.xml
│           └── mvnw.cmd
│
├── Front-end/                   ← proyecto Vite + React (aquí se ejecutan los comandos)
│   ├── src/
│   │   ├── services/            ← llamadas a la API (Axios)
│   │   ├── context/             ← contextos globales (tema, intensidad visual)
│   │   ├── hooks/               ← hooks personalizados
│   │   └── assets/              ← imágenes y recursos estáticos
│   ├── .env.example             ← plantilla de variables de entorno
│   ├── package.json
│   └── vite.config.js
│
├── README.md                    ← este archivo
└── testingResultados.md         ← informe completo de pruebas
```

---

## Configuración de variables de entorno

### Backend

1. Ve a la carpeta `Back-end/kydira-api/kydira-api/`
2. Copia el archivo `.env.template` y renómbralo `.env`
3. Completa los valores con tus credenciales de Supabase:

```env
DB_HOST=your-supabase-db-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-db-password
```

> Las credenciales de Supabase se encuentran en tu proyecto bajo **Settings → Database → Connection Info**.

> La clave de Google Gemini (`gemini.api.key`) y la clave JWT (`jwt.secret`) se configuran en `src/main/resources/application.properties`.

### Frontend

1. Ve a la carpeta `Front-end/`
2. Copia el archivo `.env.example` y renómbralo `.env`
3. Ajusta la URL del backend si es necesario:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=false
```

---

## Cómo ejecutar el proyecto

### 1. Ejecutar el Backend

Abre una terminal y navega a la carpeta del backend:

```
cd "Back-end/kydira-api/kydira-api"
```

**Compilar y ejecutar:**

```
np
```

> En Linux/Mac: `./mvnw spring-boot:run`

El servidor arranca en **http://localhost:8080**

Verás en la consola cuando esté listo:
```
Started KydiraApiApplication in X.XXX seconds
```

**Documentación interactiva de la API (Swagger UI):**
```
http://localhost:8080/swagger-ui/index.html
```

---

### 2. Ejecutar el Frontend

Abre **otra terminal** (deja el backend corriendo) y navega a la carpeta del frontend:

```
cd "Front-end"
```

**Instalar dependencias** (solo la primera vez):

```
npm install
```

**Ejecutar en modo desarrollo:**

```
npm run dev
```

La aplicación estará disponible en **http://localhost:5173**

---

### Resumen de puertos

| Servicio | URL | Puerto |
|----------|-----|--------|
| Backend (API REST) | http://localhost:8080 | 8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html | 8080 |
| Frontend (React) | http://localhost:5173 | 5173 |

---

## Endpoints principales de la API

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login — retorna token JWT | No |
| POST | `/api/users/register` | Registro de nuevo usuario | No |
| PUT | `/api/users/profile/{id}` | Actualizar perfil | Sí |
| DELETE | `/api/users/{id}` | Eliminar cuenta | Sí |
| POST | `/api/documents/upload` | Subir documento PDF | Sí |
| GET | `/api/documents/user/{userId}` | Listar documentos del usuario | Sí |
| DELETE | `/api/documents/{id}` | Eliminar documento | Sí |
| POST | `/api/quiz/generate/{documentId}` | Generar quiz con IA | Sí |
| GET | `/api/quiz/{id}` | Obtener quiz por ID | Sí |
| GET | `/api/quiz/user/{userId}` | Listar quizzes del usuario | Sí |
| DELETE | `/api/quiz/{id}` | Eliminar quiz | Sí |
| GET | `/api/summary/generate/{documentId}` | Generar resumen con IA | Sí |
| GET | `/api/summary/document/{documentId}` | Obtener resumen | Sí |
| DELETE | `/api/summary/document/{documentId}` | Eliminar resumen | Sí |

> Los endpoints con **Auth: Sí** requieren el header:
> `Authorization: Bearer <token>`

---

## Comandos útiles

### Backend

| Acción | Comando |
|--------|---------|
| Ejecutar el servidor | `mvnw.cmd spring-boot:run` |
| Compilar sin ejecutar | `mvnw.cmd compile` |
| Ejecutar todas las pruebas | `mvnw.cmd test` |
| Verificar cobertura 85% | `mvnw.cmd verify` |
| Generar reporte de cobertura | `mvnw.cmd test jacoco:report` |
| Ver reporte de cobertura | Abrir `target/site/jacoco/index.html` |

### Frontend

| Acción | Comando |
|--------|---------|
| Ejecutar en desarrollo | `npm run dev` |
| Compilar para producción | `npm run build` |
| Vista previa del build | `npm run preview` |
| Revisar errores de código | `npm run lint` |

---

## Pruebas

El proyecto cuenta con una suite de **72 pruebas automatizadas** con **90% de cobertura de código**.

Para ejecutarlas:

```
cd "Back-end/kydira-api/kydira-api"
mvnw.cmd verify
```

Resultado esperado:
```
Tests run: 72, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Ver el informe completo de pruebas en [testingResultados.md](testingResultados.md).

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Camila Ericsson | Desarrolladora |
| Dino Gamboa | Desarrollador |

---

*Kydira — Taller de Programación | 2026*
