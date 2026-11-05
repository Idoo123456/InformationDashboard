import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 9. MASTER FAKULTAS (faculties)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculties ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
