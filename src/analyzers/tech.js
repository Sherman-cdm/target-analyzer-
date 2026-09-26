/**
 * Analiza cabeceras HTTP y fragmentos HTML para detectar tecnologías utilizadas.
 * @param {object} headers 
 * @param {string} html 
 * @returns {Array<{ name: string, category: string }>}
 */
function analyzeTechnologies(headers = {}, html = '') {
  const detected = new Map();

  const addTech = (name, category) => {
    if (!detected.has(name)) {
      detected.set(name, { name, category });
    }
  };

  const rawHeadersStr = JSON.stringify(headers).toLowerCase();
  const lowerHtml = (html || '').toLowerCase();

  // 1. Servidor y CDN por cabeceras
  const serverHeader = (headers['server'] || '').toLowerCase();
  if (serverHeader.includes('cloudflare') || headers['cf-ray']) {
    addTech('Cloudflare CDN', 'CDN / Seguridad');
  }
  if (serverHeader.includes('nginx')) {
    addTech('Nginx', 'Servidor Web');
  }
  if (serverHeader.includes('apache')) {
    addTech('Apache HTTP Server', 'Servidor Web');
  }
  if (serverHeader.includes('varnish')) {
    addTech('Varnish Cache', 'Caché Web / Proxy');
  }
  if (serverHeader.includes('caddy')) {
    addTech('Caddy', 'Servidor Web');
  }
  if (serverHeader.includes('litespeed')) {
    addTech('LiteSpeed Web Server', 'Servidor Web');
  }
  if (headers['x-amz-cf-id'] || serverHeader.includes('cloudfront')) {
    addTech('Amazon CloudFront', 'CDN / Distribución');
  }
  if (headers['x-fastly-request-id']) {
    addTech('Fastly', 'CDN / Edge Cloud');
  }
  if (headers['x-vercel-id']) {
    addTech('Vercel Edge', 'Infraestructura Cloud');
  }
  if (headers['x-nf-request-id']) {
    addTech('Netlify', 'Plataforma Hosting');
  }

  // 2. Runtimes y Lenguajes
  const poweredBy = (headers['x-powered-by'] || '').toLowerCase();
  if (poweredBy.includes('express') || poweredBy.includes('node')) {
    addTech('Node.js / Express', 'Backend / Runtime');
  }
  if (poweredBy.includes('php') || lowerHtml.includes('/wp-content/') || lowerHtml.includes('phpsessid')) {
    addTech('PHP', 'Lenguaje Backend');
  }
  if (poweredBy.includes('asp.net') || rawHeadersStr.includes('aspnet')) {
    addTech('ASP.NET', 'Framework Backend');
  }

  // 3. CMS y Plataformas
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes') || lowerHtml.includes('name="generator" content="wordpress')) {
    addTech('WordPress', 'CMS / Blog');
  }
  if (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify.theme')) {
    addTech('Shopify', 'Comercio Electrónico');
  }
  if (lowerHtml.includes('drupal.settings') || lowerHtml.includes('name="generator" content="drupal')) {
    addTech('Drupal', 'CMS');
  }
  if (lowerHtml.includes('static.parastorage.com') || lowerHtml.includes('wix.com')) {
    addTech('Wix', 'Constructor Web');
  }
  if (lowerHtml.includes('assets.website-files.com') || lowerHtml.includes('data-wf-site')) {
    addTech('Webflow', 'Diseño Web / CMS');
  }

  // 4. Frameworks Frontend & Librerías
  if (lowerHtml.includes('__next') || lowerHtml.includes('/_next/static/')) {
    addTech('Next.js', 'Framework SSR');
    addTech('React', 'Librería UI');
  } else if (lowerHtml.includes('react.production.min.js') || lowerHtml.includes('data-reactroot') || lowerHtml.includes('react-dom')) {
    addTech('React', 'Librería UI');
  }

  if (lowerHtml.includes('__nuxt') || lowerHtml.includes('data-n-head') || lowerHtml.includes('/_nuxt/')) {
    addTech('Nuxt.js', 'Framework SSR');
    addTech('Vue.js', 'Framework UI');
  } else if (lowerHtml.includes('vue.global') || lowerHtml.includes('data-v-')) {
    addTech('Vue.js', 'Framework UI');
  }

  if (lowerHtml.includes('ng-version') || lowerHtml.includes('app-root')) {
    addTech('Angular', 'Framework UI');
  }

  if (lowerHtml.includes('svelte-') || lowerHtml.includes('__svelte')) {
    addTech('Svelte', 'Framework UI');
  }

  if (lowerHtml.includes('jquery.min.js') || lowerHtml.includes('jquery.js')) {
    addTech('jQuery', 'Librería JavaScript');
  }

  // 5. Estilos y CSS
  if (lowerHtml.includes('tailwind') || lowerHtml.includes('class="flex ') || lowerHtml.includes('class="grid ')) {
    addTech('Tailwind CSS', 'Framework de Estilos');
  }
  if (lowerHtml.includes('bootstrap.min.css') || lowerHtml.includes('class="col-md-') || lowerHtml.includes('class="container-fluid')) {
    addTech('Bootstrap', 'Framework de Estilos');
  }

  // 6. Analítica & Marketing
  if (lowerHtml.includes('googletagmanager.com/gtm.js') || lowerHtml.includes('gtm-')) {
    addTech('Google Tag Manager', 'Gestión de Etiquetas');
  }
  if (lowerHtml.includes('google-analytics.com/analytics.js') || lowerHtml.includes('gtag(') || lowerHtml.includes('g-')) {
    addTech('Google Analytics 4', 'Analítica Web');
  }
  if (lowerHtml.includes('static.hotjar.com')) {
    addTech('Hotjar', 'Comportamiento de Usuario');
  }

  // Si no se detectaron tecnologías suficientes, agregar tecnologías base inferidas de forma segura
  if (detected.size === 0) {
    addTech('HTML5 / CSS3', 'Lenguaje Web');
    addTech('JavaScript ES6+', 'Librería / Script');
  }

  return Array.from(detected.values());
}

module.exports = {
  analyzeTechnologies
};
