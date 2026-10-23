import pool from '../db.js';

async function migrateAll() {
  console.log('--- Memulai Migrasi Lengkap Database Kampus Enterprise ---');

  // 1. faculties (Master Fakultas & Unit Kampus)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS faculties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(150) NOT NULL,
      slug VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      dean_or_head VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. users (Pengguna & Operator)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(30),
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      role ENUM('superadmin', 'admin', 'operator') DEFAULT 'admin',
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. rooms (Master Ruangan & Studio Kampus)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50) DEFAULT 'Ruang Rapat',
      building VARCHAR(100),
      floor VARCHAR(20),
      capacity INT DEFAULT 30,
      facilities TEXT,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. settings (Pengaturan & Branding Display)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      faculty_prefix VARCHAR(20) PRIMARY KEY,
      faculty_name VARCHAR(150) NOT NULL,
      sub_unit_name VARCHAR(150) DEFAULT 'UPA Perpustakaan',
      accreditation VARCHAR(50) DEFAULT 'Akreditasi Unggul',
      campus_location VARCHAR(100) DEFAULT 'Kampus Bina Widya',
      operational_hours VARCHAR(100) DEFAULT '08:00 - 16:00 WIB',
      tagline TEXT,
      primary_color VARCHAR(20) DEFAULT '#1e40af',
      template_colors JSON,
      tv_layout VARCHAR(30) DEFAULT 'standard',
      language VARCHAR(10) DEFAULT 'id',
      timezone VARCHAR(10) DEFAULT 'WIB',
      time_on VARCHAR(10) DEFAULT '06:00',
      time_off VARCHAR(10) DEFAULT '22:00',
      auto_refresh BOOLEAN DEFAULT TRUE,
      slide_duration INT DEFAULT 8,
      marquee_speed INT DEFAULT 20,
      schedule_speed INT DEFAULT 1,
      schedule_scroll_type VARCHAR(20) DEFAULT 'step',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. schedules (Agenda & Kegiatan)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      room_id INT NULL,
      date DATE NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      loc VARCHAR(150) NOT NULL,
      status VARCHAR(50) DEFAULT 'Akan Datang',
      pic VARCHAR(100) DEFAULT '-',
      partner_category ENUM('Internal', 'Eksternal') DEFAULT 'Internal',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. announcements (Pengumuman Running Text)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      text TEXT NOT NULL,
      priority ENUM('Normal', 'Penting', 'Mendesak') DEFAULT 'Normal',
      expiry_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. slides (Media Banner Digital Signage)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS slides (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      tag VARCHAR(100),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      btn_text VARCHAR(100),
      bg TEXT,
      qr_url TEXT,
      qr_label VARCHAR(100),
      media_type ENUM('none', 'image', 'video') DEFAULT 'none',
      media_url TEXT,
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. tv_screens (Manajemen TV Pusat & Display)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tv_screens (
      id INT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(150),
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      layout VARCHAR(30) NOT NULL DEFAULT 'standard',
      theme_color VARCHAR(20) DEFAULT '#1e40af',
      is_active BOOLEAN DEFAULT TRUE,
      custom_announcement TEXT,
      slide_duration INT DEFAULT 8,
      marquee_speed INT DEFAULT 20,
      ip_address VARCHAR(50) DEFAULT '127.0.0.1',
      last_ping TIMESTAMP NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 9. activity_logs (Audit Trail / Riwayat Aktivitas Sistem)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      username VARCHAR(50) NOT NULL,
      faculty_prefix VARCHAR(20) DEFAULT 'main',
      action VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(50) DEFAULT '127.0.0.1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 10. media_library (Galeri & Arsip Berkas Kampus)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_library (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_type VARCHAR(50) DEFAULT 'image',
      file_size BIGINT DEFAULT 0,
      uploaded_by VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // --- SEED DATA AWAL ---

  // Seed Faculties
  await pool.query(`
    INSERT INTO faculties (code, name, slug, description) VALUES
    ('PUSAT', 'Universitas Riau (Kantor Pusat Rektorat)', 'main', 'Gedung Rektorat Kampus Bina Widya'),
    ('FKIP', 'Fakultas Keguruan dan Ilmu Pendidikan', 'fkip', 'Kampus Bina Widya Km 12.5'),
    ('FISIP', 'Fakultas Ilmu Sosial dan Ilmu Politik', 'fisip', 'Kampus Bina Widya Km 12.5'),
    ('FEB', 'Fakultas Ekonomi dan Bisnis', 'feb', 'Kampus Bina Widya Km 12.5'),
    ('FMIPA', 'Fakultas Matematika dan Ilmu Pengetahuan Alam', 'fmipa', 'Kampus Bina Widya Km 12.5'),
    ('FT', 'Fakultas Teknik', 'ft', 'Kampus Bina Widya Km 12.5'),
    ('FP', 'Fakultas Pertanian', 'fp', 'Kampus Bina Widya Km 12.5'),
    ('FPK', 'Fakultas Perikanan dan Kelautan', 'fpk', 'Kampus Bina Widya Km 12.5'),
    ('FK', 'Fakultas Kedokteran', 'fk', 'Kampus Diponegoro'),
    ('FH', 'Fakultas Hukum', 'hukum', 'Kampus Bina Widya Km 12.5'),
    ('FKP', 'Fakultas Keperawatan', 'fkp', 'Kampus Bina Widya Km 12.5')
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  // Seed Master Rooms
  await pool.query(`
    INSERT INTO rooms (faculty_prefix, name, category, building, floor, capacity, facilities) VALUES
    ('main', 'Studio Gurindam 12', 'Studio Multimedia', 'Gedung Rektorat', 'Lt. 1', 60, 'Sound system, Wireless Mic, Video Wall, AC'),
    ('main', 'Ruang Senat (Lt.5)', 'Ruang Rapat Pimpinan', 'Gedung Rektorat', 'Lt. 5', 100, 'Microphone Delegasi, Proyektor Laser, Streaming'),
    ('main', 'Gedung PKM Gobah', 'Auditorium Utama', 'Gedung PKM', 'Lt. 1', 1500, 'Panggung Utama, Lighting, Sound System 10000W'),
    ('main', 'TGCL - Podcast', 'Studio Recording', 'UPA Perpustakaan', 'Lt. 2', 8, 'Microphone Shure, Soundcard Focusrite, Akustik Ruang'),
    ('main', 'TGCL - Meetingroom', 'Ruang Rapat', 'UPA Perpustakaan', 'Lt. 2', 25, 'Smart TV 75 inch, Conference Camera, AC'),
    ('main', 'TGCL - Event & Training Area', 'Area Pelatihan', 'UPA Perpustakaan', 'Lt. 3', 80, 'Proyektor HD, Whiteboard Elektronik, WiFi Dedicated'),
    ('main', 'Ruang Diskusi (Max 15 orang)', 'Ruang Kolaborasi', 'UPA Perpustakaan', 'Lt. 1', 15, 'TV Monitor, Whiteboard, Meja Modular'),
    ('main', 'Ruang Diskusi (Max 8 orang)', 'Ruang Kolaborasi', 'UPA Perpustakaan', 'Lt. 1', 8, 'TV Monitor, Whiteboard, Port Charger')
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  // Seed Initial Activity Log
  await pool.query(`
    INSERT INTO activity_logs (username, faculty_prefix, action, details) VALUES
    ('system', 'main', 'SISTEM_INIT', 'Inisialisasi database kampus enterprise berhasil diselesaikan.');
  `);

  const [tables] = await pool.query('SHOW TABLES');
  console.log('--- Seluruh Tabel Database Saat Ini (Lengkap Enterprise): ---');
  console.log(tables.map(t => Object.values(t)[0]));
  process.exit(0);
}

migrateAll().catch(err => {
  console.error('Migrasi gagal:', err);
  process.exit(1);
});
