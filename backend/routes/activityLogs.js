import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 11. AUDIT LOG (activity_logs)
router.get('/', async (req, res) => {
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

export default router;

