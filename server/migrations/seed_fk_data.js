import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_pusat_informasi',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  console.log('Connected to DB');

  // 1. Seed Rooms for Fakultas Kedokteran (FK)
  const fkRooms = [
    { name: 'Ruang Senat Fakultas Kedokteran', category: 'Ruang Rapat', building: 'Gedung Dekanat FK', floor: 'Lt. 2', capacity: 50, facilities: 'AC, Proyektor, Sound System, Smart TV' },
    { name: 'Ruang Kuliah Teater FK (Auditorium)', category: 'Auditorium', building: 'Gedung Pembelajaran FK', floor: 'Lt. 1', capacity: 200, facilities: 'AC, Proyektor Laser, Panggung, Sound System 5000W' },
    { name: 'Laboratorium Biomedik & Anatomi', category: 'Laboratorium', building: 'Gedung Lab FK', floor: 'Lt. 2', capacity: 60, facilities: 'AC, Mikroskop Digital, Meja Kadavar, Lemari Asam' },
    { name: 'Ruang Tutorial PBL (Problem Based Learning)', category: 'Ruang Kolaborasi', building: 'Gedung Dekanat FK', floor: 'Lt. 3', capacity: 20, facilities: 'AC, Smart TV, Whiteboard, Meja Bundar Modular' },
    { name: 'Ruang Skill Lab & OSCE Center', category: 'Laboratorium', building: 'Gedung Klinik FK', floor: 'Lt. 3', capacity: 40, facilities: 'AC, Manikin Medis, Bed Pasien, Kamera Evaluasi OSCE' },
    { name: 'Ruang Ujian Komputer (CBT Center FK)', category: 'Ruang Kuliah Bersama', building: 'Gedung CBT FK', floor: 'Lt. 2', capacity: 100, facilities: 'AC, 100 PC Dedicated, Server Lokal, CCTV Pengawas' }
  ];

  for (const r of fkRooms) {
    const [exist] = await conn.query('SELECT id FROM rooms WHERE faculty_prefix = ? AND name = ?', ['fk', r.name]);
    if (exist.length === 0) {
      await conn.query(
        'INSERT INTO rooms (faculty_prefix, name, category, building, floor, capacity, facilities) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['fk', r.name, r.category, r.building, r.floor, r.capacity, r.facilities]
      );
      console.log('Inserted FK room:', r.name);
    } else {
      console.log('FK room already exists:', r.name);
    }
  }

  // 2. Seed Sample Schedules for FK
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const fkSchedules = [
    {
      date: todayStr,
      start_time: '08:00',
      end_time: '11:30',
      title: 'Ujian OSCE Komprehensif Dokter Muda',
      description: 'Ujian keterampilan klinis stase ilmu kesehatan anak dan bedah',
      loc: 'Ruang Skill Lab & OSCE Center',
      status: 'Berlangsung',
      pic: 'dr. Evi Susanti, Sp.A',
      partner_category: 'Internal'
    },
    {
      date: todayStr,
      start_time: '13:00',
      end_time: '15:30',
      title: 'Tutorial PBL Skenario Blok Kardiovaskular',
      description: 'Diskusi kelompok kecil mahasiswa tahap sarjana kedokteran',
      loc: 'Ruang Tutorial PBL (Problem Based Learning)',
      status: 'Akan Datang',
      pic: 'dr. Gusti Maya Sari, Sp.JP',
      partner_category: 'Internal'
    },
    {
      date: todayStr,
      start_time: '16:00',
      end_time: '17:30',
      title: 'Rapat Persiapan Akreditasi LAM-PTKes FK',
      description: 'Koordinasi pimpinan dekanat dan tim penjaminan mutu fakultas',
      loc: 'Ruang Senat Fakultas Kedokteran',
      status: 'Akan Datang',
      pic: 'Dekanat FK UNRI',
      partner_category: 'Internal'
    }
  ];

  for (const s of fkSchedules) {
    const [exist] = await conn.query('SELECT id FROM schedules WHERE faculty_prefix = ? AND title = ?', ['fk', s.title]);
    if (exist.length === 0) {
      await conn.query(
        'INSERT INTO schedules (faculty_prefix, date, start_time, end_time, title, description, loc, status, pic, partner_category, target_tvs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['fk', s.date, s.start_time, s.end_time, s.title, s.description, s.loc, s.status, s.pic, s.partner_category, JSON.stringify([])]
      );
      console.log('Inserted FK schedule:', s.title);
    }
  }

  // 3. Seed Sample Slide for FK
  const [existSlide] = await conn.query('SELECT id FROM slides WHERE faculty_prefix = ?', ['fk']);
  if (existSlide.length === 0) {
    await conn.query(`
      INSERT INTO slides (faculty_prefix, tag, title, description, btn_text, btn_link, bg, qr_url, qr_label, is_media_only, media_type, sort_order)
      VALUES (
        'fk',
        'FAKULTAS KEDOKTERAN',
        'Pusat Informasi & Layanan Terpadu FK UNRI',
        'Selamat datang di Sistem Digital Signage Fakultas Kedokteran Universitas Riau.',
        'Portal FK',
        'https://fk.unri.ac.id',
        'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        'https://fk.unri.ac.id',
        'Scan Info FK',
        0,
        'none',
        1
      )
    `);
    console.log('Inserted FK slide.');
  }

  // 4. Seed Settings for FK
  const [existSettings] = await conn.query('SELECT faculty_prefix FROM settings WHERE faculty_prefix = ?', ['fk']);
  if (existSettings.length === 0) {
    await conn.query(`
      INSERT INTO settings (faculty_prefix, faculty_name, sub_unit_name, accreditation, campus_location, operational_hours, tagline, primary_color)
      VALUES (
        'fk',
        'Fakultas Kedokteran',
        'Universitas Riau',
        'Akreditasi Unggul (LAM-PTKes)',
        'Kampus Bina Widya Km 12.5 Pekanbaru',
        '08:00 - 16:00 WIB',
        'Unggul, Bermartabat, dan Berdaya Saing Global',
        '#059669'
      )
    `);
    console.log('Inserted FK settings.');
  }

  await conn.end();
  console.log('Seed FK completed successfully.');
}

run().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

