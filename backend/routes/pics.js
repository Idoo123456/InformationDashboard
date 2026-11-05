import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 10b. MASTER PIC (pics)
router.get('/', async (req, res) => {
  const { faculty = 'main' } = req.query;
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT name FROM pics WHERE faculty_prefix = ? OR faculty_prefix = "main" ORDER BY name ASC',
      [faculty]
    );
    res.json(rows.map(r => r.name));
  } catch (error) {
    console.error('Get pics error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { faculty_prefix = 'main', name } = req.body;
  const trimmed = (name || '').trim();
  if (!trimmed) return res.status(400).json({ message: 'Nama PIC wajib diisi!' });
  try {
    await pool.query(
      'INSERT INTO pics (faculty_prefix, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
      [faculty_prefix, trimmed]
    );
    res.json({ success: true, name: trimmed });
  } catch (error) {
    console.error('Add PIC error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

