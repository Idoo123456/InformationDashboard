import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = path.resolve('.');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'manual_book', 'screenshots');
const OUTPUT_HTML = path.join(ROOT_DIR, 'manual_book', 'Manual_Book_Dashboard_Pusat_Informasi_UNRI.html');
const OUTPUT_PDF = path.join(ROOT_DIR, 'manual_book', 'Manual_Book_Dashboard_Pusat_Informasi_UNRI.pdf');

function getBase64Image(filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1);
    return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${fileData.toString('base64')}`;
  } catch (e) {
    console.warn(`Could not read image ${filePath}:`, e.message);
    return '';
  }
}

const logoUnri = getBase64Image(path.join(ROOT_DIR, 'frontend', 'src', 'assets', 'logounri.png'));
const imgTvDisplay = getBase64Image(path.join(SCREENSHOTS_DIR, '01_tv_display.png'));
const imgLogin = getBase64Image(path.join(SCREENSHOTS_DIR, '02_login_page.png'));
const imgLoginFilled = getBase64Image(path.join(SCREENSHOTS_DIR, '02b_login_filled.png'));
const imgOverview = getBase64Image(path.join(SCREENSHOTS_DIR, '03_admin_overview.png'));
const imgSettings = getBase64Image(path.join(SCREENSHOTS_DIR, '04_settings_tab.png'));
const imgSlides = getBase64Image(path.join(SCREENSHOTS_DIR, '05_slides_tab.png'));
const imgSchedules = getBase64Image(path.join(SCREENSHOTS_DIR, '06_schedules_tab.png'));
const imgScheduleCal = getBase64Image(path.join(SCREENSHOTS_DIR, '06b_schedule_calendar_view.png'));
const imgScheduleKanvas = getBase64Image(path.join(SCREENSHOTS_DIR, '06c_schedule_kanvas_view.png'));
const imgScheduleModal = getBase64Image(path.join(SCREENSHOTS_DIR, '07_schedule_modal.png'));
const imgAnnounce = getBase64Image(path.join(SCREENSHOTS_DIR, '08_announcements_tab.png'));
const imgReports = getBase64Image(path.join(SCREENSHOTS_DIR, '09_reports_tab.png'));
const imgRooms = getBase64Image(path.join(SCREENSHOTS_DIR, '10_room_manager_tab.png'));
const imgTvDevices = getBase64Image(path.join(SCREENSHOTS_DIR, '11_tv_devices_tab.png'));
const imgUsers = getBase64Image(path.join(SCREENSHOTS_DIR, '12_user_manager_tab.png'));
const imgLogs = getBase64Image(path.join(SCREENSHOTS_DIR, '13_activity_logs_tab.png'));
const imgFacultyTv = getBase64Image(path.join(SCREENSHOTS_DIR, '14_faculty_tv_fkip.png'));

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Panduan Penggunaan - Dashboard Pusat Informasi Kampus UNRI</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    /* Page Breaks */
    .page-break {
      page-break-before: always;
    }

    .no-break {
      page-break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5rem 2rem 2rem;
      background: linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
      color: #ffffff;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .cover-page::after {
      content: "";
      position: absolute;
      top: -150px;
      right: -150px;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%);
      border-radius: 50%;
    }

    .cover-header {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .cover-logo {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.95);
      padding: 8px;
      border-radius: 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .cover-inst-title {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #f8fafc;
      margin: 0;
    }

    .cover-inst-sub {
      font-size: 0.95rem;
      color: #93c5fd;
      margin: 0.2rem 0 0;
      font-weight: 500;
    }

    .cover-body {
      margin: auto 0;
      padding: 2rem 0;
    }

    .cover-badge {
      display: inline-block;
      padding: 0.4rem 1.1rem;
      background: rgba(59, 130, 246, 0.3);
      border: 1px solid rgba(147, 197, 253, 0.4);
      color: #bfdbfe;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }

    .cover-title {
      font-size: 2.5rem;
      font-weight: 900;
      line-height: 1.15;
      margin: 0 0 1rem;
      color: #ffffff;
      text-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    .cover-subtitle {
      font-size: 1.15rem;
      line-height: 1.5;
      color: #e2e8f0;
      max-width: 650px;
      margin: 0;
    }

    .cover-meta {
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 1.25rem 1.75rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .cover-meta-item h4 {
      margin: 0;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }

    .cover-meta-item p {
      margin: 0.25rem 0 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    /* Headings */
    h1.chapter-title {
      font-size: 1.7rem;
      font-weight: 800;
      color: #1e3a8a;
      border-bottom: 2.5px solid #2563eb;
      padding-bottom: 0.45rem;
      margin-top: 1.8rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 750;
      color: #0f172a;
      margin-top: 1.4rem;
      margin-bottom: 0.6rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e40af;
      margin-top: 1.1rem;
      margin-bottom: 0.4rem;
    }

    p {
      margin: 0 0 0.75rem;
      text-align: justify;
    }

    /* Table of contents */
    .toc-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.5rem 1.75rem;
      margin: 1.5rem 0;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 0.4rem 0;
      border-bottom: 1px dotted #cbd5e1;
      font-size: 0.92rem;
    }

    .toc-item:last-child {
      border-bottom: none;
    }

    .toc-title {
      font-weight: 600;
      color: #1e293b;
    }

    .toc-sub {
      padding-left: 1.5rem;
      font-size: 0.86rem;
      color: #475569;
    }

    /* Image Figure Styling */
    .figure-container {
      margin: 1.25rem 0;
      text-align: center;
      page-break-inside: avoid;
    }

    .figure-frame {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      background: #ffffff;
      display: inline-block;
      max-width: 100%;
    }

    .figure-frame img {
      width: 100%;
      height: auto;
      display: block;
      max-height: 480px;
      object-fit: contain;
    }

    .figure-caption {
      margin-top: 0.45rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }

    .figure-badge {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.78rem;
      font-weight: 700;
    }

    /* Step lists */
    .steps-list {
      list-style: none;
      counter-reset: step-counter;
      padding-left: 0;
      margin: 1rem 0;
    }

    .steps-list > li {
      counter-increment: step-counter;
      position: relative;
      padding-left: 2.5rem;
      margin-bottom: 0.9rem;
    }

    .steps-list > li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0;
      width: 1.75rem;
      height: 1.75rem;
      background: #2563eb;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
    }

    .step-title {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.98rem;
      margin-bottom: 0.2rem;
    }

    /* Callouts & Alert Boxes */
    .alert-box {
      border-radius: 8px;
      padding: 0.85rem 1.1rem;
      margin: 1rem 0;
      font-size: 0.92rem;
      page-break-inside: avoid;
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
    }

    .alert-icon {
      font-size: 1.2rem;
      line-height: 1;
      padding-top: 0.1rem;
    }

    .alert-info {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }

    .alert-warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }

    .alert-success {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      color: #065f46;
    }

    .alert-danger {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.88rem;
      page-break-inside: avoid;
    }

    table.data-table th {
      background: #1e3a8a;
      color: #ffffff;
      text-align: left;
      padding: 0.6rem 0.85rem;
      font-weight: 700;
      border: 1px solid #1e3a8a;
    }

    table.data-table td {
      padding: 0.55rem 0.85rem;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }

    table.data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .badge-pill {
      display: inline-block;
      padding: 0.15rem 0.55rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-purple { background: #ede9fe; color: #5b21b6; }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1rem 0;
      page-break-inside: avoid;
    }

    .feature-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem 1rem;
      border-top: 3px solid #2563eb;
    }

    .feature-card h4 {
      margin: 0 0 0.35rem;
      color: #1e3a8a;
      font-size: 0.95rem;
    }

    .feature-card p {
      margin: 0;
      font-size: 0.85rem;
      color: #475569;
    }
  </style>
</head>
<body>

  <!-- ==================== HALAMAN SAMPUL / COVER ==================== -->
  <div class="cover-page">
    <div class="cover-header">
      <img src="${logoUnri}" alt="Logo UNRI" class="cover-logo">
      <div>
        <h3 class="cover-inst-title">Universitas Riau</h3>
        <p class="cover-inst-sub">Pusat Informasi & Layanan Terpadu Kampus Terintegrasi</p>
      </div>
    </div>

    <div class="cover-body">
      <span class="cover-badge">Buku Panduan Resmi (Official User Manual)</span>
      <h1 class="cover-title">MANUAL BOOK &amp; PANDUAN PENGGUNAAN</h1>
      <p class="cover-subtitle">
        Sistem Informasi Digital Signage Terpadu, Manajemen Agenda Kampus, Penayangan Layar TV Cerdas, serta Pengelolaan Multi-Fakultas Universitas Riau.
      </p>
    </div>

    <div class="cover-meta">
      <div class="cover-meta-item">
        <h4>Versi Dokumen</h4>
        <p>Edisi 2.4.0 (Enterprise)</p>
      </div>
      <div class="cover-meta-item">
        <h4>Peruntukan Pengguna</h4>
        <p>Super Admin, Admin Fakultas &amp; Operator</p>
      </div>
      <div class="cover-meta-item">
        <h4>Tanggal Rilis</h4>
        <p>November 2026</p>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== DAFTAR ISI ==================== -->
  <h1 class="chapter-title">📑 DAFTAR ISI</h1>
  <div class="toc-container">
    <div class="toc-item">
      <span class="toc-title">BAB 1. PENDAHULUAN &amp; GAMBARAN UMUM SISTEM</span>
      <span>Halaman 3</span>
    </div>
    <div class="toc-item toc-sub">
      <span>1.1 Deskripsi &amp; Tujuan Aplikasi</span>
    </div>
    <div class="toc-item toc-sub">
      <span>1.2 Arsitektur Multi-Tenant Terpadu (Pusat &amp; 10 Fakultas)</span>
    </div>
    <div class="toc-item toc-sub">
      <span>1.3 Peran Pengguna &amp; Tingkat Hak Akses (Role Based Access)</span>
    </div>
    <div class="toc-item toc-sub">
      <span>1.4 Spesifikasi Perangkat Keras &amp; Browser yang Didukung</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 2. AKSES SISTEM &amp; AUTENTIKASI LOGIN</span>
      <span>Halaman 5</span>
    </div>
    <div class="toc-item toc-sub">
      <span>2.1 Mengakses Halaman Login</span>
    </div>
    <div class="toc-item toc-sub">
      <span>2.2 Tata Cara Masuk Akun Superadmin &amp; Admin Fakultas</span>
    </div>
    <div class="toc-item toc-sub">
      <span>2.3 Fitur Keamanan &amp; Prosedur Logout</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 3. PANDUAN PENAYANGAN LAYAR TV DISPLAY (DIGITAL SIGNAGE)</span>
      <span>Halaman 7</span>
    </div>
    <div class="toc-item toc-sub">
      <span>3.1 Membuka Tampilan Layar TV (Pusat &amp; Fakultas)</span>
    </div>
    <div class="toc-item toc-sub">
      <span>3.2 Struktur &amp; Komponen Visual Antarmuka Layar TV</span>
    </div>
    <div class="toc-item toc-sub">
      <span>3.3 Mode Layar Penuh (Full Screen F11) &amp; Pengoperasian Smart TV</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 4. DASBOR ADMINISTRATOR: MENU RINGKASAN (OVERVIEW)</span>
      <span>Halaman 9</span>
    </div>
    <div class="toc-item toc-sub">
      <span>4.1 Membaca Indikator Statistik Cepat</span>
    </div>
    <div class="toc-item toc-sub">
      <span>4.2 Memantau Status Sinkronisasi Database MySQL</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 5. MANAJEMEN JADWAL &amp; AGENDA KEGIATAN KAMPUS</span>
      <span>Halaman 11</span>
    </div>
    <div class="toc-item toc-sub">
      <span>5.1 Memilih Mode Tampilan: Tabel, Kalender, dan Kanvas</span>
    </div>
    <div class="toc-item toc-sub">
      <span>5.2 Langkah Menambahkan Agenda Baru (Modal Form Entri)</span>
    </div>
    <div class="toc-item toc-sub">
      <span>5.3 Sistem Deteksi &amp; Proteksi Bentrok Ruangan Otomatis</span>
    </div>
    <div class="toc-item toc-sub">
      <span>5.4 Mengubah, Menghapus, dan Memfilter Jadwal</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 6. MANAJEMEN MEDIA BANNER &amp; VIDEO SLIDE</span>
      <span>Halaman 15</span>
    </div>
    <div class="toc-item toc-sub">
      <span>6.1 Menambahkan Slide Informasi Baru</span>
    </div>
    <div class="toc-item toc-sub">
      <span>6.2 Mengunggah Gambar Poster dengan Fitur Crop Interaktif</span>
    </div>
    <div class="toc-item toc-sub">
      <span>6.3 Mengunggah Media Video (Hingga 200MB)</span>
    </div>
    <div class="toc-item toc-sub">
      <span>6.4 Pengaturan QR Code, Target TV, dan Urutan Tampil (Sort Order)</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 7. MANAJEMEN PENGUMUMAN (RUNNING TEXT / MARQUEE)</span>
      <span>Halaman 18</span>
    </div>
    <div class="toc-item toc-sub">
      <span>7.1 Menambahkan Teks Berjalan</span>
    </div>
    <div class="toc-item toc-sub">
      <span>7.2 Tingkat Prioritas (Normal, Penting, Mendesak) &amp; Tanggal Kadaluwarsa</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 8. PENGATURAN UMUM &amp; KUSTOMISASI TAMPILAN TV</span>
      <span>Halaman 20</span>
    </div>
    <div class="toc-item toc-sub">
      <span>8.1 Profil Fakultas / Unit Kampus</span>
    </div>
    <div class="toc-item toc-sub">
      <span>8.2 Memilih Layout Tampilan Layar TV (Standard, TU, Agenda, Full Media)</span>
    </div>
    <div class="toc-item toc-sub">
      <span>8.3 Kustomisasi Palet Warna Tema &amp; Kecepatan Animasi Gulir</span>
    </div>
    <div class="toc-item toc-sub">
      <span>8.4 Konfigurasi Jadwal Otomatis (Auto On / Auto Off)</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 9. MASTER DATA RUANGAN KAMPUS</span>
      <span>Halaman 23</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 10. KELOLA PERANGKAT TV &amp; ALUR PENGAJUAN FAKULTAS</span>
      <span>Halaman 25</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 11. LAPORAN &amp; REKAPITULASI AGENDA</span>
      <span>Halaman 27</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 12. MANAJEMEN PENGGUNA &amp; HAK AKSES (SUPER ADMIN)</span>
      <span>Halaman 29</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 13. LOG AKTIVITAS &amp; AUDIT TRAIL SISTEM</span>
      <span>Halaman 31</span>
    </div>

    <div class="toc-item">
      <span class="toc-title">BAB 14. PANDUAN PEMECAHAN MASALAH (TROUBLESHOOTING) &amp; FAQ</span>
      <span>Halaman 33</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== BAB 1 ==================== -->
  <h1 class="chapter-title">BAB 1. PENDAHULUAN &amp; GAMBARAN UMUM SISTEM</h1>
  
  <h2>1.1 Deskripsi &amp; Tujuan Aplikasi</h2>
  <p>
    <strong>Sistem Dashboard Pusat Informasi Kampus Universitas Riau</strong> adalah platform terintegrasi berbasis web yang dirancang khusus untuk memenuhi kebutuhan publikasi informasi digital (<em>Digital Signage</em>), penayangan agenda kegiatan harian, pengumuman darurat, serta pengelolaan konten informasi visual di seluruh lingkungan Universitas Riau.
  </p>
  <p>
    Aplikasi ini dibangun untuk menjembatani komunikasi antara pihak pimpinan rektorat, pengelola fakultas, staf kependidikan, dosen, serta mahasiswa dan tamu kampus melalui media layar televisi cerdas (Smart TV) yang ditempatkan di titik-titik strategis seperti lobi rektorat, dekanat fakultas, perpustakaan utama, dan aula gedung pertemuan.
  </p>

  <div class="features-grid">
    <div class="feature-card">
      <h4>📺 Digital Signage Multi-Layout</h4>
      <p>Mendukung 4 variasi layout layar TV (Standard, Tata Usaha/TU, Agenda Focus, dan Full Media) yang responsif untuk berbagai resolusi layar 16:9 (Full HD hingga 4K UHD).</p>
    </div>
    <div class="feature-card">
      <h4>⚡ Real-time Synchronization</h4>
      <p>Setiap perubahan jadwal, poster promosi, atau teks pengumuman yang disimpan admin langsung terbarukan di layar TV tanpa perlu me-refresh browser secara manual.</p>
    </div>
    <div class="feature-card">
      <h4>🛡️ Deteksi Bentrok Ruangan</h4>
      <p>Fitur cerdas yang secara otomatis mencegah pemesanan ganda (<em>double booking</em>) pada ruangan dan jam yang sama dengan memberikan peringatan visual kepada operator.</p>
    </div>
    <div class="feature-card">
      <h4>🏛️ Arsitektur Multi-Fakultas</h4>
      <p>Mendukung partisi data independen untuk 10 Fakultas dan Kantor Pusat Rektorat melalui sistem routing URL prefix dinamis.</p>
    </div>
  </div>

  <h2>1.2 Arsitektur Multi-Tenant Terpadu</h2>
  <p>
    Aplikasi menerapkan skema <em>Multi-Tenancy</em> tingkat lanjut. Setiap fakultas memiliki ruang kerja dan konfigurasi tersendiri tanpa bercampur dengan fakultas lain, namun tetap dapat dipantau secara terpusat oleh Super Administrator di Rektorat:
  </p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%;">Prefix URL</th>
        <th style="width: 45%;">Nama Fakultas / Unit Kerja</th>
        <th style="width: 40%;">URL Layar TV Publik</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>main</strong></td>
        <td>Universitas Riau (Kantor Pusat Rektorat)</td>
        <td><code>http://[domain]/tv</code></td>
      </tr>
      <tr>
        <td><strong>fkip</strong></td>
        <td>Fakultas Keguruan dan Ilmu Pendidikan</td>
        <td><code>http://[domain]/fkip/tv</code></td>
      </tr>
      <tr>
        <td><strong>fisip</strong></td>
        <td>Fakultas Ilmu Sosial dan Ilmu Politik</td>
        <td><code>http://[domain]/fisip/tv</code></td>
      </tr>
      <tr>
        <td><strong>feb</strong></td>
        <td>Fakultas Ekonomi dan Bisnis</td>
        <td><code>http://[domain]/feb/tv</code></td>
      </tr>
      <tr>
        <td><strong>fmipa</strong></td>
        <td>Fakultas Matematika dan Ilmu Pengetahuan Alam</td>
        <td><code>http://[domain]/fmipa/tv</code></td>
      </tr>
      <tr>
        <td><strong>ft</strong></td>
        <td>Fakultas Teknik</td>
        <td><code>http://[domain]/ft/tv</code></td>
      </tr>
      <tr>
        <td><strong>fp</strong></td>
        <td>Fakultas Pertanian</td>
        <td><code>http://[domain]/fp/tv</code></td>
      </tr>
      <tr>
        <td><strong>fpk</strong></td>
        <td>Fakultas Perikanan dan Kelautan</td>
        <td><code>http://[domain]/fpk/tv</code></td>
      </tr>
      <tr>
        <td><strong>fk</strong></td>
        <td>Fakultas Kedokteran</td>
        <td><code>http://[domain]/fk/tv</code></td>
      </tr>
      <tr>
        <td><strong>hukum</strong></td>
        <td>Fakultas Hukum</td>
        <td><code>http://[domain]/hukum/tv</code></td>
      </tr>
      <tr>
        <td><strong>fkp</strong></td>
        <td>Fakultas Keperawatan</td>
        <td><code>http://[domain]/fkp/tv</code></td>
      </tr>
    </tbody>
  </table>

  <h2>1.3 Peran Pengguna &amp; Tingkat Hak Akses</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Peran (Role)</th>
        <th style="width: 35%;">Cakupan Wewenang</th>
        <th style="width: 45%;">Fitur yang Dapat Diakses</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge-pill badge-red">superadmin</span></td>
        <td>Pengelola Sistem Utama (Pusat Rektorat)</td>
        <td>Akses penuh ke semua fakultas, kelola seluruh pengguna, setujui pengajuan TV, audit log kampus, pengaturan master global.</td>
      </tr>
      <tr>
        <td><span class="badge-pill badge-blue">admin</span></td>
        <td>Administrator Fakultas / Sub-Unit</td>
        <td>Kelola jadwal kegiatan fakultas, upload banner &amp; video slide, kelola pengumuman running text, ajukan penambahan TV baru.</td>
      </tr>
      <tr>
        <td><span class="badge-pill badge-amber">operator</span></td>
        <td>Petugas Operasional / TU</td>
        <td>Input dan edit agenda kegiatan harian, memperbarui status agenda (Berlangsung / Selesai).</td>
      </tr>
    </tbody>
  </table>

  <h2>1.4 Spesifikasi Perangkat Keras &amp; Browser</h2>
  <div class="alert-box alert-info">
    <div class="alert-icon">💡</div>
    <div>
      <strong>Rekomendasi Lingkungan Operasional:</strong><br>
      • <strong>Layar TV Display:</strong> Smart TV (Android TV / WebOS / Tizen) atau TV LED biasa yang terhubung dengan TV Box / Mini PC, koneksi HDMI, rasio 16:9 (1920x1080 Full HD atau 3840x2160 4K).<br>
      • <strong>Peramban Web (Browser):</strong> Google Chrome (versi 110+), Microsoft Edge (versi 110+), atau Mozilla Firefox terbaru dengan fitur autoplay video diaktifkan.<br>
      • <strong>Jaringan:</strong> Koneksi LAN atau Wi-Fi stabil dengan bandwidth minimal 5 Mbps untuk streaming slide video lancar.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== BAB 2 ==================== -->
  <h1 class="chapter-title">BAB 2. AKSES SISTEM &amp; AUTENTIKASI LOGIN</h1>

  <h2>2.1 Mengakses Halaman Login</h2>
  <p>
    Untuk mengelola informasi dan tampilan layar TV, administrator harus terlebih dahulu masuk ke halaman autentikasi dasbor. Halaman login dirancang modern dengan tampilan latar belakang kampus dan perlindungan otentikasi berbasis token JWT serta enkripsi sandi Bcrypt.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgLogin}" alt="Halaman Login Sistem">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 2.1</span> Tampilan Antarmuka Halaman Login Dashboard Pusat Informasi UNRI
    </div>
  </div>

  <h2>2.2 Prosedur Masuk Akun</h2>
  <p>Ikuti langkah-langkah berikut untuk melakukan login ke dalam sistem:</p>
  
  <ol class="steps-list">
    <li>
      <div class="step-title">Buka Peramban Web (Browser)</div>
      Buka peramban Google Chrome atau Microsoft Edge, lalu ketik alamat URL:
      <br>• Untuk Dasbor Utama Rektorat: <code>http://[alamat-server]:5173/login</code>
      <br>• Untuk Dasbor Fakultas (contoh FKIP): <code>http://[alamat-server]:5173/fkip/login</code>
    </li>
    <li>
      <div class="step-title">Masukkan Nama Pengguna (Username)</div>
      Ketik username yang telah didaftarkan oleh administrator (contoh: <code>admin</code> untuk superadmin pusat, atau <code>admin_fkip</code> untuk admin fakultas).
    </li>
    <li>
      <div class="step-title">Ketik Kata Sandi (Password)</div>
      Masukkan kata sandi akun Anda. Anda dapat mengklik ikon mata di sisi kanan kolom password untuk menampilkan atau menyembunyikan teks sandi demi memastikan ketepatan ketikan.
    </li>
    <li>
      <div class="step-title">Klik Tombol "Masuk ke Dasbor"</div>
      Klik tombol biru <strong>Masuk ke Dasbor</strong> atau tekan tombol <strong>Enter</strong> pada keyboard. Sistem akan memverifikasi kredensial Anda dan langsung mengarahkan Anda ke Dasbor Administrator sesuai dengan hak akses unit kerja Anda.
    </li>
  </ol>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgLoginFilled}" alt="Form Login Terisi">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 2.2</span> Pengisian Kredensial Login dan Validasi Form
    </div>
  </div>

  <div class="alert-box alert-warning">
    <div class="alert-icon">⚠️</div>
    <div>
      <strong>Perhatian Keamanan Sandi:</strong><br>
      Jangan pernah membagikan username dan password kepada pihak yang tidak berwenang. Jika terjadi kesalahan ketik sandi berulang kali, pastikan tombol <em>Caps Lock</em> pada keyboard dalam kondisi mati.
    </div>
  </div>

  <h2>2.3 Prosedur Keluar (Logout)</h2>
  <p>
    Demi keamanan data sistem, selalu lakukan logout setelah selesai melakukan pembaruan konten:
  </p>
  <ol class="steps-list">
    <li>
      <div class="step-title">Akses Menu Sisi Kiri (Sidebar)</div>
      Perhatikan bagian paling bawah dari panel navigasi sebelah kiri.
    </li>
    <li>
      <div class="step-title">Klik Tombol "Keluar Dasbor"</div>
      Klik tombol merah dengan ikon pintu keluar <strong>Keluar Dasbor</strong>. Sistem akan menghapus token autentikasi dari peramban secara aman dan mengembalikan Anda ke halaman login.
    </li>
  </ol>

  <div class="page-break"></div>

  <!-- ==================== BAB 3 ==================== -->
  <h1 class="chapter-title">BAB 3. PANDUAN PENAYANGAN LAYAR TV DISPLAY (DIGITAL SIGNAGE)</h1>

  <h2>3.1 Membuka Layar TV Display</h2>
  <p>
    Tampilan Layar TV (TV Display) adalah halaman antarmuka publik yang dirancang khusus untuk ditayangkan terus-menerus pada layar televisi atau monitor informasi kampus. Halaman ini bebas dari tombol navigasi admin dan secara otomatis menyesuaikan aspek rasio 16:9.
  </p>
  <p>
    Anda dapat membuka tampilan TV melalui tautan berikut:
    <br>• Tampilan TV Pusat Rektorat: <code>http://[alamat-server]:5173/tv</code>
    <br>• Tampilan TV Fakultas (contoh FKIP): <code>http://[alamat-server]:5173/fkip/tv</code>
    <br>• Melalui Dasbor Admin: Klik tombol hijau <strong>"Lihat TV Display"</strong> pada bagian bawah navigasi sidebar.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgTvDisplay}" alt="Tampilan Layar Utama TV Informasi UNRI">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 3.1</span> Tampilan Layar TV Display Utama Universitas Riau (Layout Standard)
    </div>
  </div>

  <h2>3.2 Struktur &amp; Komponen Visual Antarmuka Layar TV</h2>
  <p>Tampilan layar TV informasi tersusun atas 4 zona informasi utama:</p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Komponen Zona</th>
        <th style="width: 75%;">Deskripsi &amp; Fungsi Konten</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Header Identitas Kampus (Atas)</strong></td>
        <td>Memuat logo resmi Universitas Riau, nama unit kerja/fakultas, status akreditasi unggul, jam digital realtime presisi detik, dan tanggal Masehi lengkap dengan penyesuaian zona waktu WIB.</td>
      </tr>
      <tr>
        <td><strong>2. Area Slide Informasi &amp; Video (Tengah Kiri)</strong></td>
        <td>Slideshow dinamis yang memutar poster promosi kegiatan kampus, flyer pengumuman akademik, video profil, atau instruksi pendaftaran disertai QR Code interaktif yang dapat dipindai pengunjung menggunakan smartphone.</td>
      </tr>
      <tr>
        <td><strong>3. Panel Agenda &amp; Jadwal Kegiatan (Tengah Kanan)</strong></td>
        <td>Daftar kegiatan harian terpadu yang menampilkan nama acara, lokasi ruangan/gedung, jam pelaksanaan, nama penanggung jawab (PIC), serta badge status dinamis (<em>Sedang Berlangsung</em>, <em>Akan Datang</em>, <em>Selesai</em>) dengan animasi auto-scroll.</td>
      </tr>
      <tr>
        <td><strong>4. Running Text Ticker (Bawah)</strong></td>
        <td>Pita pengumuman berjalan (marquee) di bagian footer yang menampilkan warta kilat, peringatan penting, serta pesan sambutan pimpinan secara berulang.</td>
      </tr>
    </tbody>
  </table>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgFacultyTv}" alt="Tampilan TV Fakultas FKIP">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 3.2</span> Tampilan TV Display Khusus Fakultas (Contoh: FKIP UNRI dengan Tagline &amp; Jadwal Lokal)
    </div>
  </div>

  <h2>3.3 Mengaktifkan Mode Layar Penuh (Full Screen F11)</h2>
  <div class="alert-box alert-success">
    <div class="alert-icon">📺</div>
    <div>
      <strong>Petunjuk Pemasangan pada Smart TV / TV Display:</strong><br>
      1. Buka URL TV display di peramban Chrome / Browser TV.<br>
      2. Tekan tombol <strong>F11</strong> pada keyboard untuk mengaktifkan mode Layar Penuh (Kiosk Full Screen) sehingga bilah alamat URL dan tab browser tersembunyi sepenuhnya.<br>
      3. Layar TV akan secara berkala menyinkronkan data secara otomatis tanpa memerlukan intervensi petugas.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== BAB 4 ==================== -->
  <h1 class="chapter-title">BAB 4. DASBOR ADMINISTRATOR: MENU RINGKASAN (OVERVIEW)</h1>

  <h2>4.1 Membaca Indikator Statistik Cepat</h2>
  <p>
    Setelah login berhasil, Anda langsung disambut oleh halaman <strong>Ringkasan (Overview)</strong>. Tab ini memberikan pemantauan menyeluruh terhadap status ekosistem informasi kampus Anda dalam satu pandangan.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgOverview}" alt="Dasbor Ringkasan Overview">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 4.1</span> Dasbor Ringkasan (Overview Tab) dengan Kartu Statistik dan Pemantau Server
    </div>
  </div>

  <h2>4.2 Elemen-Elemen pada Menu Ringkasan</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Elemen Antarmuka</th>
        <th style="width: 75%;">Kegunaan &amp; Informasi yang Ditampilkan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Kartu Statistik Agenda</strong></td>
        <td>Menampilkan total agenda kegiatan yang terdaftar untuk hari ini, jumlah agenda yang sedang berlangsung saat ini, dan agenda yang dijadwalkan pada hari-hari mendatang.</td>
      </tr>
      <tr>
        <td><strong>Kartu Statistik Media Slide</strong></td>
        <td>Menghitung jumlah poster dan media video aktif yang saat ini sedang berputar pada tayangan slideshow layar TV.</td>
      </tr>
      <tr>
        <td><strong>Kartu Running Text</strong></td>
        <td>Menunjukkan jumlah pengumuman aktif yang sedang berjalan di pita teks ticker footer layar.</td>
      </tr>
      <tr>
        <td><strong>Status Koneksi Database</strong></td>
        <td>Indikator hijau bertuliskan <em>"Terhubung ke MySQL"</em> menandakan bahwa komunikasi dengan server database lokal/pusat berjalan prima. Jika database mati, muncul indikator merah peringatan.</td>
      </tr>
      <tr>
        <td><strong>Pemilih Mode Layout Overview</strong></td>
        <td>Tombol toggle di kanan atas yang memungkinkan Anda beralih antara gaya visual <em>Modern</em> (dengan kartu berbayang modern) dan <em>Classic</em> (tabel ringkas).</td>
      </tr>
    </tbody>
  </table>

  <div class="alert-box alert-info">
    <div class="alert-icon">ℹ️</div>
    <div>
      <strong>Tips Administrator:</strong> Selalu periksa kartu indikator saat pertama kali membuka dasbor di pagi hari untuk memastikan seluruh jadwal perkuliahan, rapat senat, atau ujian skripsi hari tersebut telah terisi dengan benar.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== BAB 5 ==================== -->
  <h1 class="chapter-title">BAB 5. MANAJEMEN JADWAL &amp; AGENDA KEGIATAN KAMPUS</h1>

  <h2>5.1 Memilih Mode Tampilan Jadwal</h2>
  <p>
    Menu <strong>Jadwal Kegiatan</strong> adalah modul inti untuk mengelola seluruh agenda penggunaan ruangan, seminar, sidang, dan rapat di lingkungan kampus. Modul ini dilengkapi dengan 3 variasi sudut pandang:
    <br>1. <strong>Tampilan Tabel (List View):</strong> Menyajikan data dalam baris tabel terperinci dengan tombol aksi edit, hapus, dan target TV.
    <br>2. <strong>Tampilan Kalender (Calendar View):</strong> Memetakan agenda dalam bentuk kalender bulanan interaktif.
    <br>3. <strong>Tampilan Kanvas / Grid (Kanban View):</strong> Mengelompokkan agenda berdasarkan status (Akan Datang, Berlangsung, Selesai) dalam bentuk kartu visual.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgSchedules}" alt="Manajemen Jadwal Kegiatan Tampilan Tabel">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 5.1</span> Modul Jadwal Kegiatan dalam Tampilan Tabel Lengkap dengan Pencarian &amp; Tombol Aksi
    </div>
  </div>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgScheduleCal}" alt="Tampilan Kalender Agenda">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 5.2</span> Tampilan Kalender Bulanan Interaktif untuk Melihat Kepadatan Agenda Kampus
    </div>
  </div>

  <h2>5.2 Langkah Menambahkan Agenda Baru</h2>
  <p>Untuk memasukkan agenda kegiatan baru ke dalam jadwal penayangan TV:</p>

  <ol class="steps-list">
    <li>
      <div class="step-title">Klik Tombol "Entri Baru"</div>
      Pada halaman Jadwal Kegiatan, klik tombol hijau <strong>+ Entri Baru</strong> yang berada di pojok kanan atas tabel. Jendela pop-up (Modal) Form Tambah Agenda akan muncul.
    </li>
    <li>
      <div class="step-title">Isi Nama Kegiatan</div>
      Ketik judul acara secara jelas dan ringkas (contoh: <em>Rapat Senat Terbuka Wisuda Sarjana</em>).
    </li>
    <li>
      <div class="step-title">Tentukan Ruangan / Lokasi Kegiatan</div>
      Pilih nama ruangan dari menu dropdown yang tersedia (misal: <em>Studio Gurindam 12</em> atau <em>Ruang Senat Lt. 5</em>). Anda juga dapat mengetikkan nama lokasi khusus jika acara diadakan di luar ruangan.
    </li>
    <li>
      <div class="step-title">Pilih Tanggal Pelaksanaan</div>
      Tentukan tanggal acara berlangsung menggunakan pemilih tanggal (date picker).
    </li>
    <li>
      <div class="step-title">Atur Waktu Mulai &amp; Waktu Selesai</div>
      Tentukan jam mulai (misal: <code>08:30</code>) dan jam berakhir (misal: <code>11:30</code>). Sistem secara otomatis memvalidasi bahwa jam selesai harus lebih besar dari jam mulai.
    </li>
    <li>
      <div class="step-title">Tentukan Penyelenggara (PIC) &amp; Kategori Mitra</div>
      Isi nama biro, fakultas, atau organisasi pelaksana (contoh: <em>Biro Umum</em>) dan kategori mitra (<em>Internal</em> atau <em>Eksternal</em>).
    </li>
    <li>
      <div class="step-title">Pilih Target Layar TV Penayangan</div>
      Secara bawaan agenda akan ditayangkan di semua TV (<em>Semua Layar TV</em>). Jika agenda hanya relevan untuk lobi tertentu, centang nama TV yang diinginkan.
    </li>
    <li>
      <div class="step-title">Simpan Entri</div>
      Klik tombol biru <strong>Simpan Jadwal</strong>. Sistem akan menyimpan data ke database MySQL dan seketika menyinkronkannya ke tampilan TV.
    </li>
  </ol>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgScheduleModal}" alt="Form Modal Tambah Jadwal Kegiatan">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 5.3</span> Modal Form Entri Jadwal Baru dengan Validasi Jam, Ruangan, dan Target Layar TV
    </div>
  </div>

  <h2>5.3 Sistem Deteksi &amp; Proteksi Bentrok Ruangan Otomatis</h2>
  <div class="alert-box alert-danger">
    <div class="alert-icon">🛡️</div>
    <div>
      <strong>Fitur Cerdas Pencegah Bentrok (Anti-Collision System):</strong><br>
      Jika seorang operator mencoba menyimpan agenda di suatu ruangan pada tanggal dan rentang jam yang bersamaan dengan agenda lain yang sudah disetujui, sistem akan <strong>menolak penyimpanan</strong> dan memunculkan pop-up peringatan merah yang memperlihatkan nama acara yang bentrok, jam bentrok, serta nama PIC terkait. Operator harus memilih jam lain atau ruangan pengganti.
    </div>
  </div>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgScheduleKanvas}" alt="Tampilan Kanvas Grid Jadwal">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 5.4</span> Tampilan Kanvas (Kanban Grid) untuk Memantau Alur Status Kegiatan
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== BAB 6 ==================== -->
  <h1 class="chapter-title">BAB 6. MANAJEMEN MEDIA BANNER &amp; VIDEO SLIDE</h1>

  <h2>6.1 Gambaran Umum Modul Media Slide</h2>
  <p>
    Modul <strong>Manajemen Slide</strong> digunakan untuk mengelola materi promosi visual yang tayang bergantian di sebelah kiri layar TV. Setiap slide dapat berupa poster gambar statis, video bergerak, atau kartu informasi dengan tautan digital.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgSlides}" alt="Manajemen Slide dan Media TV">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 6.1</span> Antarmuka Manajemen Slide Media Banner, Video, dan Pengaturan Durasi
    </div>
  </div>

  <h2>6.2 Langkah Mengunggah &amp; Menyesuaikan Poster (Image Cropper)</h2>
  <p>Untuk menambahkan poster baru:</p>
  <ol class="steps-list">
    <li>
      <div class="step-title">Klik Tombol "+ Tambah Slide"</div>
      Sebuah kartu slide baru akan terbentuk pada daftar antrean.
    </li>
    <li>
      <div class="step-title">Isi Judul, Tag Kategori, dan Deskripsi</div>
      Ketik tag (misal: <em>AKADEMIK</em>), judul slide (misal: <em>Sosialisasi MBKM Semester Genap</em>), dan deskripsi pendukung.
    </li>
    <li>
      <div class="step-title">Unggah Berkas Gambar</div>
      Klik tombol <strong>Unggah Poster</strong> pada kartu. Pilih berkas gambar (.jpg atau .png) dari komputer Anda.
    </li>
    <li>
      <div class="step-title">Lakukan Pemotongan (Cropping)</div>
      Fitur <em>Image Cropper</em> bawaan akan terbuka secara otomatis. Geser kotak pembatas untuk menyesuaikan fokus gambar agar pas dengan rasio penayangan TV tanpa terpotong atau terdistorsi. Klik <strong>Simpan Crop</strong>.
    </li>
    <li>
      <div class="step-title">Tautkan Tautan QR Code (Opsional)</div>
      Masukkan URL website atau formulir pendaftaran pendaftaran di kolom <em>Tautan QR</em>. Sistem akan meng-generate QR Code yang langsung terpampang di samping poster pada layar TV sehingga mahasiswa dapat langsung memindai dengan kamera ponsel mereka.
    </li>
  </ol>

  <h2>6.3 Mengunggah Media Video (Hingga 200MB)</h2>
  <div class="alert-box alert-info">
    <div class="alert-icon">🎬</div>
    <div>
      <strong>Dukungan Video Resolusi Tinggi:</strong><br>
      Aplikasi mendukung unggahan berkas video dalam format <code>.mp4</code> atau <code>.webm</code> hingga ukuran <strong>200 Megabytes</strong>. Video yang diunggah akan otomatis diputar berulang (looping) secara mulus pada layar TV.
    </div>
  </div>

  <h2>6.4 Mengatur Durasi &amp; Menyimpan Perubahan</h2>
  <p>
    Di bagian atas tab slide, Anda dapat menentukan <strong>Durasi Tampil Slide</strong> (default 8 detik per slide). Setelah selesai menambah atau merapikan urutan slide, pastikan Anda menekan tombol hitam <strong>Simpan Semua Slide</strong> agar konten termutakhir dikirimkan ke layar TV.
  </p>

  <div class="page-break"></div>

  <!-- ==================== BAB 7 ==================== -->
  <h1 class="chapter-title">BAB 7. MANAJEMEN PENGUMUMAN (RUNNING TEXT / MARQUEE)</h1>

  <h2>7.1 Fungsi Running Text</h2>
  <p>
    Teks pengumuman berjalan (running text) di bagian bawah layar TV merupakan saluran komunikasi tercepat untuk menyampaikan maklumat mendadak, ucapan selamat datang kepada tamu kehormatan rektorat, atau pengingat tanggal krusial akademik.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgAnnounce}" alt="Manajemen Pengumuman Running Text">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 7.1</span> Modul Pengelolaan Pengumuman Teks Berjalan dengan Level Prioritas
    </div>
  </div>

  <h2>7.2 Langkah Pengelolaan Pengumuman</h2>
  <ol class="steps-list">
    <li>
      <div class="step-title">Menambahkan Teks Baru</div>
      Ketik isi pesan pengumuman pada kotak input yang disediakan di bagian atas modul, lalu klik tombol <strong>+ Tambah Teks</strong>.
    </li>
    <li>
      <div class="step-title">Menentukan Level Prioritas</div>
      Pilih derajat urgensi pengumuman:
      <br>• <span class="badge-pill badge-blue">Normal</span>: Informasi reguler kampus.
      <br>• <span class="badge-pill badge-amber">Penting</span>: Pengingat administratif dengan batas waktu dekat.
      <br>• <span class="badge-pill badge-red">Mendesak</span>: Instruksi evakuasi, perubahan jadwal darurat, atau maklumat pimpinan.
    </li>
    <li>
      <div class="step-title">Mengatur Tanggal Kedaluwarsa</div>
      Tentukan tanggal kapan pengumuman tersebut otomatis dinonaktifkan agar pengumuman yang sudah kedaluwarsa tidak terus berjalan di layar TV.
    </li>
    <li>
      <div class="step-title">Simpan ke Database</div>
      Klik tombol <strong>Simpan Pengumuman</strong> untuk merilis pesan secara langsung ke layar TV.
    </li>
  </ol>

  <div class="page-break"></div>

  <!-- ==================== BAB 8 ==================== -->
  <h1 class="chapter-title">BAB 8. PENGATURAN UMUM &amp; KUSTOMISASI TAMPILAN TV</h1>

  <h2>8.1 Profil Fakultas &amp; Personalisasi Identitas</h2>
  <p>
    Tab <strong>Pengaturan Umum</strong> memberikan keleluasaan penuh bagi administrator untuk memodifikasi profil unit kerja, gaya tampilan visual layar TV, palet warna branding, hingga jadwal hidup dan mati otomatis layar televisi.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgSettings}" alt="Pengaturan Umum dan Desain TV">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 8.1</span> Panel Pengaturan Umum: Identitas Kampus, Pilihan Layout TV, dan Konfigurasi Timer
    </div>
  </div>

  <h2>8.2 Pilihan Layout Tampilan Layar TV</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Model Layout</th>
        <th style="width: 75%;">Karakteristik &amp; Skenario Penempatan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Standard Layout</strong></td>
        <td>Tata letak seimbang 50:50 antara media poster di sisi kiri dan daftar agenda jadwal di sisi kanan. Sangat cocok untuk lobi gedung utama rektorat dan selasar dekanat.</td>
      </tr>
      <tr>
        <td><strong>2. Tata Usaha (TU Grid)</strong></td>
        <td>Menampilkan jadwal dalam bentuk petak kartu (grid) 3x2 atau 3x3 yang menonjolkan lokasi ruangan dan PIC. Ideal diletakkan di kantor layanan administrasi akademik fakultas.</td>
      </tr>
      <tr>
        <td><strong>3. Agenda Focus</strong></td>
        <td>Memperluas area daftar jadwal menjadi 70% dari lebar layar dan memperkecil banner media. Cocok untuk lobi aula gedung ujian seminar dan ruang perkuliahan bersama.</td>
      </tr>
      <tr>
        <td><strong>4. Full Media Display</strong></td>
        <td>Menampilkan poster banner dan video dalam ukuran 100% layar penuh dengan strip ticker minimalis di bawah. Ideal saat pameran inovasi kampus, wisuda, atau dies natalis.</td>
      </tr>
    </tbody>
  </table>

  <h2>8.3 Palet Warna Tema &amp; Kecepatan Animasi Gulir</h2>
  <p>
    Administrator dapat memilih warna primer identitas (contoh: Biru Royal UNRI <code>#1e40af</code>, Hijau FKIP <code>#10b981</code>, atau Merah Hukum <code>#dc2626</code>) menggunakan fitur <em>Color Picker</em> interaktif. Anda juga dapat mengatur kecepatan teks marquee berjalan dan interval waktu scroll daftar agenda agar mudah dibaca oleh pejalan kaki.
  </p>

  <div class="page-break"></div>

  <!-- ==================== BAB 9 ==================== -->
  <h1 class="chapter-title">BAB 9. MASTER DATA RUANGAN KAMPUS</h1>

  <h2>9.1 Fungsi Master Ruangan</h2>
  <p>
    Menu <strong>Master Ruangan</strong> berfungsi sebagai basis data seluruh fasilitas fisik ruangan, gedung rapat, auditorium, dan studio yang dimiliki kampus. Data ini secara langsung menjadi acuan dropdown pemilihan lokasi saat operator membuat jadwal kegiatan baru.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgRooms}" alt="Master Data Ruangan">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 9.1</span> Manajemen Master Ruangan Lengkap dengan Kapasitas, Gedung, dan Fasilitas
    </div>
  </div>

  <h2>9.2 Menambah &amp; Mengedit Data Ruangan</h2>
  <ol class="steps-list">
    <li>
      <div class="step-title">Buka Tab "Master Ruangan"</div>
      Klik menu <strong>Master Ruangan</strong> pada navigasi sebelah kiri.
    </li>
    <li>
      <div class="step-title">Klik Tombol "+ Tambah Ruangan"</div>
      Isi nama ruangan (misal: <em>Auditorium Utama Rektorat</em>), kategori (<em>Ruang Rapat</em>, <em>Studio Multimedia</em>, atau <em>Aula Kuliah</em>), gedung, lantai, dan kapasitas orang maksimal.
    </li>
    <li>
      <div class="step-title">Daftarkan Fasilitas Ruangan</div>
      Ketik daftar fasilitas yang tersedia (contoh: <em>Sound System, Proyektor Laser, AC Central, Video Wall</em>).
    </li>
    <li>
      <div class="step-title">Atur Status Ketersediaan</div>
      Gunakan saklar toggle untuk menentukan apakah ruangan sedang aktif dibuka untuk reservasi atau sedang dalam masa perbaikan/renovasi.
    </li>
  </ol>

  <div class="page-break"></div>

  <!-- ==================== BAB 10 ==================== -->
  <h1 class="chapter-title">BAB 10. KELOLA PERANGKAT TV &amp; ALUR PENGAJUAN FAKULTAS</h1>

  <h2>10.1 Manajemen Perangkat TV</h2>
  <p>
    Setiap televisi yang terpasang di lingkungan kampus terdaftar dengan identitas unik, kode pairing, lokasi pemasangan, dan penugasan fakultas. Modul ini memungkinkan Super Admin memantau apakah layar televisi tersebut sedang berstatus online atau offline.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgTvDevices}" alt="Kelola Perangkat TV Kampus">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 10.1</span> Daftar Monitoring Perangkat Layar TV dan Persetujuan Permohonan Baru
    </div>
  </div>

  <h2>10.2 Alur Pengajuan TV Baru oleh Fakultas</h2>
  <div class="alert-box alert-success">
    <div class="alert-icon">📝</div>
    <div>
      <strong>Alur Kerja Pengajuan Perangkat TV Baru:</strong><br>
      1. <strong>Fakultas Mengajukan:</strong> Admin Fakultas membuka tab <em>Layar TV &amp; Pengajuan</em>, mengisi nama lokasi penempatan (contoh: <em>Lobi Gedung Dosen FKIP</em>) dan model TV.<br>
      2. <strong>Notifikasi Pending ke Pusat:</strong> Super Admin di Rektorat akan melihat badge merah penanda pengajuan baru pada menu <em>Kelola Perangkat TV</em>.<br>
      3. <strong>Persetujuan (Approval):</strong> Super Admin memeriksa permohonan dan mengklik tombol hijau <strong>Setujui Pengajuan</strong>.<br>
      4. <strong>URL Aktif Diterbitkan:</strong> Sistem secara otomatis menghasilkan URL unik display (misal: <code>/display/tv-fkip-lobi</code>) yang siap ditautkan ke Smart TV fakultas.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== BAB 11 ==================== -->
  <h1 class="chapter-title">BAB 11. LAPORAN &amp; REKAPITULASI AGENDA</h1>

  <h2>11.1 Menyaring &amp; Menganalisis Data Agenda</h2>
  <p>
    Menu <strong>Laporan Agenda</strong> memberikan ringkasan riwayat seluruh kegiatan yang telah dan akan terlaksana dalam periode tertentu. Modul ini sangat berguna bagi pimpinan universitas untuk mengevaluasi efektivitas pemanfaatan aset sarana prasarana kampus.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgReports}" alt="Laporan dan Rekapitulasi Agenda">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 11.1</span> Modul Laporan Agenda dengan Filter Periode Tanggal, Kategori Mitra, dan Ekspor
    </div>
  </div>

  <h2>11.2 Fitur Ekspor &amp; Pencetakan Laporan</h2>
  <p>
    Anda dapat memfilter laporan berdasarkan:
    <br>• Rentang Tanggal Mulai s/d Tanggal Selesai
    <br>• Status Kegiatan (Semua, Akan Datang, Berlangsung, Selesai)
    <br>• Pencarian kata kunci nama PIC atau nama ruangan
  </p>
  <p>
    Setelah hasil filter muncul, klik tombol <strong>Cetak / Simpan PDF</strong> untuk menghasilkan lembar rekapitulasi resmi siap cetak untuk lampiran laporan kinerja berkala fakultas.
  </p>

  <div class="page-break"></div>

  <!-- ==================== BAB 12 ==================== -->
  <h1 class="chapter-title">BAB 12. MANAJEMEN PENGGUNA &amp; HAK AKSES (SUPER ADMIN)</h1>

  <h2>12.1 Pengelolaan Akun Pengguna</h2>
  <p>
    Hak kelola pengguna hanya dapat diakses oleh akun dengan peran <strong>Super Administrator</strong> di kantor pusat rektorat. Modul ini menjamin tata kelola tata usaha yang tertib dan akuntabel di mana tiap operator fakultas hanya dapat mengelola data unit kerjanya sendiri.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgUsers}" alt="Manajemen Pengguna dan Hak Akses">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 12.1</span> Modul Manajemen Pengguna untuk Penambahan Admin Fakultas dan Reset Kata Sandi
    </div>
  </div>

  <h2>12.2 Menambahkan Admin Fakultas Baru</h2>
  <ol class="steps-list">
    <li>
      <div class="step-title">Klik Tombol "+ Tambah Pengguna Baru"</div>
      Formulir pendaftaran akun operator akan ditampilkan.
    </li>
    <li>
      <div class="step-title">Isi Data Diri Operator</div>
      Ketik Nama Lengkap, Alamat Email resmi institusi, nomor telepon, dan Username unik.
    </li>
    <li>
      <div class="step-title">Pilih Unit Fakultas / Rektorat</div>
      Pilih fakultas tempat operator bertugas (misal: <em>Fakultas Teknik</em>). Pilihan ini akan mengunci hak akses pengguna hanya pada URL prefix fakultas tersebut (misal: <code>/ft/admin</code>).
    </li>
    <li>
      <div class="step-title">Tentukan Role &amp; Buat Kata Sandi Awal</div>
      Pilih peran (<em>Admin</em> atau <em>Operator</em>) dan ketik kata sandi awal yang aman, lalu klik <strong>Daftarkan Pengguna</strong>.
    </li>
  </ol>

  <div class="page-break"></div>

  <!-- ==================== BAB 13 ==================== -->
  <h1 class="chapter-title">BAB 13. LOG AKTIVITAS &amp; AUDIT TRAIL SISTEM</h1>

  <h2>13.1 Fungsi Audit Log</h2>
  <p>
    Modul <strong>Log Aktivitas Kampus</strong> mencatat seluruh jejak rekam digital (audit trail) operasional sistem secara real-time. Setiap aksi login, perubahan jadwal, pengunggahan poster, hingga penghapusan pengumuman dicatat secara kronologis lengkap dengan stempel waktu dan identitas pelakunya.
  </p>

  <div class="figure-container">
    <div class="figure-frame">
      <img src="${imgLogs}" alt="Log Aktivitas Kampus">
    </div>
    <div class="figure-caption">
      <span class="figure-badge">Gambar 13.1</span> Catatan Audit Log Aktivitas Real-time untuk Menjamin Akuntabilitas Sistem
    </div>
  </div>

  <h2>13.2 Informasi yang Dicatat dalam Log</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Atribut Log</th>
        <th style="width: 80%;">Penjelasan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Stempel Waktu</strong></td>
        <td>Waktu presisi detik saat tindakan dilakukan oleh pengguna.</td>
      </tr>
      <tr>
        <td><strong>Nama Pengguna (User)</strong></td>
        <td>Username operator atau admin yang mengeksekusi tindakan.</td>
      </tr>
      <tr>
        <td><strong>Aksi / Tindakan</strong></td>
        <td>Jenis operasi data (misal: <code>CREATE_SCHEDULE</code>, <code>UPDATE_SLIDE</code>, <code>DELETE_ANNOUNCEMENT</code>, <code>USER_LOGIN</code>).</td>
      </tr>
      <tr>
        <td><strong>Keterangan Detail</strong></td>
        <td>Rincian objek yang dimodifikasi (misal: <em>"Menambahkan jadwal: Rapat AMI di Ruang Senat Lt.5"</em>).</td>
      </tr>
      <tr>
        <td><strong>Fakultas Terkait</strong></td>
        <td>Prefix unit fakultas lokasi aktivitas berlangsung.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== BAB 14 ==================== -->
  <h1 class="chapter-title">BAB 14. PANDUAN PEMECAHAN MASALAH (TROUBLESHOOTING) &amp; FAQ</h1>

  <h2>14.1 Panduan Mengatasi Kendala Teknis</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Gejala Masalah</th>
        <th style="width: 35%;">Kemungkinan Penyebab</th>
        <th style="width: 40%;">Langkah Solusi Praktis</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Layar TV Hitam / Menampilkan Halaman Kosong</strong></td>
        <td>Peramban web di Smart TV belum terhubung ke jaringan internet/intranet kampus atau URL salah ketik.</td>
        <td>Periksa koneksi kabel LAN atau Wi-Fi pada TV. Pastikan alamat URL di peramban tepat (misal: <code>http://[ip-server]:5173/tv</code>). Tekan reload (F5) pada peramban.</td>
      </tr>
      <tr>
        <td><strong>Video di Slide Tidak Berputar Otomatis</strong></td>
        <td>Kebijakan keamanan autoplay browser memblokir video yang memiliki suara (audio).</td>
        <td>Aplikasi secara default mematikan suara (mute) pada video TV signage agar dapat diputar otomatis. Jika masih terblokir, buka setelan peramban Chrome: <em>Settings &gt; Privacy &amp; Security &gt; Site Settings &gt; Sound / Autoplay &gt; Allow</em>.</td>
      </tr>
      <tr>
        <td><strong>Peringatan "Database Terputus!" Saat Menyimpan</strong></td>
        <td>Layanan database MySQL pada server lokal/pusat dalam kondisi mati (stopped).</td>
        <td>Pastikan modul MySQL di XAMPP atau Docker container dalam status <strong>Running</strong>. Lakukan uji konektivitas dengan membuka <code>http://[ip-server]:5000/api/health</code>.</td>
      </tr>
      <tr>
        <td><strong>Muncul Peringatan "Bentrok Ruangan" Saat Menambah Jadwal</strong></td>
        <td>Ruangan yang dipilih telah dijadwalkan untuk acara lain pada jam yang sama.</td>
        <td>Periksa rincian jam acara lain di Tampilan Kalender atau ubah jam pelaksanaan acara baru agar tidak bertubrukan dengan agenda sebelumnya.</td>
      </tr>
      <tr>
        <td><strong>Ukuran File Unggahan Ditolak Server</strong></td>
        <td>Ukuran file video melebihi batas 200MB atau file bukan format video resmi (.mp4).</td>
        <td>Lakukan kompresi video menggunakan aplikasi seperti HandBrake dengan resolusi 1080p, pastikan ukuran di bawah 200MB sebelum diunggah kembali.</td>
      </tr>
    </tbody>
  </table>

  <h2>14.2 Pertanyaan yang Sering Diajukan (FAQ)</h2>
  
  <div style="margin-top: 1rem;">
    <h3 style="color: #1e3a8a; margin-bottom: 0.2rem;">Q1: Apakah TV perlu dimatikan secara manual setiap sore hari?</h3>
    <p>
      <strong>Jawab:</strong> Tidak wajib. Sistem telah dilengkapi fitur <strong>Jadwal Operasional Otomatis</strong> pada tab Pengaturan Umum. Anda dapat mengatur <em>Jam Aktif (06:00 WIB)</em> dan <em>Jam Nonaktif (22:00 WIB)</em>. Pada luar jam tersebut, tampilan layar TV akan otomatis meredup atau menampilkan layar jeda hemat daya.
    </p>

    <h3 style="color: #1e3a8a; margin-bottom: 0.2rem;">Q2: Bisakah satu fakultas memiliki lebih dari 3 layar TV di lokasi berbeda?</h3>
    <p>
      <strong>Jawab:</strong> Sangat bisa. Fakultas dapat mengajukan penambahan perangkat TV melalui tab <em>Layar TV &amp; Pengajuan</em>. Setelah disetujui Super Admin, tiap layar TV dapat menampilkan konten yang sama atau konten khusus per ruangan.
    </p>

    <h3 style="color: #1e3a8a; margin-bottom: 0.2rem;">Q3: Jika listrik kampus padam, apakah data jadwal yang baru dibuat akan hilang?</h3>
    <p>
      <strong>Jawab:</strong> Tidak. Seluruh data jadwal, slide, dan konfigurasi tersimpan permanen di database MySQL server secara transaksional dengan perlindungan auto-commit.
    </p>
  </div>

  <div class="alert-box alert-info" style="margin-top: 1.5rem;">
    <div class="alert-icon">📞</div>
    <div>
      <strong>Layanan Bantuan &amp; Dukungan Teknis:</strong><br>
      Unit Pelaksana Teknis Teknologi Informasi dan Komunikasi (UPT TIK) / Pusat Informasi Universitas Riau.<br>
      Gedung Rektorat Kampus Bina Widya Km. 12.5 Pekanbaru, Riau.<br>
      Email Bantuan Teknis: <code>tik@unri.ac.id</code> | Helpdesk: ext. 104
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
console.log('HTML Manual Book generated at:', OUTPUT_HTML);

async function convertHtmlToPdf() {
  console.log('Converting HTML to PDF using Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.goto('file:///' + OUTPUT_HTML.replace(/\\\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  console.log('Printing to PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '14mm',
      right: '14mm'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 8pt; font-family: 'Segoe UI', Tahoma, sans-serif; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm;">
        <span>Buku Panduan Penggunaan - Dashboard Pusat Informasi Kampus UNRI</span>
        <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();
  console.log('PDF successfully generated at:', OUTPUT_PDF);
  const stats = fs.statSync(OUTPUT_PDF);
  console.log('PDF File Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
}

convertHtmlToPdf().catch(err => {
  console.error('Failed to convert HTML to PDF:', err);
});
