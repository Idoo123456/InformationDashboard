import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 7. USERS MANAGEMENT (SUPER ADMIN)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, phone, faculty_prefix, role, last_login, created_at FROM users ORDER BY id ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { username, password, name, faculty_prefix = 'main', role = 'admin', email = '', phone = '' } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ message: 'Username, password, dan nama wajib diisi!' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan! Silakan pilih username lain.' });
    }

    // Enkripsi password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, password, name, email, phone, faculty_prefix, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username.trim(), hashedPassword, name.trim(), email, phone, faculty_prefix, role]
    );

    await logActivity('admin', faculty_prefix, 'TAMBAH_PENGGUNA', `Membuat akun baru "${username}" (${name}) dengan role ${role}`, req);

    res.json({
      success: true,
      message: 'Akun fakultas berhasil dibuat dengan enkripsi aman!',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, name, faculty_prefix, role, email = '', phone = '' } = req.body;

  try {
    let query = 'UPDATE users SET name = ?, faculty_prefix = ?, role = ?, email = ?, phone = ?';
    const params = [name, faculty_prefix, role, email, phone];

    if (username) {
      const [conflicts] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
      if (conflicts.length > 0) {
        return res.status(400).json({ message: 'Username sudah digunakan oleh akun lain!' });
      }
      query += ', username = ?';
      params.push(username);
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    await logActivity('admin', faculty_prefix, 'UBAH_PENGGUNA', `Memperbarui data pengguna ID #${id} (${name})`, req);

    res.json({ success: true, message: 'Data pengguna berhasil diperbarui!' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await pool.query('SELECT username, name, faculty_prefix FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    if (user[0].username === 'admin') return res.status(400).json({ message: 'Akun Super Admin utama tidak dapat dihapus!' });

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    await logActivity('admin', user[0].faculty_prefix, 'HAPUS_PENGGUNA', `Menghapus akun "${user[0].username}" (${user[0].name})`, req);

    res.json({ success: true, message: 'Pengguna berhasil dihapus!' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
