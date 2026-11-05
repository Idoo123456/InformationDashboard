import express from 'express';
import pool from '../db.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 8. MULTI-TV DISPLAY (3 TV PUSAT)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tv_screens ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get tv screens error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM tv_screens WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'TV screen tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get single tv screen error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, location, faculty_prefix, layout, theme_color, is_active, custom_announcement, slide_duration, marquee_speed } = req.body;

  try {
    await pool.query(
      `UPDATE tv_screens SET 
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        faculty_prefix = COALESCE(?, faculty_prefix),
        layout = COALESCE(?, layout),
        theme_color = COALESCE(?, theme_color),
        is_active = COALESCE(?, is_active),
        custom_announcement = COALESCE(?, custom_announcement),
        slide_duration = COALESCE(?, slide_duration),
        marquee_speed = COALESCE(?, marquee_speed)
       WHERE id = ?`,
      [name, location, faculty_prefix, layout, theme_color, is_active, custom_announcement, slide_duration, marquee_speed, id]
    );

    await logActivity('admin', faculty_prefix, 'UBAH_TV', `Memperbarui konfigurasi TV ${id} (${name})`, req);
    res.json({ success: true, message: `TV ${id} berhasil diperbarui!` });
  } catch (error) {
    console.error('Update tv screen error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/broadcast', async (req, res) => {
  const { faculty_prefix, layout, theme_color, is_active, custom_announcement, slide_duration, marquee_speed } = req.body;

  try {
    let updateFields = [];
    let params = [];

    if (faculty_prefix !== undefined) { updateFields.push('faculty_prefix = ?'); params.push(faculty_prefix); }
    if (layout !== undefined) { updateFields.push('layout = ?'); params.push(layout); }
    if (theme_color !== undefined) { updateFields.push('theme_color = ?'); params.push(theme_color); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (custom_announcement !== undefined) { updateFields.push('custom_announcement = ?'); params.push(custom_announcement); }
    if (slide_duration !== undefined) { updateFields.push('slide_duration = ?'); params.push(slide_duration); }
    if (marquee_speed !== undefined) { updateFields.push('marquee_speed = ?'); params.push(marquee_speed); }

    if (updateFields.length > 0) {
      await pool.query(`UPDATE tv_screens SET ${updateFields.join(', ')}`, params);
    }

    await logActivity('admin', faculty_prefix || 'main', 'BROADCAST_TV', `Menyiarkan pengaturan baru ke seluruh 3 TV Pusat`, req);

    const [updated] = await pool.query('SELECT * FROM tv_screens ORDER BY id ASC');
    res.json({ success: true, message: 'Semua 3 TV berhasil diperbarui serentak!', screens: updated });
  } catch (error) {
    console.error('Broadcast tv screens error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

