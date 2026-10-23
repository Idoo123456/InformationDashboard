import { spawn, execSync } from 'child_process';

console.log('\n\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════');
console.log('\x1b[32m%s\x1b[0m', '  🚀 Menjalankan Dashboard Pusat Informasi UNRI (Fullstack)');
console.log('\x1b[33m%s\x1b[0m', '  📦 1. Backend Server API & Database MySQL -> http://localhost:5000');
console.log('\x1b[35m%s\x1b[0m', '  ⚡ 2. Frontend React (Vite Hot-Reload)    -> http://localhost:5173');
console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════\n');

const killProcess = (proc) => {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
    }
  } catch (e) {
    // abaikan jika proses sudah mati
  }
};

// 1. Jalankan Backend Express Server (dengan --watch auto-reload)
const server = spawn('node', ['--watch', 'server/index.js'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

// 2. Jalankan Frontend Vite
const client = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

let isCleaningUp = false;
const cleanup = () => {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log('\n🛑 Menghentikan seluruh service...');
  killProcess(server);
  killProcess(client);
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
