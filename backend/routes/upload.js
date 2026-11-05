import express from 'express';
import pool from '../db.js';
import { upload } from '../middleware/upload.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 1. UPLOAD MEDIA SERVER (Images & Videos)
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada berkas yang diunggah.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const faculty = req.body.faculty_prefix || 'main';
  const uploadedBy = req.body.uploaded_by || 'admin';

  try {
    // Simpan ke tabel media_library
    await pool.query(
      'INSERT INTO media_library (faculty_prefix, file_name, file_path, file_type, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [faculty, req.file.originalname, fileUrl, req.file.mimetype, req.file.size, uploadedBy]
    );

    // Catat log
    await logActivity(
      uploadedBy,
      faculty,
      'UPLOAD_MEDIA',
      `Unggah berkas "${req.file.originalname}" (${(req.file.size / 1024).toFixed(1)} KB)`,
      req
    );

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error upload media:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

