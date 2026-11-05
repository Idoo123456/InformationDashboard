import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_pusat_informasi',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  console.log('Connected to MySQL database:', process.env.DB_NAME || 'db_pusat_informasi');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS pics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_prefix VARCHAR(20) NOT NULL DEFAULT 'main',
      name VARCHAR(150) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_faculty_pic (faculty_prefix, name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table "pics" ensured.');

  const defaultPics = [
    'Evi Susanti, S.Si., M.I.Kom.',
    'Gusti Maya Sari, S. IP.',
    'Yuliastuti, S.IP.',
    'Anton Yuliarto, S.Kom.',
    'H. Thamrin Hasan, M.Pd.',
    'Listya Oktaviana, S.Sos.'
  ];

  for (const name of defaultPics) {
    await conn.query(`
      INSERT INTO pics (faculty_prefix, name)
      VALUES ('main', ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `, [name]);
  }
  console.log('Default PICs inserted.');

  // Migrate any distinct PICs from existing schedules
  const [schedules] = await conn.query(`
    SELECT DISTINCT faculty_prefix, pic 
    FROM schedules 
    WHERE pic IS NOT NULL AND TRIM(pic) != ''
  `);

  for (const row of schedules) {
    if (row.pic && row.pic.trim()) {
      await conn.query(`
        INSERT INTO pics (faculty_prefix, name)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, [row.faculty_prefix || 'main', row.pic.trim()]);
    }
  }

  const [all] = await conn.query('SELECT * FROM pics');
  console.log('Total PICs in database:', all.length, all.map(p => p.name));

  await conn.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

