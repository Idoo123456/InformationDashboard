import express from 'express';
import pool from '../db.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 10. MASTER RUANGAN (rooms)
router.get('/', async (req, res) => {
  const { faculty = 'main', all } = req.query;
  try {
    let rows;
    if (all === 'true' || faculty === 'all') {
      // Super Admin: Melihat SEMUA ruangan dari SELURUH unit & fakultas
      const [allRows] = await pool.query(
        'SELECT * FROM rooms ORDER BY CASE WHEN faculty_prefix = "main" THEN 0 ELSE 1 END, faculty_prefix ASC, building ASC, name ASC'
      );
      rows = allRows;
    } else {
      // Unit/Fakultas Tertentu: HANYA melihat ruangan milik fakultas tersebut
      const [facultyRows] = await pool.query(
        'SELECT * FROM rooms WHERE faculty_prefix = ? ORDER BY building ASC, name ASC',
        [faculty]
      );
      rows = facultyRows;
    }
    res.json(rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { faculty_prefix = 'main', name, category, building, floor, capacity, facilities } = req.body;
  if (!name) return res.status(400).json({ message: 'Nama ruangan wajib diisi!' });
  try {
    const [result] = await pool.query(
      'INSERT INTO rooms (faculty_prefix, name, category, building, floor, capacity, facilities) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [faculty_prefix, name, category || 'Ruang Rapat', building || '', floor || '', capacity || 30, facilities || '']
    );
    await logActivity('admin', faculty_prefix, 'TAMBAH_RUANGAN', `Menambahkan ruangan baru "${name}" (${category}) untuk [${faculty_prefix}]`, req);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Add room error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { faculty_prefix } = req.query;
  try {
    if (faculty_prefix && faculty_prefix !== 'main') {
      const [room] = await pool.query('SELECT faculty_prefix, name FROM rooms WHERE id = ?', [id]);
      if (room.length > 0 && room[0].faculty_prefix !== faculty_prefix) {
        return res.status(403).json({ error: 'Anda hanya dapat menghapus ruangan milik fakultas Anda sendiri.' });
      }
    }
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    await logActivity('admin', faculty_prefix || 'main', 'HAPUS_RUANGAN', `Menghapus ruangan ID #${id}`, req);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

