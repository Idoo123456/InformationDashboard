import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 3. SETTINGS
router.get('/:prefix', async (req, res) => {
  const { prefix } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE faculty_prefix = ?', [prefix]);
    if (rows.length === 0) return res.json(null);
    const setting = rows[0];
    if (typeof setting.template_colors === 'string') {
      try {
        setting.template_colors = JSON.parse(setting.template_colors);
      } catch (e) {}
    }
    res.json(setting);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:prefix', async (req, res) => {
  const { prefix } = req.params;
  const s = req.body;

  try {
    const templateColorsJson = typeof s.template_colors === 'object' 
      ? JSON.stringify(s.template_colors) 
      : s.template_colors;

    const query = `
      INSERT INTO settings (
        faculty_prefix, faculty_name, sub_unit_name, accreditation, campus_location,
        operational_hours, tagline, primary_color, template_colors, tv_layout,
        language, timezone, time_on, time_off, auto_refresh, slide_duration,
        marquee_speed, schedule_speed, schedule_scroll_type, tu_card_grid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        faculty_name = VALUES(faculty_name),
        sub_unit_name = VALUES(sub_unit_name),
        accreditation = VALUES(accreditation),
        campus_location = VALUES(campus_location),
        operational_hours = VALUES(operational_hours),
        tagline = VALUES(tagline),
        primary_color = VALUES(primary_color),
        template_colors = VALUES(template_colors),
        tv_layout = VALUES(tv_layout),
        language = VALUES(language),
        timezone = VALUES(timezone),
        time_on = VALUES(time_on),
        time_off = VALUES(time_off),
        auto_refresh = VALUES(auto_refresh),
        slide_duration = VALUES(slide_duration),
        marquee_speed = VALUES(marquee_speed),
        schedule_speed = VALUES(schedule_speed),
        schedule_scroll_type = VALUES(schedule_scroll_type),
        tu_card_grid = VALUES(tu_card_grid)
    `;

    await pool.query(query, [
      prefix,
      s.faculty_name || '',
      s.sub_unit_name || '',
      s.accreditation || '',
      s.campus_location || '',
      s.operational_hours || '',
      s.tagline || '',
      s.primary_color || '#1e40af',
      templateColorsJson,
      s.tv_layout || 'standard',
      s.language || 'id',
      s.timezone || 'WIB',
      s.time_on || '06:00',
      s.time_off || '22:00',
      s.auto_refresh ?? true,
      s.slide_duration || 8,
      s.marquee_speed || 20,
      s.schedule_speed || 1,
      s.schedule_scroll_type || 'step',
      s.tu_card_grid || '3x2'
    ]);

    res.json({ success: true, message: 'Settings berhasil disimpan!' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
