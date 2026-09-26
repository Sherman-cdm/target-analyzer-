const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Realiza una solicitud HTTP/HTTPS y evalúa las cabeceras de respuesta y seguridad.
 * @param {string} targetUrl 
 * @returns {Promise<object>}
 */
function analyzeHeaders(targetUrl) {
  return new Promise((resolve) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (err) {
      resolve({
        statusCode: 0,
        headers: {},
        securityHeaders: {},
        score: 50,
        grade: 'C',
        error: 'URL inválida'
      });
      return;
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      method: 'GET',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 TargetAnalyzer/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      timeout: 8000
    };

    const startTime = Date.now();

    const req = client.request(reqOptions, (res) => {
      const responseTimeMs = Date.now() - startTime;
      const headers = res.headers || {};

      // Detección de cabeceras de seguridad
      const hsts = Boolean(headers['strict-transport-security']);
      const csp = Boolean(headers['content-security-policy']);
      const xframe = Boolean(headers['x-frame-options']);
      const nosniff = Boolean(headers['x-content-type-options']);
      const referrer = Boolean(headers['referrer-policy']);
      const permissions = Boolean(headers['permissions-policy']);

      // Cálculo de Score
      let score = 40; // Base por responder
      if (parsedUrl.protocol === 'https:') score += 20;
      if (hsts) score += 12;
      if (csp) score += 12;
      if (xframe) score += 6;
      if (nosniff) score += 5;
      if (referrer) score += 3;
      if (permissions) score += 2;
      score = Math.min(100, Math.max(20, score));

      // Asignación de Grado
      let grade = 'F';
      if (score >= 90) grade = 'A+';
      else if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 55) grade = 'C';
      else if (score >= 40) grade = 'D';

      // Consumir datos mínimos para liberar conexión
      res.on('data', () => {});
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          responseTimeMs,
          server: headers['server'] || 'Oculto / Protegido',
          headers,
          security: {
            score,
            grade,
            headers: {
              hsts,
              csp,
              xframe,
              nosniff,
              referrer,
              permissions
            },
            raw: {
              hsts: headers['strict-transport-security'] || null,
              csp: headers['content-security-policy'] || null,
              xframe: headers['x-frame-options'] || null,
              nosniff: headers['x-content-type-options'] || null,
              referrer: headers['referrer-policy'] || null,
              permissions: headers['permissions-policy'] || null
            }
          }
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        statusMessage: 'Error de conexión',
        responseTimeMs: Date.now() - startTime,
        server: 'Inaccesible',
        headers: {},
        security: {
          score: 30,
          grade: 'F',
          headers: { hsts: false, csp: false, xframe: false, nosniff: false, referrer: false, permissions: false }
        },
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 408,
        statusMessage: 'Timeout',
        responseTimeMs: 8000,
        server: 'Desconocido',
        headers: {},
        security: {
          score: 25,
          grade: 'F',
          headers: { hsts: false, csp: false, xframe: false, nosniff: false, referrer: false, permissions: false }
        },
        error: 'Tiempo de espera agotado al conectar con el objetivo'
      });
    });

    req.end();
  });
}

module.exports = {
  analyzeHeaders
};
