import pool from '../db.js';

/**
 * Helper Pencatatan Audit Log Otomatis ke tabel activity_logs
 */
export const logActivity = async (username, faculty_prefix, action, details, req) => {
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

