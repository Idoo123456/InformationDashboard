import { spawn } from 'child_process';

console.log('\n\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════');
console.log('\x1b[32m%s\x1b[0m', '  🚀 Menjalankan Dashboard Pusat Informasi UNRI (Fullstack)');
console.log('\x1b[33m%s\x1b[0m', '  📦 1. Backend Server API & Database MySQL -> http://localhost:5000');
console.log('\x1b[35m%s\x1b[0m', '  ⚡ 2. Frontend React (Vite Hot-Reload)    -> http://localhost:5173');
console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════\n');

// 1. Jalankan Backend Express Server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true
});

// 2. Jalankan Frontend Vite
const client = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Menghentikan seluruh service...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
