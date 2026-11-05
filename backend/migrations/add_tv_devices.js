import pool from '../db.js';

async function migrateTvDevices() {
  console.log('🔄 Menjalankan migrasi tabel tv_devices dan kolom target_tvs pada slides...');

  // 1. Buat tabel tv_devices jika belum ada
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tv_devices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(150) NOT NULL,
      location VARCHAR(150) DEFAULT '',
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      layout VARCHAR(30) NOT NULL DEFAULT 'standard',
      theme_color VARCHAR(20) DEFAULT '#1e40af',
      slide_duration INT DEFAULT 8,
      marquee_speed INT DEFAULT 20,
      custom_announcement TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Tabel tv_devices siap.');

  // 2. Tambah kolom target_tvs pada tabel slides jika belum ada
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM slides LIKE 'target_tvs'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE slides ADD COLUMN target_tvs TEXT AFTER media_fit");
      console.log('✅ Kolom target_tvs berhasil ditambahkan pada tabel slides.');
    } else {
      console.log('ℹ️ Kolom target_tvs sudah ada pada tabel slides.');
    }
  } catch (err) {
    console.error('⚠️ Gagal memeriksa/menambah kolom target_tvs:', err.message);
  }

  // 3. Seed data awal tv_devices jika masih kosong (TV 1, TV 2, TV 3, TV 6, TV 8)
  const [existingTvs] = await pool.query('SELECT COUNT(*) as count FROM tv_devices');
  if (existingTvs[0].count === 0) {
    await pool.query(`
      INSERT INTO tv_devices (id, code, name, location, faculty_prefix, layout, theme_color, is_active, notes)
      VALUES
      (1, 'tv-1', 'TV 1 - Lobi Utama Rektorat', 'Gedung Rektorat Lt. 1', 'main', 'standard', '#1e40af', 1, 'Layar utama display pengunjung'),
      (2, 'tv-2', 'TV 2 - Gedung Kuliah & Senat', 'Gedung Senat Kampus Bina Widya', 'main', 'agenda-focus', '#1e40af', 1, 'Fokus informasi rapat & agenda pimpinan'),
      (3, 'tv-3', 'TV 3 - Perpustakaan Pusat', 'UPA Perpustakaan Lt. 1', 'main', 'full-media', '#1e40af', 1, 'Display media poster & pengumuman'),
      (6, 'tv-6', 'TV 6 - Gedung Kuliah Bersama', 'GKB II Bina Widya', 'main', 'standard', '#1e40af', 1, 'Informasi akademik & kemahasiswaan'),
      (8, 'tv-8', 'TV 8 - Auditorium PKM Gobah', 'Gedung PKM Gobah Lt. 1', 'main', 'agenda-focus', '#1e40af', 1, 'Layar agenda acara & seminar kampus');
    `);
    console.log('✅ Berhasil memasukkan data awal TV (TV 1, TV 2, TV 3, TV 6, TV 8).');
  } else {
    console.log(`ℹ️ Tabel tv_devices telah memiliki ${existingTvs[0].count} unit TV.`);
  }

  // Tampilkan data TV saat ini
  const [rows] = await pool.query('SELECT id, code, name, location, layout FROM tv_devices ORDER BY id ASC');
  console.log('📺 Daftar Perangkat TV aktif:', rows);

  process.exit(0);
}

migrateTvDevices().catch(err => {
  console.error('❌ Migrasi gagal:', err);
  process.exit(1);
});
