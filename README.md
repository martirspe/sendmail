# SendMail API

API portable en Node.js + Express + Nodemailer para envío de correos. Funciona en **cualquier dominio, subdominio o subdirectorio** — solo configura `.env`.

> Historial de cambios: [CHANGELOG.md](./CHANGELOG.md)

## Requisitos

- **Node.js 24.6.0** recomendado en local (ver `.nvmrc`)
- **Node.js 18+** en servidor (cPanel suele ofrecer 18, 20, 22 o 24)
- Servidor SMTP accesible

```bash
node -v   # local: v24.6.0 | servidor: 18+ aceptado
```

Con [nvm](https://github.com/nvm-sh/nvm): `nvm install` (lee `.nvmrc` automáticamente).

## Instalación rápida

```bash
npm install        # obligatorio — instala dotenv, express, etc.
npm run setup      # crea .env y genera API_KEY
# Edita .env con tus datos SMTP
npm start
```

Comprueba que responde:

```bash
curl http://localhost:8000/
curl http://localhost:8000/health
```

## Características

- Instalable en dominio, subdominio o subdirectorio
- Endpoint de info (`GET /`) con URLs activas de la API
- Autenticación por API key (`X-API-Key`)
- Validación de entrada, rate limiting, Helmet, logging con Pino
- CORS configurable (`*` o lista de orígenes)
- Compatible con proxy inverso (`TRUST_PROXY=true`)
- Health check, graceful shutdown, tests incluidos

## Configuración

Copia y edita el entorno:

```bash
cp .env.example .env
```

### Generar API_KEY en cPanel

cPanel **no muestra la salida** de `npm run generate:api-key`. Usa uno de estos métodos:

#### Método 1 — SSH / Terminal cPanel (recomendado)

```bash
cd ~/public_html/sendmail
node scripts/generate-api-key.js --write
```

Abre **`API-KEY.txt`** en el administrador de archivos si no ves salida en terminal.

#### Método 2 — Manual

1. En tu PC o terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```
2. Edita `.env` en el servidor: `API_KEY=la-clave-generada`

> **Elimina `API-KEY.txt`** del servidor después de copiar la clave. El log `generate-api-key.log` no guarda la clave por seguridad.

### Variables requeridas

| Variable | Descripción |
|----------|-------------|
| `EMAIL_HOST` | Servidor SMTP |
| `EMAIL_PORT` | Puerto SMTP (ej. `465`) |
| `EMAIL_SECURE` | `true` o `false` |
| `EMAIL_USER` | Usuario SMTP |
| `EMAIL_PASSWORD` | Contraseña SMTP |
| `API_KEY` | Clave para header `X-API-Key` |

### Variables de rutas (opcionales)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `API_PORT` | `8000` | Puerto local del servidor |
| `API_ROUTE` | `sendmail` | Nombre del endpoint de envío |
| `API_BASE_PATH` | *(vacío)* | Prefijo si la API vive en un subdirectorio |

### Otras variables opcionales

| Variable | Default | Descripción |
|----------|---------|-------------|
| `EMAIL_FROM` | `EMAIL_USER` | Remitente visible |
| `CORS_ORIGIN` | localhost | Orígenes permitidos, o `*` |
| `TRUST_PROXY` | `false` | `true` detrás de Apache/Nginx/cPanel |
| `RATE_LIMIT_MAX` | `30` | Peticiones por ventana |
| `BODY_LIMIT` | `100kb` | Tamaño máximo del body |

## Rutas según configuración

La API **no depende de un dominio**. Las URLs las define tu hosting + `.env`:

| `API_BASE_PATH` | `API_ROUTE` | Health | Enviar correo |
|-----------------|-------------|--------|---------------|
| *(vacío)* | `sendmail` | `/health` | `POST /sendmail` |
| `/api` | `sendmail` | `/api/health` | `POST /api/sendmail` |
| `/mail/v1` | `send` | `/mail/v1/health` | `POST /mail/v1/send` |

Ejemplos absolutos (mismo `.env`, distinto hosting):

```plaintext
https://api.tudominio.com/sendmail
https://tudominio.com/api/sendmail
https://correo.otrodominio.com/mail/v1/send
```

Al iniciar, `GET /` (o `GET /api/` si usas base path) devuelve las URLs activas:

```json
{
  "ok": true,
  "name": "sendmail",
  "version": "3.0.0",
  "endpoints": {
    "info": "http://localhost:8000/",
    "health": "http://localhost:8000/health",
    "sendmail": "http://localhost:8000/sendmail"
  }
}
```

## Uso

### Enviar correo

```http
POST /sendmail
Content-Type: application/json
X-API-Key: your-secret-api-key
```

```json
{
  "to": "destino@dominio.com",
  "subject": "Asunto",
  "html": "<p>Mensaje</p>",
  "bcc": "copia@dominio.com"
}
```

Respuesta exitosa (`200`):

```json
{ "ok": true, "messageId": "<id@smtp>" }
```

> El remitente (`from`) se toma de `EMAIL_FROM` o `EMAIL_USER`. No se acepta desde el body.

### Códigos de respuesta

| Código | Descripción |
|--------|-------------|
| `200` | Correo enviado |
| `400` | Datos inválidos |
| `401` | API key ausente o incorrecta |
| `404` | Ruta no encontrada |
| `429` | Rate limit excedido |
| `502` | Error SMTP |
| `503` | Health: SMTP desconectado |

## Escenarios de despliegue

### 1. Subdominio (raíz)

```plaintext
API_BASE_PATH=
API_ROUTE=sendmail
TRUST_PROXY=true
```

→ `https://api.tudominio.com/sendmail`

### 2. Subdirectorio

```plaintext
API_BASE_PATH=/api
API_ROUTE=sendmail
TRUST_PROXY=true
```

→ `https://tudominio.com/api/sendmail`

### 3. Frontend en un dominio, API en otro

- API en subdominio con CORS restringido al frontend
- O proxy en Apache/Nginx para no exponer la API key

Ver [examples/frontend-integration.md](./examples/frontend-integration.md) y [examples/apache-proxy.htaccess.example](./examples/apache-proxy.htaccess.example).

### 4. cPanel / Passenger

Orden correcto de despliegue:

1. Sube el proyecto a la carpeta de la app (ej. `public_html/sendmail`)
2. En **Setup Node.js App** selecciona la **versión de Node más alta disponible** (ideal 24.x; 18+ funciona)
3. **Run NPM Install** — obligatorio antes del primer arranque
4. Crea `.env` desde `.env.example` y configura SMTP + `API_KEY`
5. Asegura que exista `.htaccess` (cPanel lo completa al guardar la app)
6. **Setup Node.js App** → Application startup file: `app.js` → **Save** → **Restart**

#### Instalar dependencias (error `Cannot find module 'dotenv'`)

Ese error significa que **no se ejecutó `npm install`** en el servidor.

**Opción A — cPanel UI**

Setup Node.js App → tu aplicación → **Run NPM Install** → **Restart**

**Opción B — SSH**

```bash
cd ~/public_html/sendmail
npm install
npm start
```

Debe existir la carpeta `node_modules/` dentro de `public_html/sendmail/`. No subas `node_modules` desde tu PC; instálalo en el servidor.

#### Error al instalar módulos en cPanel

| Error | Solución |
|-------|----------|
| `EBADENGINE` / versión de Node | En cPanel elige Node **18, 20, 22 o 24** (la más alta). El proyecto acepta `>=18`. |
| `export: Group <email>` al instalar | Corrige `EMAIL_FROM` en `.env`: `'Nombre <email@dominio.com>'` |
| `Cannot find module` | Borra `node_modules` en el servidor → **Run NPM Install** → **Restart** |
| Instalación muy lenta o falla | Por SSH: `cd ~/public_html/sendmail && rm -rf node_modules && npm install --omit=dev` |

El archivo `.npmrc` del proyecto ya incluye `engine-strict=false` y `omit=dev` para cPanel.

**Checklist antes de Run NPM Install:**

```plaintext
☑ package.json y package-lock.json subidos
☑ .env con EMAIL_FROM en comillas simples (sin romper el shell)
☑ NO subir node_modules desde tu PC
☑ Node 18+ seleccionado en Setup Node.js App
```

Plantillas: [examples/cpanel-passenger.htaccess.example](./examples/cpanel-passenger.htaccess.example)

#### Formato de `EMAIL_FROM` en cPanel

Usar comillas **simples** envolviendo todo el valor:

```plaintext
EMAIL_FROM='Mi Empresa <correo@dominio.com>'
```

No usar: `EMAIL_FROM="Mi Empresa" <correo@dominio.com>` (rompe `npm` en shell).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run setup` | Crea `.env` y genera `API_KEY` |
| `npm start` | Inicia el servidor |
| `npm run dev` | Desarrollo con nodemon |
| `npm test` | Ejecuta tests |
| `npm run generate:api-key` | Regenera API key en `.env` |

### Integración con frontend

El frontend solo necesita configurar la **URL base de la API** en su entorno de build. No hay dominio fijo en el código del servidor.

```typescript
// environment.prod.ts (Angular u otro framework)
export const environment = {
  urlPost: 'https://api.tu-dominio.com',  // o '' si usas proxy en el mismo dominio
  apiRoute: 'sendmail',                    // debe coincidir con API_ROUTE
  apiKey: 'TU_API_KEY',
};
```

Ejemplos de `urlPost`:

| Despliegue | `urlPost` |
|------------|-----------|
| Subdominio | `https://api.cliente.com` |
| Subdirectorio | `https://cliente.com/api` |
| Proxy mismo dominio | `''` (postea a `/sendmail`) |

Ver [examples/frontend-integration.md](./examples/frontend-integration.md).

## Solución de problemas

### La API no responde (HTML 404 de Apache)

La app Node no está corriendo. Verifica Passenger/cPanel y reinicia la app.

### 401 Unauthorized

API key incorrecta o header `X-API-Key` ausente.

### 500 en proxy del frontend

1. Confirma que la API responde directamente: `curl https://tu-api/health`
2. Si el proxy apunta a HTTPS, incluye `SSLProxyEngine On` (ver ejemplo Apache)
3. Verifica que la API key del proxy coincida con `API_KEY` en `.env`

### Orden de diagnóstico

```plaintext
1. GET  {tu-api}/health        → JSON ok
2. POST {tu-api}/sendmail      → 200 o 502 (con X-API-Key)
3. POST {frontend}/sendmail    → solo si usas proxy
```

## Estructura

```plaintext
sendmail/
├── app.js
├── .env.example
├── examples/
│   ├── apache-proxy.htaccess.example
│   ├── cpanel-passenger.htaccess.example
│   └── frontend-integration.md
├── config/
├── controllers/
├── middlewares/
├── routes/
├── scripts/
├── services/
└── tests/
```

## Seguridad

- No subas `.env` al repositorio
- Usa `npm run generate:api-key` para claves seguras
- En producción, inyecta la API key desde el proxy, no desde el frontend
- Restringe `CORS_ORIGIN` a tus dominios (evita `*` en producción si es posible)

## Licencia

ISC
