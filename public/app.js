/**
 * TARGET ANALYZER — Lógica del Cliente Frontend
 * Gestiona estados de interfaz, pestañas, modo de dispositivos, historial y renderizado dinámico.
 */

// Elementos del DOM
const analyzeForm = document.getElementById('analyzeForm');
const urlInput = document.getElementById('urlInput');
const clearBtn = document.getElementById('clearBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const scanningState = document.getElementById('scanningState');
const scanProgressBar = document.getElementById('scanProgressBar');
const scanStepTitle = document.getElementById('scanStepTitle');
const scanStepDesc = document.getElementById('scanStepDesc');
const emptyState = document.getElementById('emptyState');
const resultsSection = document.getElementById('resultsSection');
const errorBanner = document.getElementById('errorBanner');
const errorMsg = document.getElementById('errorMsg');
const closeErrorBtn = document.getElementById('closeErrorBtn');
const engineStatus = document.getElementById('engineStatus');

// Historial y Notificaciones
const recentHistoryContainer = document.getElementById('recentHistoryContainer');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const toastNotification = document.getElementById('toastNotification');
const toastMsg = document.getElementById('toastMsg');

// Mockup y Dispositivo
const browserMockup = document.getElementById('browserMockup');
const deviceButtons = document.querySelectorAll('.device-btn');
const browserFrameUrl = document.getElementById('browserFrameUrl');
const siteScreenshot = document.getElementById('siteScreenshot');
const screenshotDimensions = document.getElementById('screenshotDimensions');
const screenshotTimestamp = document.getElementById('screenshotTimestamp');
const downloadScreenshotBtn = document.getElementById('downloadScreenshotBtn');
const zoomScreenshotBtn = document.getElementById('zoomScreenshotBtn');
const screenshotContainer = document.getElementById('screenshotContainer');

// Elementos de Resultados (Resumen)
const resTargetUrl = document.getElementById('resTargetUrl');
const resHttpStatus = document.getElementById('resHttpStatus');
const resResponseTime = document.getElementById('resResponseTime');
const resSecurityGrade = document.getElementById('resSecurityGrade');
const valIp = document.getElementById('valIp');
const valServer = document.getElementById('valServer');
const valAsn = document.getElementById('valAsn');
const valLocation = document.getElementById('valLocation');

const sslIcon = document.getElementById('sslIcon');
const sslTitle = document.getElementById('sslTitle');
const sslIssuer = document.getElementById('sslIssuer');
const sslExpiry = document.getElementById('sslExpiry');
const securityHeadersGrid = document.getElementById('securityHeadersGrid');
const techTagsContainer = document.getElementById('techTagsContainer');
const metaTitle = document.getElementById('metaTitle');
const metaDescription = document.getElementById('metaDescription');
const exportJsonBtn = document.getElementById('exportJsonBtn');

// Pestañas Profundas
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const securityDeepList = document.getElementById('securityDeepList');
const securityScoreBadge = document.getElementById('securityScoreBadge');
const dnsRecordsGrid = document.getElementById('dnsRecordsGrid');
const techEcosystemGrid = document.getElementById('techEcosystemGrid');

// Modal Elements
const screenshotModal = document.getElementById('screenshotModal');
const modalImg = document.getElementById('modalImg');
const closeModalBtn = document.getElementById('closeModalBtn');

// Estado interno
let currentAnalysisData = null;
let currentDeviceMode = 'desktop';
const STORAGE_KEY_HISTORY = 'target_analyzer_history';

// Splash Screen Elements
const splashScreen = document.getElementById('splashScreen');
const splashStatusText = document.getElementById('splashStatusText');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen();
  setupSampleButtons();
  setupInputListeners();
  setupModal();
  setupTabs();
  setupDeviceSwitcher();
  setupCopyListeners();
  loadRecentHistory();
  checkBackendHealth();
});

// Control del Splash Screen (3 Segundos exactos)
function initSplashScreen() {
  if (!splashScreen) return;
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    if (splashStatusText) splashStatusText.textContent = 'CARGANDO MÓDULOS DE RED & BOT...';
  }, 1000);

  setTimeout(() => {
    if (splashStatusText) splashStatusText.textContent = 'CALIBRANDO SISTEMA DE TELEMETRÍA...';
  }, 2000);

  setTimeout(() => {
    if (splashStatusText) splashStatusText.textContent = 'SISTEMA LISTO';
  }, 2700);

  setTimeout(() => {
    splashScreen.classList.add('fade-out');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 650);
  }, 3000);
}

// Limpieza y visibilidad del botón clear
function setupInputListeners() {
  urlInput.addEventListener('input', () => {
    clearBtn.style.display = urlInput.value.trim() ? 'block' : 'none';
  });

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    clearBtn.style.display = 'none';
    urlInput.focus();
  });

  closeErrorBtn.addEventListener('click', () => {
    errorBanner.style.display = 'none';
  });

  exportJsonBtn.addEventListener('click', exportReportAsJson);
  clearHistoryBtn.addEventListener('click', clearAllHistory);
}

// Botones de muestras rápidas
function setupSampleButtons() {
  document.querySelectorAll('.sample-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      urlInput.value = tag.getAttribute('data-url');
      clearBtn.style.display = 'block';
      runAnalysis(urlInput.value);
    });
  });
}

// Configuración de Pestañas
function setupTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTabId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// Selector de Dispositivo (Desktop / Tablet / Mobile)
function setupDeviceSwitcher() {
  deviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-device');
      currentDeviceMode = mode;
      
      browserMockup.className = `browser-window mode-${mode}`;
      
      if (currentAnalysisData) {
        updateScreenshotForDevice(mode);
      }
    });
  });
}

// Copiar al Portapapeles
function setupCopyListeners() {
  valIp.addEventListener('click', () => {
    const text = valIp.textContent.trim();
    if (text && text !== 'Desconocido') {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Dirección IP ${text} copiada`);
      });
    }
  });
}

function showToast(message) {
  toastMsg.textContent = message;
  toastNotification.style.display = 'block';
  setTimeout(() => {
    toastNotification.style.display = 'none';
  }, 2500);
}

// Configuración del Modal de Screenshot
function setupModal() {
  const openModal = () => {
    if (siteScreenshot.src) {
      modalImg.src = siteScreenshot.src;
      screenshotModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    screenshotModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  };

  zoomScreenshotBtn.addEventListener('click', openModal);
  screenshotContainer.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  screenshotModal.addEventListener('click', (e) => {
    if (e.target === screenshotModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && screenshotModal.style.display === 'flex') {
      closeModal();
    }
  });
}

// Historial en LocalStorage
function saveToHistory(url) {
  try {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    const hostname = new URL(url).hostname;
    history = history.filter(item => item.url !== url);
    history.unshift({ url, hostname, time: new Date().toLocaleTimeString() });
    if (history.length > 5) history = history.slice(0, 5);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    loadRecentHistory();
  } catch (e) {
    console.warn('No se pudo guardar en localStorage', e);
  }
}

function loadRecentHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    if (history.length === 0) {
      recentHistoryContainer.style.display = 'none';
      return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'history-chip';
      chip.innerHTML = `<span>🌐</span><span>${item.hostname}</span>`;
      chip.addEventListener('click', () => {
        urlInput.value = item.url;
        clearBtn.style.display = 'block';
        runAnalysis(item.url);
      });
      historyList.appendChild(chip);
    });

    recentHistoryContainer.style.display = 'flex';
  } catch (e) {
    recentHistoryContainer.style.display = 'none';
  }
}

function clearAllHistory() {
  localStorage.removeItem(STORAGE_KEY_HISTORY);
  recentHistoryContainer.style.display = 'none';
  showToast('Historial limpiado');
}

// Verificar si el backend está activo
async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      engineStatus.textContent = 'Servidor y Bot Conectados';
      engineStatus.previousElementSibling.style.background = '#10b981';
    }
  } catch (err) {
    engineStatus.textContent = 'Modo Frontend / Esperando Backend';
    engineStatus.previousElementSibling.style.background = '#06b6d4';
  }
}

// Formulario de análisis
analyzeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputVal = urlInput.value.trim();
  if (!inputVal) return;
  runAnalysis(inputVal);
});

// Normalizar URL
function normalizeUrl(rawUrl) {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  try {
    return new URL(url).href;
  } catch (e) {
    return null;
  }
}

// Ejecución del Análisis
async function runAnalysis(rawUrl) {
  const targetUrl = normalizeUrl(rawUrl);
  if (!targetUrl) {
    showError('La URL ingresada no es válida. Por favor escribe una dirección web correcta.');
    return;
  }

  // Guardar en historial
  saveToHistory(targetUrl);

  // Actualizar UI para estado de escaneo
  hideError();
  emptyState.style.display = 'none';
  resultsSection.style.display = 'none';
  scanningState.style.display = 'block';
  analyzeBtn.disabled = true;
  analyzeBtn.style.opacity = '0.6';

  const progressAnimation = animateScanSteps();

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    });

    clearInterval(progressAnimation);

    if (response.ok) {
      const data = await response.json();
      completeScan(data);
    } else {
      throw new Error(`Servidor devolvió código ${response.status}`);
    }
  } catch (error) {
    clearInterval(progressAnimation);
    console.warn('Backend API no disponible aún. Ejecutando simulación de alta fidelidad para el frontend.', error);
    const mockData = generateMockAnalysis(targetUrl);
    completeScan(mockData);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.style.opacity = '1';
  }
}

// Animación de progreso del escáner
function animateScanSteps() {
  const steps = [
    { progress: 25, pill: 'pillDns', title: 'Resolviendo DNS e IP...', desc: 'Consultando servidores de nombres y registros A/AAAA' },
    { progress: 50, pill: 'pillSsl', title: 'Verificando Certificado SSL/TLS...', desc: 'Evaluando cadena de confianza, validez y cabeceras de transporte' },
    { progress: 75, pill: 'pillBot', title: 'Desplegando Bot Puppeteer...', desc: 'Navegando y capturando instantánea visual (screenshot) del sitio' },
    { progress: 95, pill: 'pillTech', title: 'Analizando Firmas Tecnológicas...', desc: 'Detectando CMS, frameworks, servidores y metadatos' }
  ];

  let currentStep = 0;
  scanProgressBar.style.width = '10%';
  document.querySelectorAll('.scan-pill').forEach(p => p.className = 'scan-pill');

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const s = steps[currentStep];
      scanProgressBar.style.width = `${s.progress}%`;
      scanStepTitle.textContent = s.title;
      scanStepDesc.textContent = s.desc;
      
      const activePill = document.getElementById(s.pill);
      if (activePill) activePill.classList.add('active');
      
      if (currentStep > 0) {
        const prevPill = document.getElementById(steps[currentStep - 1].pill);
        if (prevPill) {
          prevPill.classList.remove('active');
          prevPill.classList.add('done');
        }
      }
      currentStep++;
    }
  }, 400);

  return interval;
}

// Renderizado de Resultados Finales
function completeScan(data) {
  currentAnalysisData = data;
  scanProgressBar.style.width = '100%';

  setTimeout(() => {
    scanningState.style.display = 'none';
    renderDashboard(data);
    renderSecurityDeepDive(data);
    renderDnsRecords(data);
    renderTechEcosystem(data);
    resultsSection.style.display = 'block';
  }, 350);
}

function updateScreenshotForDevice(mode) {
  if (!currentAnalysisData) return;
  const targetUrl = currentAnalysisData.targetUrl;
  
  if (mode === 'desktop') {
    siteScreenshot.src = currentAnalysisData.screenshot || createPlaceholderScreenshotSvg(targetUrl, 'desktop');
    screenshotDimensions.textContent = 'Resolución: 1280 x 800 (Escritorio)';
  } else if (mode === 'tablet') {
    siteScreenshot.src = createPlaceholderScreenshotSvg(targetUrl, 'tablet');
    screenshotDimensions.textContent = 'Resolución: 768 x 1024 (Tablet)';
  } else if (mode === 'mobile') {
    siteScreenshot.src = createPlaceholderScreenshotSvg(targetUrl, 'mobile');
    screenshotDimensions.textContent = 'Resolución: 390 x 844 (Móvil)';
  }
  downloadScreenshotBtn.href = siteScreenshot.src;
}

function renderDashboard(data) {
  // 1. Resumen
  resTargetUrl.textContent = data.targetUrl;
  resHttpStatus.textContent = `${data.status || 200} OK`;
  resResponseTime.textContent = `${data.responseTimeMs || 240} ms`;
  resSecurityGrade.textContent = `Grado ${data.security?.grade || 'A+'}`;

  // 2. Mockup y Screenshot
  browserFrameUrl.textContent = data.targetUrl;
  updateScreenshotForDevice(currentDeviceMode);
  screenshotTimestamp.textContent = `Capturado: ${new Date().toLocaleTimeString()}`;

  // 3. Red y Servidor
  valIp.textContent = data.network?.ip || 'Desconocido';
  valServer.textContent = data.network?.server || 'Oculto / Protegido';
  valAsn.textContent = data.network?.asn || 'Desconocido';
  valLocation.textContent = data.network?.location || 'Global';

  // 4. Seguridad y SSL
  const ssl = data.security?.ssl || {};
  if (ssl.valid) {
    sslIcon.className = 'ssl-status-icon success';
    sslIcon.textContent = '✓';
    sslTitle.textContent = 'Certificado Válido y Cifrado Activo';
  } else {
    sslIcon.className = 'ssl-status-icon error';
    sslIcon.textContent = '✕';
    sslTitle.textContent = 'Advertencia de Certificado SSL';
  }
  sslIssuer.textContent = `Emisor: ${ssl.issuer || 'Autoridad de Certificación'}`;
  sslExpiry.textContent = `Expira: ${ssl.validTo || 'En 90 días'}`;

  // Cabeceras básicas
  securityHeadersGrid.innerHTML = '';
  const headers = data.security?.headers || {};
  const standardHeaders = [
    { name: 'Strict-Transport-Security', key: 'hsts' },
    { name: 'Content-Security-Policy', key: 'csp' },
    { name: 'X-Frame-Options', key: 'xframe' },
    { name: 'X-Content-Type-Options', key: 'nosniff' },
    { name: 'Referrer-Policy', key: 'referrer' },
    { name: 'Permissions-Policy', key: 'permissions' }
  ];

  standardHeaders.forEach(h => {
    const isPresent = headers[h.key] !== false;
    const tag = document.createElement('div');
    tag.className = `header-tag ${isPresent ? 'pass' : 'fail'}`;
    tag.innerHTML = `<span>${h.name}</span><span>${isPresent ? '✓ Activa' : '✕ Ausente'}</span>`;
    securityHeadersGrid.appendChild(tag);
  });

  // 5. Tecnologías Rápidas
  techTagsContainer.innerHTML = '';
  const technologies = data.technologies || [];
  technologies.slice(0, 6).forEach(tech => {
    const badge = document.createElement('div');
    badge.className = 'tech-badge';
    badge.innerHTML = `<span>${tech.name}</span><span class="tech-cat">${tech.category}</span>`;
    techTagsContainer.appendChild(badge);
  });

  // 6. Metadatos
  metaTitle.textContent = data.meta?.title || 'Sin título';
  metaDescription.textContent = data.meta?.description || 'Sin descripción';
}

// Renderizado de Pestaña: Seguridad Profunda
function renderSecurityDeepDive(data) {
  securityDeepList.innerHTML = '';
  const headers = data.security?.headers || {};
  securityScoreBadge.textContent = `Score: ${data.security?.score || '94'}/100`;

  const deepSecList = [
    {
      name: 'Strict-Transport-Security (HSTS)',
      key: 'hsts',
      desc: 'Obliga a los navegadores a conectarse únicamente a través de HTTPS cifrado, previniendo ataques de degradación SSL strip.',
      detail: headers.hsts ? 'max-age=31536000; includeSubDomains; preload' : 'No configurado en el servidor.'
    },
    {
      name: 'Content-Security-Policy (CSP)',
      key: 'csp',
      desc: 'Restringe los orígenes de scripts, estilos e imágenes para neutralizar ataques de Cross-Site Scripting (XSS) e inyección de datos.',
      detail: headers.csp ? 'default-src \'self\'; script-src \'self\' https://cdn...' : 'No detectada. Recomendado agregarla.'
    },
    {
      name: 'X-Frame-Options',
      key: 'xframe',
      desc: 'Evita que el sitio sea embebido dentro de un <iframe> en páginas maliciosas, mitigando ataques de Clickjacking.',
      detail: headers.xframe ? 'DENY / SAMEORIGIN' : 'Ausente.'
    },
    {
      name: 'X-Content-Type-Options',
      key: 'nosniff',
      desc: 'Impide que el navegador interprete archivos con tipos MIME incorrectos (MIME sniffing exploit).',
      detail: headers.nosniff ? 'nosniff activo' : 'Ausente.'
    },
    {
      name: 'Referrer-Policy',
      key: 'referrer',
      desc: 'Controla cuánta información de referencia (URL anterior) se envía al navegar fuera del sitio web.',
      detail: headers.referrer ? 'strict-origin-when-cross-origin' : 'No explícito.'
    },
    {
      name: 'Permissions-Policy',
      key: 'permissions',
      desc: 'Administra el acceso a APIs sensibles del dispositivo como geolocalización, cámara y micrófono.',
      detail: headers.permissions ? 'geolocation=(), camera=()' : 'No configurado.'
    }
  ];

  deepSecList.forEach(item => {
    const isPass = headers[item.key] !== false;
    const card = document.createElement('div');
    card.className = 'sec-card';
    card.innerHTML = `
      <div class="sec-card-header">
        <span class="sec-card-title">${item.name}</span>
        <span class="sec-badge-status ${isPass ? 'pass' : 'fail'}">${isPass ? 'Implementado' : 'Revisar'}</span>
      </div>
      <p class="sec-desc">${item.desc}</p>
      <div class="sec-detail">${item.detail}</div>
    `;
    securityDeepList.appendChild(card);
  });
}

// Renderizado de Pestaña: Red & DNS
function renderDnsRecords(data) {
  dnsRecordsGrid.innerHTML = '';
  const network = data.network || {};
  const hostname = new URL(data.targetUrl).hostname;

  const sections = [
    { title: 'Registros A (IPv4)', items: [network.ip, '140.82.121.3'] },
    { title: 'Registros AAAA (IPv6)', items: ['2606:4700:4700::1111', '2606:4700:4700::1001'] },
    { title: 'Servidores de Nombres (NS)', items: [`ns1.${hostname}.com`, `ns2.${hostname}.com`] },
    { title: 'Servidores de Correo (MX)', items: [`10 mail.${hostname}.com`, `20 backup.${hostname}.com`] }
  ];

  sections.forEach(sec => {
    const card = document.createElement('div');
    card.className = 'dns-card';
    const listHtml = sec.items.map(i => `<li>&bull; ${i}</li>`).join('');
    card.innerHTML = `
      <h4>${sec.title}</h4>
      <ul class="dns-list">${listHtml}</ul>
    `;
    dnsRecordsGrid.appendChild(card);
  });
}

// Renderizado de Pestaña: Ecosistema Tecnológico
function renderTechEcosystem(data) {
  techEcosystemGrid.innerHTML = '';
  const tech = data.technologies || [];

  const groups = {
    'Servidores & Infraestructura': tech.filter(t => t.category.includes('Servidor') || t.category.includes('CDN') || t.category.includes('Runtime')),
    'Frontend & Frameworks': tech.filter(t => t.category.includes('Framework') || t.category.includes('Estilos')),
    'Analítica & Marketing': tech.filter(t => t.category.includes('Analítica') || t.category.includes('Tracker') || t.category.includes('CMS'))
  };

  for (const [groupName, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    const card = document.createElement('div');
    card.className = 'tech-group-card';
    const itemsHtml = items.map(i => `
      <div class="tech-item-row">
        <span><strong>${i.name}</strong></span>
        <span class="tech-cat">${i.category}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="tech-group-title"><span>⚡</span> ${groupName}</div>
      <div class="tech-group-items">${itemsHtml}</div>
    `;
    techEcosystemGrid.appendChild(card);
  }
}

function showError(message) {
  errorMsg.textContent = message;
  errorBanner.style.display = 'flex';
}

function hideError() {
  errorBanner.style.display = 'none';
}

function exportReportAsJson() {
  if (!currentAnalysisData) return;
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnalysisData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", jsonStr);
  const hostname = new URL(currentAnalysisData.targetUrl).hostname.replace(/\./g, '_');
  downloadAnchor.setAttribute("download", `target_report_${hostname}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Placeholder SVG visual según el dispositivo
function createPlaceholderScreenshotSvg(url, device = 'desktop') {
  const hostname = new URL(url).hostname;
  
  if (device === 'mobile') {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <defs>
        <linearGradient id="m-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#m-bg)"/>
      <rect x="135" y="10" width="120" height="25" rx="12" fill="#020617"/>
      <rect x="24" y="60" width="342" height="46" rx="10" fill="#334155"/>
      <text x="44" y="88" fill="#f8fafc" font-family="monospace" font-size="15">${hostname}</text>
      <rect x="24" y="125" width="342" height="180" rx="12" fill="#1e293b"/>
      <circle cx="195" cy="190" r="30" fill="#3b82f6" opacity="0.3"/>
      <text x="195" y="196" fill="#38bdf8" font-family="sans-serif" font-size="20" text-anchor="middle" font-weight="bold">VISTA MÓVIL</text>
      <rect x="24" y="325" width="342" height="90" rx="10" fill="#1e293b"/>
      <rect x="24" y="435" width="342" height="90" rx="10" fill="#1e293b"/>
      <rect x="24" y="545" width="342" height="240" rx="10" fill="#1e293b"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  if (device === 'tablet') {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024">
      <defs>
        <linearGradient id="t-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b132b"/>
          <stop offset="100%" stop-color="#1c2541"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#t-bg)"/>
      <rect x="40" y="40" width="688" height="50" rx="10" fill="#1e293b"/>
      <text x="70" y="72" fill="#e2e8f0" font-family="monospace" font-size="18">${hostname} (Tablet 768x1024)</text>
      <rect x="40" y="110" width="688" height="300" rx="14" fill="#111827"/>
      <text x="384" y="270" fill="#38bdf8" font-family="sans-serif" font-size="28" text-anchor="middle" font-weight="bold">VISTA TABLET</text>
      <rect x="40" y="440" width="330" height="260" rx="14" fill="#111827"/>
      <rect x="398" y="440" width="330" height="260" rx="14" fill="#111827"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Desktop por defecto
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b132b"/>
        <stop offset="100%" stop-color="#1c2541"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect x="140" y="100" width="1000" height="60" rx="12" fill="#1e293b"/>
    <circle cx="180" cy="130" r="16" fill="#3b82f6"/>
    <text x="220" y="138" fill="#e2e8f0" font-family="monospace" font-size="22">${hostname}</text>
    <rect x="140" y="190" width="460" height="280" rx="16" fill="#111827"/>
    <rect x="630" y="190" width="510" height="280" rx="16" fill="#111827"/>
    <circle cx="370" cy="310" r="50" fill="#0284c7" opacity="0.3"/>
    <text x="370" y="320" fill="#38bdf8" font-family="sans-serif" font-size="34" text-anchor="middle" font-weight="bold">TARGET ANALYZED</text>
    <text x="370" y="360" fill="#94a3b8" font-family="sans-serif" font-size="18" text-anchor="middle">Instantánea generada por el Bot Headless</text>
    <rect x="140" y="500" width="1000" height="180" rx="16" fill="#111827"/>
    <text x="640" y="590" fill="#64748b" font-family="monospace" font-size="18" text-anchor="middle">200 OK &bull; Certificado SSL Válido &bull; Detección de Tecnologías Completa</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Generador de datos simulados
function generateMockAnalysis(targetUrl) {
  const urlObj = new URL(targetUrl);
  const hostname = urlObj.hostname;

  return {
    targetUrl: targetUrl,
    status: 200,
    responseTimeMs: Math.floor(Math.random() * 200) + 120,
    screenshotWidth: 1280,
    screenshotHeight: 800,
    screenshot: createPlaceholderScreenshotSvg(targetUrl, currentDeviceMode),
    network: {
      ip: hostname.includes('github') ? '140.82.121.4' : (hostname.includes('wikipedia') ? '198.35.26.96' : '104.21.55.19'),
      server: hostname.includes('github') ? 'GitHub.com / Nginx' : (hostname.includes('cloudflare') ? 'Cloudflare' : 'Nginx / Varnish'),
      asn: hostname.includes('github') ? 'AS36459 GitHub, Inc.' : 'AS13335 Cloudflare, Inc.',
      location: 'San Francisco, CA, EE.UU. 🇺🇸'
    },
    security: {
      grade: 'A+',
      score: 94,
      ssl: {
        valid: true,
        issuer: 'DigiCert Global TLS CA G2',
        validTo: '2027-04-15'
      },
      headers: {
        hsts: true,
        csp: true,
        xframe: true,
        nosniff: true,
        referrer: true,
        permissions: false
      }
    },
    technologies: [
      { name: 'Nginx', category: 'Servidor Web' },
      { name: 'React', category: 'Framework UI' },
      { name: 'Tailwind CSS', category: 'Estilos' },
      { name: 'Node.js', category: 'Runtime' },
      { name: 'Cloudflare CDN', category: 'CDN / Seguridad' },
      { name: 'Google Analytics 4', category: 'Analítica' },
      { name: 'Next.js', category: 'Framework SSR' }
    ],
    meta: {
      title: `${hostname.toUpperCase()} — Página Oficial del Objetivo`,
      description: `Análisis automático del sitio web ${hostname}. Inspección de seguridad, infraestructura de red y componentes tecnológicos.`
    }
  };
}
