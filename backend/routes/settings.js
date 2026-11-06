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
    // 1. Ambil data settings yang ada sebelumnya agar partial update tidak mereset data lain ke default
    const [existing] = await pool.query('SELECT * FROM settings WHERE faculty_prefix = ?', [prefix]);
    const prev = existing.length > 0 ? existing[0] : {};

    const templateColorsJson = typeof s.template_colors === 'object' 
      ? JSON.stringify(s.template_colors) 
      : (s.template_colors !== undefined ? s.template_colors : (typeof prev.template_colors === 'string' ? prev.template_colors : JSON.stringify(prev.template_colors || {})));

    const merged = {
      faculty_name: s.faculty_name !== undefined ? s.faculty_name : (prev.faculty_name || ''),
      sub_unit_name: s.sub_unit_name !== undefined ? s.sub_unit_name : (prev.sub_unit_name || ''),
      accreditation: s.accreditation !== undefined ? s.accreditation : (prev.accreditation || ''),
      campus_location: s.campus_location !== undefined ? s.campus_location : (prev.campus_location || ''),
      operational_hours: s.operational_hours !== undefined ? s.operational_hours : (prev.operational_hours || ''),
      tagline: s.tagline !== undefined ? s.tagline : (prev.tagline || ''),
      primary_color: s.primary_color !== undefined ? s.primary_color : (prev.primary_color || '#1e40af'),
      template_colors: templateColorsJson,
      tv_layout: s.tv_layout !== undefined ? s.tv_layout : (prev.tv_layout || 'standard'),
      language: s.language !== undefined ? s.language : (prev.language || 'id'),
      timezone: s.timezone !== undefined ? s.timezone : (prev.timezone || 'WIB'),
      time_on: s.time_on !== undefined ? s.time_on : (prev.time_on || '06:00'),
      time_off: s.time_off !== undefined ? s.time_off : (prev.time_off || '22:00'),
      auto_refresh: s.auto_refresh !== undefined ? s.auto_refresh : (prev.auto_refresh ?? true),
      slide_duration: s.slide_duration !== undefined ? s.slide_duration : (prev.slide_duration || 8),
      marquee_speed: s.marquee_speed !== undefined ? s.marquee_speed : (prev.marquee_speed || 20),
      schedule_speed: s.schedule_speed !== undefined ? s.schedule_speed : (prev.schedule_speed || 1),
      schedule_scroll_type: s.schedule_scroll_type !== undefined ? s.schedule_scroll_type : (prev.schedule_scroll_type || 'step'),
      tu_card_grid: s.tu_card_grid !== undefined ? s.tu_card_grid : (prev.tu_card_grid || '3x2')
    };

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
      merged.faculty_name,
      merged.sub_unit_name,
      merged.accreditation,
      merged.campus_location,
      merged.operational_hours,
      merged.tagline,
      merged.primary_color,
      merged.template_colors,
      merged.tv_layout,
      merged.language,
      merged.timezone,
      merged.time_on,
      merged.time_off,
      merged.auto_refresh,
      merged.slide_duration,
      merged.marquee_speed,
      merged.schedule_speed,
      merged.schedule_scroll_type,
      merged.tu_card_grid
    ]);

    res.json({ success: true, message: 'Settings berhasil disimpan!' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

