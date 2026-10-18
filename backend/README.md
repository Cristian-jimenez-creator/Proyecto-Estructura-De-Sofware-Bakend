# Backend

API REST versionada en `/api/v1`, PostgreSQL y canal Socket.IO para actualizaciones del panel. El backend es el único componente que accede a la base de datos.

## Desarrollo local

Requiere Node.js 20+ y PostgreSQL 15+.

1. Crea una base de datos llamada `semaforos`.
2. Copia `.env.example` a `.env` y cambia secretos y credenciales.
3. Ejecuta `npm install`, `npm run db:init`, `npm run db:seed` y `npm start`.
4. La API queda en `http://localhost:8080`; `GET /health` comprueba API y base de datos.

El seed crea el administrador `admin@semaforos.local` con la clave definida en `ADMIN_PASSWORD` y un cruce demo con sensores A y B. Cambia esas credenciales antes de desplegar. `db:init` es idempotente para esta primera versión; conserva una copia de seguridad antes de modificar una base con datos.

## Despliegue

Despliega esta carpeta como un servicio Node/Docker y configura `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (32+ caracteres aleatorios), `DEVICE_API_KEY` (24+ caracteres aleatorios), `FRONTEND_ORIGIN`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` (12+ caracteres) en el servicio. Usa PostgreSQL administrado y TLS de la plataforma. Ejecuta `npm run db:init` y `npm run db:seed` una sola vez. Configura el health check en `/health`. No publiques `.env` ni incluyas claves en el frontend.

## Integración con la maqueta

El Arduino de la maqueta trabaja localmente y envía líneas seriales. Carga `hardware/arduino/traffic_demo.ino` después de verificar que los pines coincidan con tu cableado. En el computador conectado por USB al Arduino, instala dependencias del backend, copia `.env.example`, configura `SERIAL_PORT`, `API_URL`, `DEVICE_API_KEY`, `SENSOR_ID_A` y `SENSOR_ID_B`, y ejecuta `npm run bridge`. El puente lee los datos USB y los manda por HTTPS al backend alojado en la nube. Ajusta IDs según `/api/v1/sensors`.

El backend no puede leer directamente un puerto USB que está en tu casa o laboratorio. El puente local es ese enlace entre el hardware y la nube. Mantén en el controlador local un comportamiento seguro ante caída de red.

## Endpoints principales

- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `GET/POST/PATCH /api/v1/intersections`
- `GET/POST /api/v1/sensors`
- `POST /api/v1/telemetry/ingest` (clave de dispositivo en `X-Device-Key`)
- `GET/PATCH /api/v1/signals`
- `GET/POST/PATCH /api/v1/alerts`
- `GET/PATCH /api/v1/incidents`
- `GET /api/v1/dashboard`, `/reports/summary`, `/audit`

Errores usan `{ "error": { "code": "...", "message": "..." } }`. La API publica JSON y el panel recibe eventos `telemetry`, `alert` y `dashboard:refresh` por Socket.IO.
