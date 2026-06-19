# Ejemplo: frontend en un dominio, API en otro

Este patrón evita exponer la API key en el bundle del frontend.

## Escenario

| Componente | URL |
|------------|-----|
| Frontend | `https://misitio.com` |
| API | `https://api.misitio.com/sendmail` |

## API (.env)

```plaintext
API_ROUTE=sendmail
API_BASE_PATH=
CORS_ORIGIN=https://misitio.com,https://www.misitio.com
TRUST_PROXY=true
```

## Frontend

Postear a la ruta local (mismo origen):

```javascript
const API_URL = '/sendmail'; // proxy en el mismo dominio

fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to, subject, html, bcc }),
});
```

## Apache en el frontend

Ver `examples/apache-proxy.htaccess.example` y reemplazar:

- `FRONTEND_PATH` → `sendmail`
- `API_URL` → `https://api.misitio.com/sendmail`

## API en subdirectorio

Si la API vive en `https://misitio.com/api/sendmail`:

```plaintext
API_BASE_PATH=/api
API_ROUTE=sendmail
```

Endpoints resultantes:

- `GET https://misitio.com/api/` — info
- `GET https://misitio.com/api/health`
- `POST https://misitio.com/api/sendmail`

## Mismo dominio (cPanel, carpeta `api` en disco)

La **carpeta en el servidor** no siempre coincide con la **URL pública**. Comprueba dónde responde `/health`:

| Si funciona… | `urlPost` en el frontend |
|--------------|--------------------------|
| `https://tudominio.com/health` | `https://tudominio.com` |
| `https://tudominio.com/api/health` | `https://tudominio.com/api` |

En `.env` de la API, `API_BASE_PATH` debe estar vacío si Passenger expone la app en la raíz (aunque los archivos estén en `public_html/api`).
