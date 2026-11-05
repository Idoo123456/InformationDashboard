import express from 'express';
import pool from '../db.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 8B. TV DEVICES (MANAJEMEN PERANGKAT TV DINAMIS)
router.get('/', async (req, res) => {
  const { faculty, include_main } = req.query;
  try {
    let sql = 'SELECT * FROM tv_devices';
    let params = [];
    if (faculty && faculty !== 'all') {
      if (include_main === 'true' && faculty !== 'main') {
        sql += ' WHERE faculty_prefix = ? OR faculty_prefix = "main"';
        params.push(faculty);
      } else {
        sql += ' WHERE faculty_prefix = ?';
        params.push(faculty);
      }
    }
    sql += ' ORDER BY id ASC';
    const [rows] = await pool.query(sql, params);

    // Hanya gunakan fallback TV pusat jika secara eksplisit include_main diaktifkan
    if (rows.length === 0 && faculty && faculty !== 'main' && include_main === 'true') {
      const [fallbackRows] = await pool.query('SELECT * FROM tv_devices WHERE faculty_prefix = "main" ORDER BY id ASC');
      if (fallbackRows.length > 0) {
        return res.json(fallbackRows);
      }
    }

    res.json(rows);
  } catch (error) {
    console.error('Get tv devices error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:idOrCode', async (req, res) => {
  const { idOrCode } = req.params;
  try {
    const isNum = !isNaN(Number(idOrCode));
    let rows;
    if (isNum) {
      [rows] = await pool.query('SELECT * FROM tv_devices WHERE id = ? OR code = ? LIMIT 1', [Number(idOrCode), idOrCode]);
    } else {
      [rows] = await pool.query('SELECT * FROM tv_devices WHERE code = ? LIMIT 1', [idOrCode]);
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: `Perangkat TV "${idOrCode}" tidak ditemukan` });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get single tv device error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const {
    name,
    code,
    location,
    faculty_prefix,
    layout,
    theme_color,
    slide_duration,
    marquee_speed,
    custom_announcement,
    is_active,
    notes,
    admin_user
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama TV wajib diisi' });
  }

  try {
    // Generate code unik jika tidak disediakan
    let finalCode = (code && code.trim()) ? code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') : '';
    if (!finalCode) {
      finalCode = `tv-${Date.now().toString().slice(-4)}`;
    }

    // Pastikan code unik
    const [existing] = await pool.query('SELECT id FROM tv_devices WHERE code = ?', [finalCode]);
    if (existing.length > 0) {
      finalCode = `${finalCode}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const [result] = await pool.query(
      `INSERT INTO tv_devices (
        code, name, location, faculty_prefix, layout, theme_color,
        slide_duration, marquee_speed, custom_announcement, is_active, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalCode,
        name.trim(),
        location ? location.trim() : '',
        faculty_prefix || 'main',
        layout || 'standard',
        theme_color || '#1e40af',
        Number(slide_duration) || 8,
        Number(marquee_speed) || 20,
        custom_announcement || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        notes || ''
      ]
    );

    const newId = result.insertId;
    const [created] = await pool.query('SELECT * FROM tv_devices WHERE id = ?', [newId]);

    await logActivity(
      admin_user || 'admin',
      faculty_prefix || 'main',
      'TAMBAH_TV',
      `Menambahkan perangkat TV baru: "${name.trim()}" (ID #${newId}, Kode: ${finalCode})`,
      req
    );

    res.status(201).json({
      success: true,
      message: `Perangkat TV "${name.trim()}" berhasil ditambahkan!`,
      device: created[0]
    });
  } catch (error) {
    console.error('Create tv device error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    code,
    location,
    faculty_prefix,
    layout,
    theme_color,
    slide_duration,
    marquee_speed,
    custom_announcement,
    is_active,
    notes,
    admin_user
  } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM tv_devices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Perangkat TV tidak ditemukan' });
    }

    const oldTv = existing[0];
    let finalCode = oldTv.code;
    if (code && code.trim() && code.trim().toLowerCase() !== oldTv.code) {
      const sanitized = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const [check] = await pool.query('SELECT id FROM tv_devices WHERE code = ? AND id != ?', [sanitized, id]);
      if (check.length > 0) {
        return res.status(400).json({ error: `Kode TV "${sanitized}" sudah digunakan oleh perangkat lain` });
      }
      finalCode = sanitized;
    }

    await pool.query(
      `UPDATE tv_devices SET
        name = COALESCE(?, name),
        code = ?,
        location = COALESCE(?, location),
        faculty_prefix = COALESCE(?, faculty_prefix),
        layout = COALESCE(?, layout),
        theme_color = COALESCE(?, theme_color),
        slide_duration = COALESCE(?, slide_duration),
        marquee_speed = COALESCE(?, marquee_speed),
        custom_announcement = COALESCE(?, custom_announcement),
        is_active = COALESCE(?, is_active),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        finalCode,
        location !== undefined ? location.trim() : null,
        faculty_prefix || null,
        layout || null,
        theme_color || null,
        slide_duration !== undefined ? Number(slide_duration) : null,
        marquee_speed !== undefined ? Number(marquee_speed) : null,
        custom_announcement !== undefined ? custom_announcement : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        notes !== undefined ? notes : null,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM tv_devices WHERE id = ?', [id]);

    await logActivity(
      admin_user || 'admin',
      updated[0].faculty_prefix || 'main',
      'UBAH_TV',
      `Memperbarui konfigurasi TV #${id} (${updated[0].name})`,
      req
    );

    res.json({
      success: true,
      message: `Perangkat TV "${updated[0].name}" berhasil diperbarui!`,
      device: updated[0]
    });
  } catch (error) {
    console.error('Update tv device error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { admin_user } = req.body || {};

  try {
    const [existing] = await pool.query('SELECT * FROM tv_devices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Perangkat TV tidak ditemukan' });
    }

    const tvName = existing[0].name;
    const facPrefix = existing[0].faculty_prefix;

    await pool.query('DELETE FROM tv_devices WHERE id = ?', [id]);

    await logActivity(
      admin_user || 'admin',
      facPrefix || 'main',
      'HAPUS_TV',
      `Menghapus perangkat TV #${id} ("${tvName}")`,
      req
    );

    res.json({
      success: true,
      message: `Perangkat TV "${tvName}" berhasil dihapus!`
    });
  } catch (error) {
    console.error('Delete tv device error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

