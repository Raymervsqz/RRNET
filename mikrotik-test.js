
/**
 * RRNET - MikroTik Test Script
 * Ejecutar con: node mikrotik-test.js
 */

const http = require('http'); // Usamos http para el puerto 80 (API REST v7)

const CONFIG = {
  host: '192.168.0.1',
  port: 80, // API REST Puerto 80 (v7) o 443 (https)
  user: 'ai_bot',
  pass: 'TU_PASSWORD_AQUI',
  addressListName: 'ips_autorizadas_wisphub'
};

const getAuthHeader = () => {
  const auth = Buffer.from(`${CONFIG.user}:${CONFIG.pass}`).toString('base64');
  return `Basic ${auth}`;
};

async function testMikrotik() {
  console.log(`--- Probando conexión a MikroTik en ${CONFIG.host} ---`);

  const options = {
    hostname: CONFIG.host,
    port: CONFIG.port,
    path: '/rest/system/identity',
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    },
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const identity = JSON.parse(data);
        console.log('✅ ÉXITO: Conectado correctamente.');
        console.log(`📡 Nombre del equipo: ${identity.name}`);
        listAddressList();
      } else {
        console.error(`❌ ERROR: El router respondió con código ${res.statusCode}`);
        console.error('Verifica que el usuario ai_bot tenga permisos "rest-api".');
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ ERROR CRÍTICO: No se pudo alcanzar el router.');
    console.error(`Detalle: ${err.message}`);
    console.log('Sugerencia: Revisa si el servicio "www" está activo en /ip service.');
  });

  req.end();
}

function listAddressList() {
  console.log(`--- Buscando lista: ${CONFIG.addressListName} ---`);
  
  const options = {
    hostname: CONFIG.host,
    port: CONFIG.port,
    path: `/rest/ip/firewall/address-list?list=${CONFIG.addressListName}`,
    method: 'GET',
    headers: { 'Authorization': getAuthHeader() }
  };

  http.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const list = JSON.parse(data);
        console.log(`✅ Se encontraron ${list.length} clientes en la lista.`);
        list.forEach(item => {
          console.log(`   - IP: ${item.address} | Comentario: ${item.comment || 'N/A'}`);
        });
      } catch (e) {
        console.log('ℹ️ La lista está vacía o no existe.');
      }
    });
  }).on('error', console.error);
}

testMikrotik();
