const { URL } = require('url');

/**
 * Normaliza y valida una URL ingresada por el usuario.
 * @param {string} rawUrl 
 * @returns {{ valid: boolean, url?: string, urlObj?: URL, error?: string }}
 */
function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL no proporcionada o formato inválido' };
  }

  let cleaned = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }

  try {
    const urlObj = new URL(cleaned);
    // Validar hostname mínimo (ej: evitar localhost si se requiere o permitir dominios válidos)
    if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
      if (urlObj.hostname !== 'localhost') {
        return { valid: false, error: 'El dominio ingresado no parece válido' };
      }
    }
    return {
      valid: true,
      url: urlObj.href,
      urlObj
    };
  } catch (err) {
    return { valid: false, error: 'Formato de URL inválido: ' + err.message };
  }
}

/**
 * Extrae el hostname limpio sin protocolo ni puertos.
 * @param {string} url 
 * @returns {string}
 */
function extractHostname(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

/**
 * Mide el tiempo de ejecución en milisegundos de una función asíncrona.
 * @param {Function} asyncFn 
 * @returns {Promise<{ result: any, durationMs: number }>}
 */
async function measureExecutionTime(asyncFn) {
  const start = Date.now();
  const result = await asyncFn();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}

module.exports = {
  normalizeUrl,
  extractHostname,
  measureExecutionTime
};
