import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db.js';
import { uploadsDir } from './middleware/upload.js';

// Import Modular Routers
import healthRoutes from './routes/health.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import schedulesRoutes from './routes/schedules.js';
import announcementsRoutes from './routes/announcements.js';
import slidesRoutes from './routes/slides.js';
import usersRoutes from './routes/users.js';
import tvScreensRoutes from './routes/tvScreens.js';
import tvDevicesRoutes from './routes/tvDevices.js';
import tvRequestsRoutes from './routes/tvRequests.js';
import facultiesRoutes from './routes/faculties.js';
import roomsRoutes from './routes/rooms.js';
import picsRoutes from './routes/pics.js';
import activityLogsRoutes from './routes/activityLogs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Anti-Cache Header untuk seluruh API endpoint agar data selalu real-time
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Static Serving untuk Media Flyer & Video
app.use('/uploads', express.static(uploadsDir));

// ==========================================
// REGISTER MODULAR API ROUTES
// ==========================================
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tv-screens', tvScreensRoutes);
app.use('/api/tv-devices', tvDevicesRoutes);
app.use('/api/tv-requests', tvRequestsRoutes);
app.use('/api/faculties', facultiesRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/pics', picsRoutes);
app.use('/api/activity-logs', activityLogsRoutes);

// ==========================================
// PRODUCTION STATIC SERVING (SPA)
// ==========================================
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
}

// ==========================================
// RUN SERVER & DATABASE MIGRATION CHECK
// ==========================================
const server = app.listen(PORT, async () => {
  console.log(`Backend Server API running on http://localhost:${PORT}`);
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS test');
    console.log(`✅ [Database] MySQL Sukses Terhubung ke '${process.env.DB_NAME || 'db_pusat_informasi'}' pada host '${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}'`);
    
    // Auto-patch: pastikan kolom target_tvs tersedia di tabel schedules
    try {
      const [cols] = await pool.query(`SHOW COLUMNS FROM schedules LIKE 'target_tvs'`);
      if (cols.length === 0) {
        await pool.query(`ALTER TABLE schedules ADD COLUMN target_tvs TEXT NULL AFTER partner_category`);
        console.log('✅ [Database Migration] Kolom target_tvs berhasil ditambahkan ke tabel schedules');
      }
    } catch (colErr) {
      console.warn('⚠️ [Database Migration Note]:', colErr.message);
    }

    // Auto-patch: pastikan tabel tv_requests tersedia
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tv_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          faculty_prefix VARCHAR(20) NOT NULL,
          requested_by VARCHAR(50) NOT NULL,
          name VARCHAR(150) NOT NULL,
          location VARCHAR(150) DEFAULT '',
          preferred_layout VARCHAR(30) DEFAULT 'standard',
          reason TEXT,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          admin_notes TEXT,
          approved_by VARCHAR(50) NULL,
          created_device_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('✅ [Database Migration] Tabel tv_requests siap');
    } catch (reqTblErr) {
      console.warn('⚠️ [Database Migration Note]:', reqTblErr.message);
    }
  } catch (err) {
    console.error(`❌ [Database ERROR] Gagal terhubung ke MySQL:`, err.message);
    console.error(`   👉 Pastikan host/port/user/password di server/.env sesuai. Host saat ini: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ [Server ERROR] Port ${PORT} sedang dipakai oleh proses lain!`);
    console.error(`   👉 Matikan proses node yang sedang berjalan di port ${PORT}.`);
    process.exit(1);
  } else {
    console.error(`❌ [Server ERROR]:`, err.message);
  }
});

export default app;
