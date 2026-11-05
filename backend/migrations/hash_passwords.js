import pool from '../db.js';
import bcrypt from 'bcryptjs';

async function hashPasswords() {
  console.log('Mengamankan password pengguna di database...');
  const [users] = await pool.query('SELECT id, username, password FROM users');
  
  for (const u of users) {
    if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
      const hash = bcrypt.hashSync(u.password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, u.id]);
      console.log(`Password pengguna ${u.username} berhasil dienkripsi.`);
    }
  }

  console.log('Semua password di database sekarang terenkripsi dengan aman (Bcrypt)!');
  process.exit(0);
}

hashPasswords().catch(err => {
  console.error('Gagal enkripsi password:', err);
  process.exit(1);
});
