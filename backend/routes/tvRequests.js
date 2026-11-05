import express from 'express';
import pool from '../db.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 8C. TV REQUESTS (PENGAJUAN PERANGKAT TV DARI FAKULTAS)
router.get('/', async (req, res) => {
  const { faculty, status } = req.query;
  try {
    let sql = 'SELECT * FROM tv_requests';
    const params = [];
    const conditions = [];

    if (faculty && faculty !== 'all') {
      conditions.push('faculty_prefix = ?');
      params.push(faculty);
    }
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY id DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Get tv requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const {
    faculty_prefix,
    requested_by,
    name,
    location,
    preferred_layout,
    reason
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama TV yang diajukan wajib diisi' });
  }
  if (!faculty_prefix) {
    return res.status(400).json({ error: 'Fakultas pemohon wajib disertakan' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tv_requests (faculty_prefix, requested_by, name, location, preferred_layout, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        faculty_prefix,
        requested_by || 'admin_fakultas',
        name.trim(),
        location ? location.trim() : '',
        preferred_layout || 'standard',
        reason ? reason.trim() : ''
      ]
    );

    const newId = result.insertId;
    const [created] = await pool.query('SELECT * FROM tv_requests WHERE id = ?', [newId]);

    await logActivity(
      requested_by || 'admin_fakultas',
      faculty_prefix,
      'AJUKAN_TV',
      `Mengajukan permohonan TV baru: "${name.trim()}" (${location || 'Lokasi belum diisi'})`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Permintaan penambahan TV berhasil dikirim ke Super Admin!',
      request: created[0]
    });
  } catch (error) {
    console.error('Create tv request error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const {
    approved_by,
    name,
    code,
    location,
    layout,
    theme_color,
    notes
  } = req.body;

  try {
    const [reqRows] = await pool.query('SELECT * FROM tv_requests WHERE id = ?', [id]);
    if (reqRows.length === 0) {
      return res.status(404).json({ error: 'Permintaan TV tidak ditemukan' });
    }

    const tvReq = reqRows[0];
    const finalName = (name && name.trim()) ? name.trim() : tvReq.name;
    const finalLoc = location !== undefined ? location.trim() : tvReq.location;
    const finalLayout = layout || tvReq.preferred_layout || 'standard';

    // Generate code unik
    let finalCode = (code && code.trim()) ? code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') : '';
    if (!finalCode) {
      finalCode = `${tvReq.faculty_prefix}-${finalName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`.replace(/-+/g, '-').slice(0, 30);
    }
    const [existingCode] = await pool.query('SELECT id FROM tv_devices WHERE code = ?', [finalCode]);
    if (existingCode.length > 0) {
      finalCode = `${finalCode}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Buat perangkat baru di tv_devices
    const [devResult] = await pool.query(
      `INSERT INTO tv_devices (code, name, location, faculty_prefix, layout, theme_color, slide_duration, marquee_speed, is_active, notes)
       VALUES (?, ?, ?, ?, ?, ?, 8, 20, 1, ?)`,
      [
        finalCode,
        finalName,
        finalLoc,
        tvReq.faculty_prefix,
        finalLayout,
        theme_color || '#1e40af',
        notes || `Disetujui dari permohonan #${id} oleh ${tvReq.requested_by}`
      ]
    );

    const newDeviceId = devResult.insertId;

    // Update status pengajuan
    await pool.query(
      'UPDATE tv_requests SET status = "approved", approved_by = ?, created_device_id = ?, admin_notes = ? WHERE id = ?',
      [approved_by || 'superadmin', newDeviceId, notes || 'Disetujui oleh Super Admin', id]
    );

    await logActivity(
      approved_by || 'superadmin',
      tvReq.faculty_prefix,
      'SETUJUI_TV',
      `Menyetujui permohonan TV #${id} dan membuat perangkat baru "${finalName}" (Kode: ${finalCode}) untuk ${tvReq.faculty_prefix}`,
      req
    );

    const [createdDev] = await pool.query('SELECT * FROM tv_devices WHERE id = ?', [newDeviceId]);

    res.json({
      success: true,
      message: `Permintaan TV "${finalName}" berhasil disetujui dan perangkat aktif!`,
      device: createdDev[0]
    });
  } catch (error) {
    console.error('Approve tv request error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { approved_by, admin_notes } = req.body;

  try {
    const [reqRows] = await pool.query('SELECT * FROM tv_requests WHERE id = ?', [id]);
    if (reqRows.length === 0) {
      return res.status(404).json({ error: 'Permintaan TV tidak ditemukan' });
    }

    const tvReq = reqRows[0];

    await pool.query(
      'UPDATE tv_requests SET status = "rejected", approved_by = ?, admin_notes = ? WHERE id = ?',
      [approved_by || 'superadmin', admin_notes || 'Permintaan ditolak oleh Super Admin', id]
    );

    await logActivity(
      approved_by || 'superadmin',
      tvReq.faculty_prefix,
      'TOLAK_TV',
      `Menolak pengajuan TV #${id} ("${tvReq.name}") untuk ${tvReq.faculty_prefix}. Alasan: ${admin_notes || '-'}`,
      req
    );

    res.json({
      success: true,
      message: `Permintaan TV #${id} berhasil ditolak.`
    });
  } catch (error) {
    console.error('Reject tv request error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tv_requests WHERE id = ?', [id]);
    res.json({ success: true, message: 'Riwayat permohonan TV berhasil dihapus' });
  } catch (error) {
    console.error('Delete tv request error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

