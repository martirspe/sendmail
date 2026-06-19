# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [3.0.3] - 2026-06-19

### Corregido

- Instalación en cPanel: `engines` relajado a `>=18.0.0` (24.6.0 sigue recomendado en local).
- Añadido `.npmrc` con `engine-strict=false` y `omit=dev` para evitar fallos en Run NPM Install.
- Guía de errores comunes al instalar módulos en cPanel.

## [3.0.2] - 2026-06-19

### Cambiado

- Requisito de Node.js actualizado a **24.6.0** (`engines` en package.json, `.nvmrc`, `.node-version`).
- Documentación cPanel actualizada para Node 24.

## [3.0.1] - 2026-06-19

### Seguridad

- Comparación de API key con `crypto.timingSafeEqual`.
- La clave ya no se escribe en `generate-api-key.log`.
- `API-KEY.txt` se crea con permisos `0600`.
- Bloqueo web de `.env`, `API-KEY.txt` y logs en `.htaccess`.
- Manejo de JSON inválido retorna `400` en lugar de `500`.
- Actualización de dependencias: Express (audit fix), Nodemailer 9.x.

### Corregido

- Referencias a scripts PHP inexistentes eliminadas del README.
- `pino-pretty` movido a devDependencies.

## [3.0.0] - 2026-06-18

API portable: sin acoplamiento a dominio, subdominio o cliente específico.

### Añadido

- `API_BASE_PATH` para desplegar en subdirectorios (ej. `/api/sendmail`).
- `GET /` (o `GET {API_BASE_PATH}/`) devuelve info de la API con URLs activas.
- `CORS_ORIGIN=*` para permitir cualquier origen.
- `TRUST_PROXY` para despliegue detrás de proxy inverso.
- Script `npm run setup` (crea `.env` + genera API key).
- Carpeta `examples/` con plantillas genéricas (Apache, cPanel, integración frontend).

### Cambiado

- `API_ROUTE` ahora es opcional (default: `sendmail`).
- Documentación reescrita sin referencias a HTG ni dominios fijos.
- `.env.example` y plantillas `.htaccess` genéricas y reutilizables.

### Eliminado

- Referencias hardcodeadas a `htg.com.pe`, `api.htg.com.pe` y rutas de cPanel específicas del README principal.

## [2.0.4] - 2026-06-18

### Cambiado

- Guía de solución de problemas para error `500` en `POST htg.com.pe/sendmail`.
- Ejemplo de proxy Apache actualizado con `SSLProxyEngine On` y `RequestHeader` condicional (`env=PROXY_SENDMAIL`).

## [2.0.3] - 2026-06-18

### Añadido

- Archivo `.htaccess` requerido por cPanel en `public_html/api/` para Setup Node.js App.
- Plantilla `.htaccess.example` con configuración Passenger de referencia.
- Guía de despliegue cPanel ampliada en README (checklist de archivos en servidor).

## [2.0.2] - 2026-06-18

### Corregido

- Documentación de `EMAIL_FROM` corregida para cPanel: usar comillas simples envolviendo todo el valor (`'Nombre <email@dominio.com>'`). El formato `"Nombre" <email>` provoca error `export: 'Group <admin@htg.com.pe>': not a valid identifier` al ejecutar `npm` en entornos que cargan `.env` con shell.

## [2.0.1] - 2026-06-18

### Cambiado

- Documentación actualizada con la URL de producción `https://api.htg.com.pe`.
- README alineado con la arquitectura real: frontend en `htg.com.pe` → proxy Apache → API en `api.htg.com.pe`.

## [2.0.0] - 2026-06-18

Refactorización completa orientada a seguridad, robustez e integración con el frontend **htg-main**.

### Añadido

- Autenticación por API key mediante header `X-API-Key`.
- Validación de entrada con `express-validator` (`to`, `subject`, `html`, `bcc`, `cc`).
- Servicio SMTP singleton (`services/email.service.js`) con verificación al arrancar.
- Validación de variables de entorno al inicio (`config/env.js`).
- Endpoint `GET /health` para monitoreo de estado y conexión SMTP.
- Rate limiting configurable en `POST /sendmail`.
- Headers de seguridad con Helmet.
- CORS restrictivo configurable con `CORS_ORIGIN`.
- Logging estructurado con Pino y `pino-http`.
- Middleware global de errores y respuesta 404 para rutas desconocidas.
- Graceful shutdown ante señales `SIGTERM` y `SIGINT`.
- Tests con Jest y Supertest (`tests/email.test.js`).
- Script `npm run generate:api-key` para generar y guardar API keys seguras.
- Archivo `.env.example` como plantilla de configuración.
- Documentación de integración con **htg-main** en `README.md`.

### Cambiado

- El controlador ahora responde siempre con JSON y códigos HTTP apropiados (`200`, `400`, `401`, `404`, `502`, `503`).
- El remitente (`from`) se obtiene de `EMAIL_FROM` o `EMAIL_USER`; ya no se acepta desde el body.
- `EMAIL_PORT` y `EMAIL_SECURE` se parsean correctamente como número y booleano.
- Se eliminó la dependencia de `body-parser`; se usa el parser integrado de Express.
- CORS por defecto incluye `localhost:4200` (Angular dev server) además de `localhost:3000`.
- Estructura del proyecto reorganizada en capas (`config`, `services`, `middlewares`, `controllers`, `routes`, `scripts`, `tests`).

### Corregido

- La API no respondía al cliente tras enviar el correo (peticiones quedaban colgadas).
- Errores SMTP solo se registraban en consola sin feedback al cliente.
- Se creaba un transport SMTP nuevo en cada petición.
- El campo `bcc` podía enviarse como la cadena `"undefined"` si no venía en el body.
- `.env` no estaba excluido del control de versiones.

### Seguridad

- Protección contra relay abierto mediante API key obligatoria.
- Prevención de suplantación de remitente (`from` controlado por el servidor).
- Límite de tamaño del body configurable (`BODY_LIMIT`).
- `.env` añadido a `.gitignore`.

### Eliminado

- Campo `from` como parámetro aceptado del cliente.
- Dependencia `body-parser`.

### Integración con htg-main

Cambios coordinados en el frontend (`D:\ALKACORP\CLIENTES\HTG\htg-main`) para compatibilidad con esta versión:

- Actualización de `EmailInterface` → `EmailPayload` / `EmailResponse`.
- Eliminación del campo `from` en el payload del formulario de cotización.
- Envío del header `X-API-Key` en desarrollo local (`environment.apiKey`).
- Manejo de respuestas `{ ok: true | false }` y estados de carga/error en UI.
- Configuración de proxy Apache (`.htaccess`) para inyectar `X-API-Key` en producción sin exponerla en el bundle.

### Breaking changes

| Antes (v1) | Ahora (v2) |
|------------|------------|
| Sin autenticación | Header `X-API-Key` obligatorio |
| `from` en el body | `from` definido en `.env` (`EMAIL_FROM`) |
| Sin respuesta HTTP consistente | Respuestas JSON con campo `ok` |
| Sin validación de campos | Campos inválidos retornan `400` |

---

## [1.0.0] - 2024

Versión inicial.

### Añadido

- API básica con Express y Nodemailer.
- Ruta `POST /sendmail` para envío de correos.
- Configuración SMTP mediante variables de entorno.
- Servidor estático en `public/`.
