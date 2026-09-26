const tls = require('tls');

/**
 * Conecta via TLS al puerto 443 del hostname e inspecciona el certificado X.509 real.
 * @param {string} hostname 
 * @param {number} port 
 * @returns {Promise<object>}
 */
function analyzeSsl(hostname, port = 443) {
  return new Promise((resolve) => {
    const cleanHost = hostname.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];

    const options = {
      host: cleanHost,
      port: port,
      servername: cleanHost,
      rejectUnauthorized: false, // Permitir inspeccionar certificados auto-firmados o expirados para reportar su estado
      timeout: 6000
    };

    let socket;
    try {
      socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate(true);
        const authorized = socket.authorized;
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();

        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            issuer: 'No detectado',
            subject: cleanHost,
            validTo: 'Desconocido',
            daysRemaining: 0,
            protocol: protocol || 'Desconocido',
            error: 'El servidor no proporcionó un certificado SSL/TLS.'
          });
          return;
        }

        const validToDate = new Date(cert.valid_to);
        const validFromDate = new Date(cert.valid_from);
        const now = new Date();
        const isNotExpired = validToDate > now;
        const isValidDateRange = now >= validFromDate && isNotExpired;

        const diffTime = validToDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        // Formatear emisor legible
        const issuerName = cert.issuer ? (cert.issuer.O || cert.issuer.CN || 'Autoridad de Certificación') : 'Desconocido';
        const subjectName = cert.subject ? (cert.subject.CN || cleanHost) : cleanHost;

        resolve({
          valid: authorized && isValidDateRange,
          issuer: issuerName,
          subject: subjectName,
          validFrom: validFromDate.toISOString().split('T')[0],
          validTo: validToDate.toISOString().split('T')[0],
          daysRemaining: daysRemaining,
          protocol: protocol || 'TLSv1.3',
          cipher: cipher?.name || 'AES-GCM',
          authorized: authorized,
          san: cert.subjectaltname || ''
        });
      });

      socket.on('error', (err) => {
        resolve({
          valid: false,
          issuer: 'Error en handshake TLS',
          subject: cleanHost,
          validTo: 'N/A',
          daysRemaining: 0,
          error: err.message
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          valid: false,
          issuer: 'Tiempo de espera agotado',
          subject: cleanHost,
          validTo: 'N/A',
          daysRemaining: 0,
          error: 'Timeout al negociar conexión TLS'
        });
      });
    } catch (err) {
      resolve({
        valid: false,
        issuer: 'Error de inicialización',
        subject: cleanHost,
        validTo: 'N/A',
        daysRemaining: 0,
        error: err.message
      });
    }
  });
}

module.exports = {
  analyzeSsl
};
