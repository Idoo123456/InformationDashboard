import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'unri_campus_dashboard_enterprise_secret_2026';

// 2. AUTH / LOGIN (Bcrypt Hash & JWT)
router.post('/login', async (req, res) => {
  const { username, password, prefix = 'main' } = req.body;
  
  try {
    const [users] = await pool.query(
      'SELECT id, username, password, name, faculty_prefix, role FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      await logActivity(username, prefix, 'LOGIN_GAGAL', 'Username tidak ditemukan', req);
      return res.status(401).json({ message: 'Username atau password salah!' });
    }

    const user = users[0];
    
    // Verifikasi password dengan bcrypt
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
      // Jika masih plaintext, langsung update ke hash bcrypt aman
      if (isMatch) {
        const newHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
      }
    }

    if (!isMatch) {
      await logActivity(username, prefix, 'LOGIN_GAGAL', 'Password tidak cocok', req);
      return res.status(401).json({ message: 'Username atau password salah!' });
    }

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Catat log sukses
    await logActivity(user.username, user.faculty_prefix, 'LOGIN_BERHASIL', `Login sukses sebagai ${user.role} (${user.name})`, req);

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role, faculty_prefix: user.faculty_prefix },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const redirectPath = user.role === 'superadmin'
      ? (prefix && prefix !== 'main' ? `/${prefix}/admin` : '/admin')
      : (user.faculty_prefix !== 'main' ? `/${user.faculty_prefix}/admin` : '/admin');

    res.json({
      success: true,
      token,
      redirectPath,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        faculty_prefix: user.faculty_prefix,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.', error: error.message });
  }
});

export default router;
