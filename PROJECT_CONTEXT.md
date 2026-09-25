# Target Analyzer — Contexto y Especificaciones del Proyecto

> Documento de alineación técnica para desarrolladores y agentes de IA.

## 1. Visión y Propósito
Aplicación web para analizar sitios web a través de una URL. Proporciona diagnóstico de red, seguridad, tecnologías detectadas y captura de pantalla (screenshot) obtenida por un bot automatizado.

## 2. Tecnologías y Stack
- **Frontend:** HTML5, CSS3 moderno (diseño dark tech / responsive), JavaScript Vanilla ES6+.
- **Backend:** Node.js, Express.
- **Bot / Crawler:** Puppeteer (Headless Chrome) para navegación, recolección de metadatos y generación de screenshots.
- **Módulos de Auditoría:** DNS/IP lookup, inspección SSL/TLS, auditor de cabeceras HTTP de seguridad, analizador de firmas tecnológicas.

## 3. Estrategia Git y Flujo de Trabajo
- **Rama principal de desarrollo:** `develop` (Todo el trabajo y nuevos PRs se dirigen a `develop`).
- **Rama de producción:** `main`.

## 4. Hoja de Ruta
- [x] **Fase 1 (Frontend):** Construcción del Frontend moderno:
  - Estructura HTML (`public/index.html`).
  - Estilos CSS con diseño moderno, componentes glassmorphism, responsive grid y animaciones (`public/styles.css`).
  - Lógica JavaScript para manejo de eventos, validaciones, estados de carga y renderizado de resultados (`public/app.js`).
  - Vista previa de screenshot con modal de ampliación.
- [ ] **Fase 2:** Backend en Node.js (`server.js`):
  - API endpoint `POST /api/analyze`.
  - Integración del Bot Puppeteer para capturas de pantalla de alta resolución.
  - Resolución de DNS / IP y geolocalización básica.
  - Auditoría de certificados SSL y cabeceras de seguridad.
  - Detección de tecnologías frontend, CMS y servidor.
- [ ] **Fase 3:** Conexión end-to-end, pruebas y refinamientos.

## 5. Estructura de Directorios Recomendada
```
target-analyzer-/
├── public/
│   ├── index.html       # Interfaz de usuario principal
│   ├── styles.css       # Estilos modernos, temas, layouts y animaciones
│   └── app.js           # Lógica del cliente, llamadas a la API y renderizado
├── src/
│   ├── bot.js           # Bot Puppeteer para scraping y screenshots
│   ├── analyzers/       # Submódulos: dns.js, ssl.js, tech.js
│   └── utils.js         # Funciones auxiliares
├── server.js            # Servidor Express
├── package.json
├── PROJECT_CONTEXT.md   # Este archivo de especificación
└── README.md
```
