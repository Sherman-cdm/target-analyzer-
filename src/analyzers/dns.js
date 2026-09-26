const dns = require('dns').promises;

/**
 * Resuelve y audita la infraestructura de registros DNS para un hostname.
 * @param {string} hostname 
 * @returns {Promise<object>}
 */
async function analyzeDns(hostname) {
  const cleanHost = hostname.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];

  const results = {
    ip: 'No disponible',
    allIps: [],
    ipv6: [],
    nameServers: [],
    mailServers: [],
    txtRecords: [],
    cname: []
  };

  const queries = [
    dns.resolve4(cleanHost).then(ips => {
      results.allIps = ips;
      results.ip = ips[0] || 'No disponible';
    }).catch(() => {}),

    dns.resolve6(cleanHost).then(ips => {
      results.ipv6 = ips;
    }).catch(() => {}),

    dns.resolveNs(cleanHost).then(ns => {
      results.nameServers = ns;
    }).catch(() => {}),

    dns.resolveMx(cleanHost).then(mx => {
      results.mailServers = mx.map(m => `${m.priority} ${m.exchange}`);
    }).catch(() => {}),

    dns.resolveTxt(cleanHost).then(txt => {
      results.txtRecords = txt.map(t => t.join(' '));
    }).catch(() => {}),

    dns.resolveCname(cleanHost).then(cname => {
      results.cname = cname;
    }).catch(() => {})
  ];

  await Promise.allSettled(queries);

  return results;
}

module.exports = {
  analyzeDns
};
