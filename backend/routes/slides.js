import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 6. SLIDES (BANNER DIGITAL SIGNAGE & MEDIA DISPLAY)
router.get('/:prefix', async (req, res) => {
  const { prefix } = req.params;
  const { tv, device, all } = req.query;
  const targetTvFilter = tv || device;

  try {
    let rows;
    if (prefix === 'main' || all === 'true') {
      // Super Admin: Melihat seluruh slide kampus
      const [allRows] = await pool.query(
        'SELECT * FROM slides ORDER BY CASE WHEN faculty_prefix = "main" THEN 0 ELSE 1 END, sort_order ASC, id ASC'
      );
      rows = allRows;
    } else {
      // Fakultas: Hanya melihat slide milik fakultas tersebut
      const [facRows] = await pool.query(
        'SELECT * FROM slides WHERE faculty_prefix = ? ORDER BY sort_order ASC, id ASC',
        [prefix]
      );
      rows = facRows;
    }

    const formatted = rows.map(r => {
      let targetTvs = [];
      if (r.target_tvs) {
        try {
          targetTvs = typeof r.target_tvs === 'string' ? JSON.parse(r.target_tvs) : r.target_tvs;
          if (!Array.isArray(targetTvs)) targetTvs = [];
        } catch {
          targetTvs = String(r.target_tvs).split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      return {
        id: r.id,
        faculty_prefix: r.faculty_prefix,
        tag: r.tag || '',
        title: r.title || '',
        desc: r.description || '',
        description: r.description || '',
        btnText: r.btn_text || '',
        btnLink: r.btn_link || '',
        bg: r.bg || 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        bgColor: r.bg || 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        qr: r.qr_url || '',
        qrUrl: r.qr_url || '',
        qrLabel: r.qr_label || 'Scan QR',
        mediaType: r.media_type || 'none',
        mediaUrl: r.media_url || '',
        isMediaOnly: Boolean(r.is_media_only),
        mediaFit: r.media_fit || 'cover',
        duration: r.duration !== null && r.duration !== undefined ? Number(r.duration) : null,
        targetTvs: targetTvs,
        target_tvs: targetTvs,
        sortOrder: r.sort_order || 0,
        createdAt: r.created_at || null,
        created_at: r.created_at || null,
        isActive: r.is_active !== undefined ? Boolean(r.is_active) : true,
        is_active: r.is_active !== undefined ? Boolean(r.is_active) : true
      };
    });

    // Jika parameter filter TV diberikan, filter slide yang ditargetkan untuk TV tersebut atau global
    if (targetTvFilter) {
      const filtered = formatted.filter(s => {
        if (!s.targetTvs || s.targetTvs.length === 0 || s.targetTvs.includes('all')) {
          return true; // Ditampilkan di semua TV
        }
        return s.targetTvs.some(t => String(t) === String(targetTvFilter));
      });
      return res.json(filtered);
    }

    res.json(formatted);
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:prefix/bulk', async (req, res) => {
  const { prefix } = req.params;
  const { slides } = req.body;
  if (!Array.isArray(slides)) {
    return res.status(400).json({ error: 'slides must be an array' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM slides WHERE faculty_prefix = ?', [prefix]);

    for (let idx = 0; idx < slides.length; idx++) {
      const s = slides[idx];
      const validMediaType = ['image', 'video'].includes(s.mediaType) ? s.mediaType : 'none';
      const titleVal = typeof s.title === 'string' ? s.title : (s.title ? String(s.title) : 'Informasi');
      const isMediaOnlyVal = Boolean(s.isMediaOnly) ? 1 : 0;
      const mediaFitVal = s.mediaFit || 'cover';
      const btnLinkVal = s.btnLink || s.btn_link || '';
      
      // Target TV list (JSON array string)
      const targetTvsVal = JSON.stringify(s.targetTvs || s.target_tvs || []);
      
      // Durasi kustom per slide (dalam detik; null jika mengikuti default TV / auto)
      let durationVal = null;
      if (s.duration !== undefined && s.duration !== null && s.duration !== '') {
        const parsed = parseInt(s.duration, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          durationVal = parsed;
        }
      }

      await connection.query(
        `INSERT INTO slides (
          faculty_prefix, tag, title, description, btn_text, btn_link, bg, qr_url, qr_label, 
          media_type, media_url, is_media_only, media_fit, duration, target_tvs, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prefix,
          s.tag || '',
          titleVal,
          s.desc || s.description || '',
          s.btnText || '',
          btnLinkVal,
          s.bg || s.bgColor || 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          s.qr || s.qrUrl || '',
          s.qrLabel || 'Scan QR',
          validMediaType,
          s.mediaUrl || '',
          isMediaOnlyVal,
          mediaFitVal,
          durationVal,
          targetTvsVal,
          idx + 1
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, count: slides.length });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk slides error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

export default router;

