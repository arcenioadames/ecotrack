const { spawn } = require('child_process');
const os = require('os');

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
  // Prefer 192.168.x.x then 10.x.x.x
  const prefer = candidates.find(a => a.startsWith('192.168.'))
    || candidates.find(a => a.startsWith('10.'))
    || candidates[0]
    || '127.0.0.1';
  return prefer;
}

const detected = detectLocalIp();
const packagerHost = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || detected;

console.log(`[start-lan] detected local ip: ${detected}`);
console.log(`[start-lan] using REACT_NATIVE_PACKAGER_HOSTNAME=${packagerHost}`);

const env = Object.assign({}, process.env, {
  REACT_NATIVE_PACKAGER_HOSTNAME: packagerHost,
  // Keep EXPO_DEBUG if present
});

const cmd = 'npx';
const args = ['expo', 'start', '--lan', '--clear'];

const p = spawn(cmd, args, { stdio: 'inherit', shell: true, env });

p.on('exit', code => process.exit(code));
p.on('error', err => {
  console.error('[start-lan] spawn error', err);
  process.exit(1);
});
