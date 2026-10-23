import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'unri_campus_dashboard_enterprise_secret_2026';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup folder uploads untuk media flyer & video
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Konfigurasi Multer untuk penyimpanan berkas di server
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // Maksimal 100MB per berkas
});

// Helper Pencatatan Audit Log Otomatis
const logActivity = async (username, faculty_prefix, action, details, req) => {
  try {
    const ip = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    await pool.query(
      'INSERT INTO activity_logs (username, faculty_prefix, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [username || 'system', faculty_prefix || 'main', action, details || '', String(ip)]
    );
  } catch (err) {
    console.error('Logging error:', err.message);
  }
};

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({
      status: 'ok',
      mysql: 'connected',
      test: rows[0].result,
      database: process.env.DB_NAME,
      host: `${process.env.DB_HOST}:${process.env.DB_PORT}`
    });
  } catch (error) {
    console.error('MySQL Health Check Error:', error.message || error);
    res.status(500).json({
      status: 'error',
      mysql: 'disconnected',
      error: error.message || error.code || 'Koneksi database gagal'
    });
  }
});

// ==========================================
// 1. UPLOAD MEDIA SERVER (Images & Videos)
// ==========================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada berkas yang diunggah.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const faculty = req.body.faculty_prefix || 'main';
  const uploadedBy = req.body.uploaded_by || 'admin';

  try {
    // Simpan ke tabel media_library
    await pool.query(
      'INSERT INTO media_library (faculty_prefix, file_name, file_path, file_type, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [faculty, req.file.originalname, fileUrl, req.file.mimetype, req.file.size, uploadedBy]
    );

    // Catat log
    await logActivity(
      uploadedBy,
      faculty,
      'UPLOAD_MEDIA',
      `Unggah berkas "${req.file.originalname}" (${(req.file.size / 1024).toFixed(1)} KB)`,
      req
    );

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error upload media:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. AUTH / LOGIN (Bcrypt Hash & JWT)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password, prefix = 'main' } = req.body;
  
  try {
    const [users] = await pool.query(
      'SELECT id, username, password, name, faculty_prefix, role FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      await logActivity(username, prefix, 'LOGIN_GAGAL', 'Username tidak ditemukan', req);
      return res.status(401).json({ message: 'Username atau password salah!' });
    }

    const user = users[0];
    
    // Verifikasi password dengan bcrypt
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
      // Jika masih plaintext, langsung update ke hash bcrypt aman
      if (isMatch) {
        const newHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
      }
    }

    if (!isMatch) {
      await logActivity(username, prefix, 'LOGIN_GAGAL', 'Password tidak cocok', req);
      return res.status(401).json({ message: 'Username atau password salah!' });
    }

    // Periksa izin faculty:
    if (user.role !== 'superadmin' && prefix && prefix !== 'main' && user.faculty_prefix !== prefix) {
      await logActivity(username, prefix, 'LOGIN_DITOLAK', `Mencoba akses fakultas ${prefix} tanpa izin`, req);
      return res.status(403).json({ 
        message: `Akses ditolak! Akun "${username}" hanya memiliki izin untuk mengelola fakultas ${user.faculty_prefix.toUpperCase()}.` 
      });
    }

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Catat log sukses
    await logActivity(user.username, user.faculty_prefix, 'LOGIN_BERHASIL', `Login sukses sebagai ${user.role} (${user.name})`, req);

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role, faculty_prefix: user.faculty_prefix },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const redirectPath = user.role === 'superadmin'
      ? (prefix && prefix !== 'main' ? `/${prefix}/admin` : '/admin')
      : (user.faculty_prefix !== 'main' ? `/${user.faculty_prefix}/admin` : '/admin');

    res.json({
      success: true,
      token,
      redirectPath,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        faculty_prefix: user.faculty_prefix,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.', error: error.message });
  }
});

// ==========================================
// 3. SETTINGS
// ==========================================
app.get('/api/settings/:prefix', async (req, res) => {
  const { prefix } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE faculty_prefix = ?', [prefix]);
    if (rows.length === 0) return res.json(null);
    const setting = rows[0];
    if (typeof setting.template_colors === 'string') {
      try {
        setting.template_colors = JSON.parse(setting.template_colors);
      } catch (e) {}
    }
    res.json(setting);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings/:prefix', async (req, res) => {
  const { prefix } = req.params;
  const s = req.body;

  try {
    const templateColorsJson = typeof s.template_colors === 'object' 
      ? JSON.stringify(s.template_colors) 
      : s.template_colors;

    const query = `
      INSERT INTO settings (
        faculty_prefix, faculty_name, sub_unit_name, accreditation, campus_location,
        operational_hours, tagline, primary_color, template_colors, tv_layout,
        language, timezone, time_on, time_off, auto_refresh, slide_duration,
        marquee_speed, schedule_speed, schedule_scroll_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        faculty_name = VALUES(faculty_name),
        sub_unit_name = VALUES(sub_unit_name),
        accreditation = VALUES(accreditation),
        campus_location = VALUES(campus_location),
        operational_hours = VALUES(operational_hours),
        tagline = VALUES(tagline),
        primary_color = VALUES(primary_color),
        template_colors = VALUES(template_colors),
        tv_layout = VALUES(tv_layout),
        language = VALUES(language),
        timezone = VALUES(timezone),
        time_on = VALUES(time_on),
        time_off = VALUES(time_off),
        auto_refresh = VALUES(auto_refresh),
        slide_duration = VALUES(slide_duration),
        marquee_speed = VALUES(marquee_speed),
        schedule_speed = VALUES(schedule_speed),
        schedule_scroll_type = VALUES(schedule_scroll_type)
    `;

    await pool.query(query, [
      prefix,
      s.faculty_name || '',
      s.sub_unit_name || '',
      s.accreditation || '',
      s.campus_location || '',
      s.operational_hours || '',
      s.tagline || '',
      s.primary_color || '#1e40af',
      templateColorsJson,
      s.tv_layout || 'standard',
      s.language || 'id',
      s.timezone || 'WIB',
      s.time_on || '06:00',
      s.time_off || '22:00',
      s.auto_refresh ?? true,
      s.slide_duration || 8,
      s.marquee_speed || 20,
      s.schedule_speed || 1,
      s.schedule_scroll_type || 'step'
    ]);

    res.json({ success: true, message: 'Settings berhasil disimpan!' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. SCHEDULES (AGENDA KEGIATAN)
// ==========================================
app.get('/api/schedules/:prefix', async (req, res) => {
  const { prefix } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM schedules WHERE faculty_prefix = ? ORDER BY date ASC, start_time ASC',
      [prefix]
    );
    const formatted = rows.map(r => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).slice(0, 10),
      startTime: r.start_time,
      endTime: r.end_time,
      partnerCategory: r.partner_category
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { faculty_prefix = 'main', date, startTime, endTime, title, description, loc, status, pic, partnerCategory, user = 'admin' } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO schedules (faculty_prefix, date, start_time, end_time, title, description, loc, status, pic, partner_category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [faculty_prefix, date, startTime, endTime, title, description || '', loc, status || 'Akan Datang', pic || '-', partnerCategory || 'Internal']
    );

    await logActivity(user, faculty_prefix, 'TAMBAH_AGENDA', `Menambahkan kegiatan "${title}" pada ${date} (${startTime}-${endTime})`, req);

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Add schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM schedules WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/schedules/:prefix/bulk', async (req, res) => {
  const { prefix } = req.params;
  const { schedules } = req.body;
  if (!Array.isArray(schedules)) {
    return res.status(400).json({ error: 'schedules must be an array' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM schedules WHERE faculty_prefix = ?', [prefix]);

    for (const s of schedules) {
      await connection.query(
        `INSERT INTO schedules (faculty_prefix, date, start_time, end_time, title, description, loc, status, pic, partner_category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prefix,
          s.date,
          s.startTime || s.start_time || '08:00',
          s.endTime || s.end_time || '10:00',
          s.title,
          s.description || '',
          s.loc || '-',
          s.status || 'Akan Datang',
          s.pic || '-',
          s.partnerCategory || s.partner_category || 'Internal'
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, count: schedules.length });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk schedules error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// 5. ANNOUNCEMENTS (PENGUMUMAN RUNNING TEXT)
// ==========================================
app.get('/api/announcements/:prefix', async (req, res) => {
  const { prefix } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, faculty_prefix, text, expiry_date FROM announcements WHERE faculty_prefix = ? ORDER BY id ASC',
      [prefix]
    );
    const formatted = rows.map(r => ({
      ...r,
      expiryDate: r.expiry_date instanceof Date ? r.expiry_date.toISOString().split('T')[0] : (r.expiry_date ? String(r.expiry_date).slice(0, 10) : '')
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/announcements/:prefix/bulk', async (req, res) => {
  const { prefix } = req.params;
  const { announcements } = req.body;
  if (!Array.isArray(announcements)) {
    return res.status(400).json({ error: 'announcements must be an array' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM announcements WHERE faculty_prefix = ?', [prefix]);

    for (const a of announcements) {
      await connection.query(
        'INSERT INTO announcements (faculty_prefix, text, expiry_date) VALUES (?, ?, ?)',
        [prefix, a.text, a.expiryDate || a.expiry_date || null]
      );
    }

    await connection.commit();
    res.json({ success: true, count: announcements.length });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk announcements error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// 6. SLIDES (BANNER DIGITAL SIGNAGE)
// ==========================================
app.get('/api/slides/:prefix', async (req, res) => {
  const { prefix } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM slides WHERE faculty_prefix = ? ORDER BY sort_order ASC, id ASC',
      [prefix]
    );
    const formatted = rows.map(r => ({
      id: r.id,
      faculty_prefix: r.faculty_prefix,
      tag: r.tag,
      title: r.title,
      desc: r.description,
      description: r.description,
      btnText: r.btn_text,
      bg: r.bg,
      bgColor: r.bg,
      qr: r.qr_url,
      qrUrl: r.qr_url,
      qrLabel: r.qr_label,
      mediaType: r.media_type,
      mediaUrl: r.media_url,
      sortOrder: r.sort_order
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/slides/:prefix/bulk', async (req, res) => {
  const { prefix } = req.params;
  const { slides } = req.body;
  if (!Array.isArray(slides)) {
    return res.status(400).json({ error: 'slides must be an array' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM slides WHERE faculty_prefix = ?', [prefix]);

    for (let idx = 0; idx < slides.length; idx++) {
      const s = slides[idx];
      await connection.query(
        `INSERT INTO slides (faculty_prefix, tag, title, description, btn_text, bg, qr_url, qr_label, media_type, media_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prefix,
          s.tag || '',
          s.title || '',
          s.desc || s.description || '',
          s.btnText || '',
          s.bg || s.bgColor || 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          s.qr || s.qrUrl || '',
          s.qrLabel || 'Scan QR',
          s.mediaType || 'none',
          s.mediaUrl || '',
          idx + 1
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, count: slides.length });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk slides error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// 7. USERS MANAGEMENT (SUPER ADMIN)
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, phone, faculty_prefix, role, last_login, created_at FROM users ORDER BY id ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, password, name, faculty_prefix = 'main', role = 'admin', email = '', phone = '' } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ message: 'Username, password, dan nama wajib diisi!' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan! Silakan pilih username lain.' });
    }

    // Enkripsi password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, password, name, email, phone, faculty_prefix, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username.trim(), hashedPassword, name.trim(), email, phone, faculty_prefix, role]
    );

    await logActivity('admin', faculty_prefix, 'TAMBAH_PENGGUNA', `Membuat akun baru "${username}" (${name}) dengan role ${role}`, req);

    res.json({
      success: true,
      message: 'Akun fakultas berhasil dibuat dengan enkripsi aman!',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, name, faculty_prefix, role, email = '', phone = '' } = req.body;

  try {
    let query = 'UPDATE users SET name = ?, faculty_prefix = ?, role = ?, email = ?, phone = ?';
    const params = [name, faculty_prefix, role, email, phone];

    if (username) {
      const [conflicts] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
      if (conflicts.length > 0) {
        return res.status(400).json({ message: 'Username sudah digunakan oleh akun lain!' });
      }
      query += ', username = ?';
      params.push(username);
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    await logActivity('admin', faculty_prefix, 'UBAH_PENGGUNA', `Memperbarui data pengguna ID #${id} (${name})`, req);

    res.json({ success: true, message: 'Data pengguna berhasil diperbarui!' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await pool.query('SELECT username, name, faculty_prefix FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    if (user[0].username === 'admin') return res.status(400).json({ message: 'Akun Super Admin utama tidak dapat dihapus!' });

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    await logActivity('admin', user[0].faculty_prefix, 'HAPUS_PENGGUNA', `Menghapus akun "${user[0].username}" (${user[0].name})`, req);

    res.json({ success: true, message: 'Pengguna berhasil dihapus!' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. MULTI-TV DISPLAY (3 TV PUSAT)
// ==========================================
app.get('/api/tv-screens', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tv_screens ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get tv screens error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tv-screens/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM tv_screens WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'TV screen tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get single tv screen error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tv-screens/:id', async (req, res) => {
  const { id } = req.params;
  const { name, location, faculty_prefix, layout, theme_color, is_active, custom_announcement, slide_duration, marquee_speed } = req.body;

  try {
    await pool.query(
      `UPDATE tv_screens SET 
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        faculty_prefix = COALESCE(?, faculty_prefix),
        layout = COALESCE(?, layout),
        theme_color = COALESCE(?, theme_color),
        is_active = COALESCE(?, is_active),
        custom_announcement = COALESCE(?, custom_announcement),
        slide_duration = COALESCE(?, slide_duration),
        marquee_speed = COALESCE(?, marquee_speed)
       WHERE id = ?`,
      [name, location, faculty_prefix, layout, theme_color, is_active, custom_announcement, slide_duration, marquee_speed, id]
    );

    await logActivity('admin', faculty_prefix, 'UBAH_TV', `Memperbarui konfigurasi TV ${id} (${name})`, req);
    res.json({ success: true, message: `TV ${id} berhasil diperbarui!` });
  } catch (error) {
    console.error('Update tv screen error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tv-screens/broadcast', async (req, res) => {
  const { faculty_prefix, layout, theme_color, is_active, custom_announcement, slide_duration, marquee_speed } = req.body;

  try {
    let updateFields = [];
    let params = [];

    if (faculty_prefix !== undefined) { updateFields.push('faculty_prefix = ?'); params.push(faculty_prefix); }
    if (layout !== undefined) { updateFields.push('layout = ?'); params.push(layout); }
    if (theme_color !== undefined) { updateFields.push('theme_color = ?'); params.push(theme_color); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (custom_announcement !== undefined) { updateFields.push('custom_announcement = ?'); params.push(custom_announcement); }
    if (slide_duration !== undefined) { updateFields.push('slide_duration = ?'); params.push(slide_duration); }
    if (marquee_speed !== undefined) { updateFields.push('marquee_speed = ?'); params.push(marquee_speed); }

    if (updateFields.length > 0) {
      await pool.query(`UPDATE tv_screens SET ${updateFields.join(', ')}`, params);
    }

    await logActivity('admin', faculty_prefix || 'main', 'BROADCAST_TV', `Menyiarkan pengaturan baru ke seluruh 3 TV Pusat`, req);

    const [updated] = await pool.query('SELECT * FROM tv_screens ORDER BY id ASC');
    res.json({ success: true, message: 'Semua 3 TV berhasil diperbarui serentak!', screens: updated });
  } catch (error) {
    console.error('Broadcast tv screens error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 9. MASTER FAKULTAS (faculties)
// ==========================================
app.get('/api/faculties', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculties ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 10. MASTER RUANGAN (rooms)
// ==========================================
app.get('/api/rooms', async (req, res) => {
  const { faculty = 'main' } = req.query;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM rooms WHERE faculty_prefix = ? OR faculty_prefix = "main" ORDER BY building ASC, name ASC',
      [faculty]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  const { faculty_prefix = 'main', name, category, building, floor, capacity, facilities } = req.body;
  if (!name) return res.status(400).json({ message: 'Nama ruangan wajib diisi!' });
  try {
    const [result] = await pool.query(
      'INSERT INTO rooms (faculty_prefix, name, category, building, floor, capacity, facilities) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [faculty_prefix, name, category || 'Ruang Rapat', building || '', floor || '', capacity || 30, facilities || '']
    );
    await logActivity('admin', faculty_prefix, 'TAMBAH_RUANGAN', `Menambahkan ruangan baru "${name}" (${category})`, req);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Add room error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    await logActivity('admin', 'main', 'HAPUS_RUANGAN', `Menghapus ruangan ID #${id}`, req);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 11. AUDIT LOG (activity_logs)
// ==========================================
app.get('/api/activity-logs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 12. PRODUCTION STATIC SERVING (SPA)
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

// Jalankan Server
const server = app.listen(PORT, async () => {
  console.log(`Backend Server API running on http://localhost:${PORT}`);
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS test');
    console.log(`✅ [Database] MySQL Sukses Terhubung ke '${process.env.DB_NAME || 'db_pusat_informasi'}' pada host '${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}'`);
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

