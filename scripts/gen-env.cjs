const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        // privilégier les adresses privées
        if (/^(10|192\.168|172\.(1[6-9]|2[0-9]|3[0-1]))\./.test(net.address)) {
          return net.address;
        }
      }
    }
  }
  // fallback : première IPv4 non interne trouvée
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

(function main() {
  try {
    const ip = getLocalIPv4();
    const envPath = path.resolve(__dirname, '..', '.env.local');
    const content = `VITE_LOCAL_IP=${ip}\n`;
    const prev = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : null;
    if (prev !== content) {
      fs.writeFileSync(envPath, content, { encoding: 'utf8' });
      console.log(`[gen-env] .env.local written with VITE_LOCAL_IP=${ip}`);
    } else {
      console.log(`[gen-env] .env.local already up-to-date (${ip})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('[gen-env] Failed to generate .env.local:', err);
    process.exit(1);
  }
})();