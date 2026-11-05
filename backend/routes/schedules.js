import express from 'express';
import pool from '../db.js';
import { formatDateSafe } from '../utils/dateHelper.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 4. SCHEDULES (AGENDA KEGIATAN)
router.get('/:prefix', async (req, res) => {
  const { prefix } = req.params;
  const { tv, device, all } = req.query;
  const targetTvFilter = tv || device;

  try {
    let rows;
    if (prefix === 'main' || all === 'true') {
      // Super Admin (Pusat): Melihat SELURUH kegiatan dari SELURUH unit & fakultas
      const [allRows] = await pool.query(
        'SELECT * FROM schedules ORDER BY date ASC, start_time ASC'
      );
      rows = allRows;
    } else {
      // Unit/Fakultas Spesifik: Melihat kegiatan milik unit/fakultas tersebut
      const [facRows] = await pool.query(
        'SELECT * FROM schedules WHERE faculty_prefix = ? ORDER BY date ASC, start_time ASC',
        [prefix]
      );
      rows = facRows;
    }

    const formatted = rows.map(r => {
      let targetTvs = [];
      if (r.target_tvs) {
        try {
          targetTvs = typeof r.target_tvs === 'string' ? JSON.parse(r.target_tvs) : r.target_tvs;
          if (!Array.isArray(targetTvs)) targetTvs = [];
        } catch {
          targetTvs = String(r.target_tvs).split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      return {
        ...r,
        date: formatDateSafe(r.date),
        startTime: r.start_time,
        endTime: r.end_time,
        partnerCategory: r.partner_category,
        targetTvs: targetTvs,
        target_tvs: targetTvs
      };
    });

    // Jika parameter filter TV diberikan, saring jadwal untuk TV tersebut atau global
    if (targetTvFilter) {
      const filtered = formatted.filter(s => {
        if (!s.targetTvs || s.targetTvs.length === 0 || s.targetTvs.includes('all')) {
          return true; // Ditampilkan di semua TV
        }
        return s.targetTvs.some(t => String(t) === String(targetTvFilter));
      });
      return res.json(filtered);
    }

    res.json(formatted);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { faculty_prefix = 'main', date, startTime, endTime, title, description, loc, status, pic, partnerCategory, targetTvs, target_tvs, user = 'admin' } = req.body;
  try {
    const locVal = loc && loc.trim() ? loc.trim() : '-';
    const partnerVal = partnerCategory && partnerCategory.trim() ? partnerCategory.trim() : 'Internal';
    const targetTvsVal = JSON.stringify(targetTvs || target_tvs || []);

    const [result] = await pool.query(
      `INSERT INTO schedules (faculty_prefix, date, start_time, end_time, title, description, loc, status, pic, partner_category, target_tvs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [faculty_prefix, formatDateSafe(date), startTime, endTime, title, description || '', locVal, status || 'Akan Datang', pic || '-', partnerVal, targetTvsVal]
    );

    // Otomatis daftarkan ruangan ke tabel rooms jika belum terdaftar
    if (locVal && locVal !== '-') {
      try {
        const [existingRooms] = await pool.query(
          'SELECT id FROM rooms WHERE (faculty_prefix = ? OR faculty_prefix = "main") AND LOWER(TRIM(name)) = LOWER(TRIM(?))',
          [faculty_prefix, locVal]
        );
        if (existingRooms.length === 0) {
          await pool.query(
            'INSERT INTO rooms (faculty_prefix, name, category, building, floor, capacity, facilities) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [faculty_prefix, locVal, 'Ruangan Khusus', 'Gedung Utama', 'Lt. 1', 30, 'Standar']
          );
        }
      } catch (roomErr) {
        console.warn('Auto register room in POST /api/schedules note:', roomErr.message);
      }
    }

    // Otomatis daftarkan PIC baru ke tabel pics jika belum terdaftar
    const picTrimmed = (pic || '').trim();
    if (picTrimmed && picTrimmed !== '-') {
      try {
        await pool.query(
          'INSERT INTO pics (faculty_prefix, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
          [faculty_prefix, picTrimmed]
        );
      } catch (picErr) {
        console.warn('Auto register pic error in POST /api/schedules:', picErr.message);
      }
    }

    await logActivity(user, faculty_prefix, 'TAMBAH_AGENDA', `Menambahkan kegiatan "${title}" pada ${date} (${startTime}-${endTime})`, req);

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Add schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM schedules WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:prefix/bulk', async (req, res) => {
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
      const locVal = s.loc && s.loc.trim() ? s.loc.trim() : '-';
      const rawPartner = (s.partnerCategory && typeof s.partnerCategory === 'string')
        ? s.partnerCategory.trim()
        : ((s.partner_category && typeof s.partner_category === 'string') ? s.partner_category.trim() : '');
      const partnerVal = rawPartner || 'Internal';
      const targetTvsVal = JSON.stringify(s.targetTvs || s.target_tvs || []);

      await connection.query(
        `INSERT INTO schedules (faculty_prefix, date, start_time, end_time, title, description, loc, status, pic, partner_category, target_tvs)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prefix,
          formatDateSafe(s.date),
          s.startTime || s.start_time || '08:00',
          s.endTime || s.end_time || '10:00',
          s.title,
          s.description || '',
          locVal,
          s.status || 'Akan Datang',
          s.pic || '-',
          partnerVal,
          targetTvsVal
        ]
      );

      // Otomatis daftarkan ruangan ke tabel rooms jika belum ada di database
      if (locVal && locVal !== '-') {
        try {
          const [existingRooms] = await connection.query(
            'SELECT id FROM rooms WHERE (faculty_prefix = ? OR faculty_prefix = "main") AND LOWER(TRIM(name)) = LOWER(TRIM(?))',
            [prefix, locVal]
          );
          if (existingRooms.length === 0) {
            await connection.query(
              'INSERT INTO rooms (faculty_prefix, name, category, building, floor, capacity, facilities) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [prefix, locVal, 'Ruangan Khusus', 'Gedung Utama', 'Lt. 1', 30, 'Standar']
            );
          }
        } catch (roomErr) {
          console.warn('Auto register room in bulk note:', roomErr.message);
        }
      }

      // Otomatis daftarkan PIC baru ke tabel pics jika belum terdaftar di database
      const picTrimmed = (s.pic || '').trim();
      if (picTrimmed && picTrimmed !== '-') {
        try {
          await connection.query(
            'INSERT INTO pics (faculty_prefix, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
            [prefix, picTrimmed]
          );
        } catch (picErr) {
          console.warn('Auto register pic error in bulk note:', picErr.message);
        }
      }
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

export default router;
