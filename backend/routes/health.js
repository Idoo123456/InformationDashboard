import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Health Check API
router.get('/', async (req, res) => {
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

export default router;
