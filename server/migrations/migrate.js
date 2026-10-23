import pool from '../db.js';

async function migrate() {
  console.log('Running migration...');
  
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    INSERT INTO tv_screens (id, name, location, faculty_prefix, layout, theme_color, is_active, custom_announcement, slide_duration, marquee_speed)
    VALUES
    (1, 'TV Pusat 1', 'Lobi Utama Rektorat', 'main', 'standard', '#1e40af', 1, '', 8, 20),
    (2, 'TV Pusat 2', 'Lobi Gedung Kuliah / Senat', 'main', 'agenda-focus', '#1e40af', 1, '', 8, 20),
    (3, 'TV Pusat 3', 'Ruang Publik & Perpustakaan', 'main', 'full-media', '#1e40af', 1, '', 8, 20)
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  const [rows] = await pool.query('SELECT * FROM tv_screens');
  console.log('Migration completed successfully. TV screens:', rows);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
