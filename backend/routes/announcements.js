import express from 'express';
import pool from '../db.js';
import { formatDateSafe } from '../utils/dateHelper.js';

const router = express.Router();

// 5. ANNOUNCEMENTS (PENGUMUMAN RUNNING TEXT)
router.get('/:prefix', async (req, res) => {
  const { prefix } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, faculty_prefix, text, expiry_date FROM announcements WHERE faculty_prefix = ? ORDER BY id ASC',
      [prefix]
    );
    const formatted = rows.map(r => ({
      ...r,
      expiryDate: formatDateSafe(r.expiry_date)
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:prefix/bulk', async (req, res) => {
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

export default router;
