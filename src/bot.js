const puppeteer = require('puppeteer');
const fs = require('fs');

// Rutas habituales de navegadores en Windows como fallback ultra-rápido
const FALLBACK_BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];

/**
 * Obtiene la mejor ruta de ejecutable para el navegador headless.
 * @returns {string|undefined}
 */
function getBrowserExecutablePath() {
  try {
    const puppeteerPath = puppeteer.executablePath();
    if (typeof puppeteerPath === 'string' && puppeteerPath.trim().length > 0 && fs.existsSync(puppeteerPath)) {
      return puppeteerPath;
    }
  } catch {
    // Si puppeteer no tiene descargado el binario, usamos los navegadores del sistema
  }

  for (const p of FALLBACK_BROWSERS) {
    if (typeof p === 'string' && fs.existsSync(p)) {
      return p;
    }
  }

  return undefined;
}

/**
 * Bot crawler headless que navega al objetivo, extrae metadatos y toma capturas de pantalla.
 * @param {string} targetUrl 
 * @param {object} options 
 * @returns {Promise<object>}
 */
async function captureTargetWithBot(targetUrl, options = {}) {
  const {
    device = 'desktop',
    timeout = 18000
  } = options;

  let viewport = { width: 1280, height: 800 };
  if (device === 'tablet') {
    viewport = { width: 768, height: 1024 };
  } else if (device === 'mobile') {
    viewport = { width: 390, height: 844, isMobile: true, hasTouch: true };
  }

  const execPath = getBrowserExecutablePath();
  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--window-size=${viewport.width},${viewport.height}`,
      '--ignore-certificate-errors'
    ]
  };

  if (execPath) {
    launchOptions.executablePath = execPath;
  }

  let browser;
  const consoleErrors = [];
  let resourceCount = 0;

  try {
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.setViewport(viewport);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 TargetAnalyzerBot/2.0');

    // Capturar logs y errores de consola
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text().slice(0, 150));
      }
    });

    page.on('request', () => {
      resourceCount++;
    });

    // Navegar con límite de tiempo
    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: timeout
    });

    const httpStatus = response ? response.status() : 200;
    let protocol = 'HTTP/2';
    if (response) {
      const respHeaders = response.headers();
      if (respHeaders[':status'] || respHeaders['alt-svc']) {
        protocol = 'HTTP/2 (Multiplexed)';
      }
    }

    // Pequeña espera para permitir renderizado de estilos
    await new Promise(r => setTimeout(r, 600));

    // Tomar captura de pantalla en Base64 JPEG de buena calidad
    const screenshotBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 85,
      encoding: 'base64'
    });
    const screenshotDataUri = `data:image/jpeg;base64,${screenshotBuffer}`;

    // Extraer metadatos semánticos y fragmento de HTML
    const pageData = await page.evaluate(() => {
      const getMeta = (name) => {
        const el = document.querySelector(`meta[name="${name}" i], meta[property="${name}" i]`);
        return el ? el.getAttribute('content') : null;
      };

      const title = document.title || '';
      const description = getMeta('description') || getMeta('og:description') || '';
      const ogTitle = getMeta('og:title') || title;
      const ogDescription = getMeta('og:description') || description;
      const ogImage = getMeta('og:image') || '';
      const viewportMeta = getMeta('viewport');
      const htmlSnippet = document.documentElement.outerHTML.slice(0, 450000);
      const totalDomNodes = document.querySelectorAll('*').length;

      return {
        title,
        description,
        ogTitle,
        ogDescription,
        ogImage,
        hasViewport: Boolean(viewportMeta),
        htmlSnippet,
        totalDomNodes
      };
    });

    return {
      success: true,
      status: httpStatus,
      protocol: protocol,
      screenshot: screenshotDataUri,
      meta: {
        title: pageData.title || 'Sin título',
        description: pageData.description || 'Sin descripción detectada',
        ogTitle: pageData.ogTitle,
        ogDescription: pageData.ogDescription,
        ogImage: pageData.ogImage,
        viewport: pageData.hasViewport
      },
      htmlSnippet: pageData.htmlSnippet,
      telemetry: {
        totalDomNodes: pageData.totalDomNodes,
        resourceCount: resourceCount,
        consoleErrorsCount: consoleErrors.length,
        consoleErrors: consoleErrors.slice(0, 3)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      screenshot: null,
      meta: {
        title: 'Error de navegación',
        description: `No se pudo renderizar la página: ${error.message}`
      }
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

module.exports = {
  captureTargetWithBot,
  getBrowserExecutablePath
};
