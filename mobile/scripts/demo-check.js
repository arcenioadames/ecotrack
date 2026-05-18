const http = require('http');
const net = require('net');
const fs = require('fs');
const os = require('os');
const path = require('path');

function detectLocalIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      const isIPv4 = iface.family === 'IPv4' || iface.family === 4;
      if (!isIPv4 || iface.internal) continue;
      candidates.push(iface.address);
    }
  }
  return candidates.find(a => a.startsWith('192.168.')) || candidates.find(a => a.startsWith('10.')) || candidates[0] || null;
}

function checkHttp(url, timeout = 3000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ ok: true, statusCode: res.statusCode });
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.setTimeout(timeout, () => {
      req.abort();
      resolve({ ok: false, error: 'timeout' });
    });
  });
}

function checkTcp(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => { done = true; socket.destroy(); resolve({ ok: true }); });
    socket.on('error', (e) => { if (!done) { done = true; resolve({ ok: false, error: e.message }); } });
    socket.on('timeout', () => { if (!done) { done = true; socket.destroy(); resolve({ ok: false, error: 'timeout' }); } });
    socket.connect(port, host);
  });
}

function readEnvFile(envPath) {
  try {
    const data = fs.readFileSync(envPath, 'utf8');
    const lines = data.split(/\r?\n/);
    const map = {};
    for (const l of lines) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) map[m[1]] = m[2];
    }
    return map;
  } catch (e) { return {}; }
}

async function main() {
  console.log('Demo quick healthcheck');
  const localIp = detectLocalIp();
  console.log('Local IP detected:', localIp || 'none');

  // Check backend health
  const backendUrl = 'http://localhost:3000/health';
  const backend = await checkHttp(backendUrl);
  console.log('Backend', backendUrl, backend.ok ? `OK (${backend.statusCode})` : `FAIL (${backend.error})`);

  // Check Metro on local IP
  if (localIp) {
    const metro = await checkTcp(localIp, 8081);
    console.log(`Metro TCP ${localIp}:8081 ->`, metro.ok ? 'OPEN' : `CLOSED (${metro.error})`);
  } else {
    console.log('Metro TCP check skipped (no local IP)');
  }

  // EXPO_PUBLIC_API_URL
  const envPath = path.join(__dirname, '..', '.env');
  const env = readEnvFile(envPath);
  console.log('EXPO_PUBLIC_API_URL (from .env):', env.EXPO_PUBLIC_API_URL || 'not set');

  // Process env
  console.log('EXPO_PUBLIC_API_URL (process.env):', process.env.EXPO_PUBLIC_API_URL || 'not set');

  console.log('\nQuick checks complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
