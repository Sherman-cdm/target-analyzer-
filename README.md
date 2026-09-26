# Target Analyzer

Analizador y auditor web en tiempo real. Permite inspeccionar un sitio a partir de su URL y obtener información de red, seguridad, tecnologías utilizadas, metadatos y una captura de pantalla generada por un bot automatizado.

## Características

- Análisis de DNS e información de red:
  - Dirección IP.
  - Registros A y AAAA.
  - Registros MX, NS y TXT.
- Auditoría SSL/TLS mediante conexión directa.
- Evaluación de cabeceras HTTP de seguridad y cálculo de una puntuación.
- Detección de tecnologías, CMS y servidores.
- Navegación automatizada con Puppeteer y Chromium headless.
- Captura de pantalla del sitio en formato JPEG/Base64.
- Extracción de metadatos HTML, incluyendo título, descripción, Open Graph y viewport.
- Interfaz web responsive con diseño dark tech.
- Soporte para análisis en modo escritorio o dispositivo móvil.
- Endpoint de health check para comprobar el estado del servicio.

## Tecnologías utilizadas

- **Frontend:** HTML5, CSS3 y JavaScript Vanilla ES6+.
- **Backend:** Node.js y Express.
- **Crawler y screenshots:** Puppeteer.
- **Comunicación:** API REST con respuestas JSON.
- **Middleware:** CORS y archivos estáticos de Express.

## Requisitos

- Node.js 18 o superior recomendado.
- npm.
- Conexión a Internet para analizar los sitios objetivo.
- Chromium, descargado automáticamente por Puppeteer durante la instalación cuando corresponda.

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/Sherman-cdm/target-analyzer-.git
cd target-analyzer-
npm install
```

## Uso

Inicia el servidor en modo normal:

```bash
npm start
```

Para desarrollo, utilizando el modo watch de Node.js:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

El puerto puede modificarse mediante la variable de entorno `PORT`:

```bash
PORT=8080 npm start
```

## API

### Health check

Comprueba que el backend se encuentre activo:

```http
GET /api/health
```

Ejemplo de respuesta:

```json
{
  "status": "online",
  "mode": "full-backend",
  "bot": "puppeteer-headless",
  "uptime": 42
}
```

### Analizar un sitio

Ejecuta un análisis completo:

```http
POST /api/analyze
Content-Type: application/json
```

Cuerpo de la solicitud:

```json
{
  "url": "https://example.com",
  "device": "desktop"
}
```

El campo `device` es opcional. Puedes utilizar `desktop` o el modo de dispositivo compatible configurado por el bot.

Ejemplo con cURL:

```bash
curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com","device":"desktop"}'
```

La respuesta incluye, entre otros datos:

- URL analizada y código de estado.
- Tiempo de respuesta.
- Información DNS y de red.
- Resultado de la auditoría SSL/TLS.
- Cabeceras de seguridad y puntuación.
- Tecnologías detectadas.
- Metadatos de la página.
- Captura de pantalla.
- Telemetría recopilada durante la navegación.

## Estructura del proyecto

```text
target-analyzer-/
├── public/
│   ├── index.html       # Interfaz principal
│   ├── styles.css       # Estilos, layouts y animaciones
│   └── app.js            # Lógica del cliente y renderizado
├── src/
│   ├── analyzers/
│   │   ├── dns.js       # Resolución de DNS e IP
│   │   ├── headers.js   # Auditoría de cabeceras HTTP
│   │   ├── ssl.js       # Auditoría SSL/TLS
│   │   └── tech.js      # Detección de tecnologías
│   ├── bot.js            # Crawler y capturas con Puppeteer
│   └── utils.js          # Utilidades y validación de URLs
├── server.js             # Servidor Express y API
├── package.json          # Scripts y dependencias
├── PROJECT_CONTEXT.md    # Contexto y especificaciones
└── README.md
```

## Seguridad y uso responsable

Utiliza esta herramienta únicamente sobre sitios propios o sobre objetivos para los que tengas autorización explícita. El análisis puede generar solicitudes HTTP, conexiones TLS, resolución DNS y navegación automatizada. No la uses para evadir controles, acceder a sistemas sin permiso o realizar pruebas intrusivas.

## Desarrollo

La rama `develop` se utiliza como entorno principal de desarrollo. Antes de integrar cambios en una rama estable, verifica el funcionamiento de:

- La interfaz web.
- El endpoint `/api/health`.
- El endpoint `/api/analyze` con URLs válidas e inválidas.
- La resolución DNS, auditoría SSL y análisis de cabeceras.
- La navegación de Puppeteer y generación de screenshots.

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](https://opensource.org/licenses/MIT).

## Autor

Sherman-cdm — [GitHub](https://github.com/Sherman-cdm)
