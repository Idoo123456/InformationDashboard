# 🎓 Dashboard Pusat Informasi Kampus UNRI

Aplikasi sistem informasi kampus cerdas berbasis web untuk penayangan layar TV informasi (digital signage), jadwal perkuliahan & kegiatan, pengelolaan pengumuman, serta manajemen multi-TV fakultas di lingkungan Universitas Riau.

---

## 🏗️ Struktur & Arsitektur Direktori Proyek

Proyek ini telah dipisahkan secara modular antara **Frontend (React)** dan **Backend (Express API)** di tingkat root, dengan pemecahan route modular:

```text
Dashboard Pusat Informasi/
├── 📁 backend/                        # Layanan Backend API (Modular Express & Node.js)
│   ├── .env                           # Konfigurasi database MySQL & JWT secret
│   ├── db.js                          # Database connection pool (mysql2/promise)
│   ├── index.js                       # Entry point Express Server (Modular Orchestrator)
│   ├── 📁 middleware/                 # Middleware kustom
│   │   └── upload.js                  # Konfigurasi Multer untuk unggahan berkas (hingga 200MB)
│   ├── 📁 routes/                     # Router modular per domain fitur API
│   │   ├── activityLogs.js            # Audit log aktivitas sistem
│   │   ├── announcements.js           # Pengumuman running text TV
│   │   ├── auth.js                    # Autentikasi Bcrypt & JWT Token
│   │   ├── faculties.js               # Master data fakultas
│   │   ├── health.js                  # Health check server & database
│   │   ├── pics.js                    # Master data PIC ruangan
│   │   ├── rooms.js                   # Master data ruangan & kapasitas
│   │   ├── schedules.js               # Manajemen jadwal & agenda kegiatan
│   │   ├── settings.js                # Konfigurasi layout TV & tema warna
│   │   ├── slides.js                  # Manajemen media poster & video TV
│   │   ├── tvDevices.js               # Manajemen perangkat TV dinamis
│   │   ├── tvRequests.js              # Alur pengajuan TV baru dari fakultas
│   │   ├── tvScreens.js               # Monitoring 3 TV Pusat
│   │   ├── upload.js                  # Endpoint unggah flyer/video
│   │   └── users.js                   # Manajemen pengguna & role akses
│   ├── 📁 utils/                      # Helper & utilitas backend
│   │   ├── dateHelper.js              # Format tanggal aman timezone
│   │   └── logger.js                  # Helper otomatis pencatat audit log
│   ├── 📁 migrations/                 # Migrasi skema & data seeding
│   └── 📁 uploads/                    # Penyimpanan fisik media unggahan
│
├── 📁 frontend/                       # Layanan Frontend (React 19 + Vite 8)
│   ├── index.html                     # Entry template HTML Vite
│   ├── vite.config.js                 # Konfigurasi Vite & proxy backend
│   ├── 📁 public/                     # Aset publik statis (favicon, icons)
│   └── 📁 src/                        # Source code aplikasi React
│       ├── App.jsx                    # Routing & Protected Routes
│       ├── main.jsx                   # Entry point React DOM
│       ├── 📁 assets/                 # Logo resmi UNRI & latar belakang
│       ├── 📁 components/             # Komponen modular antarmuka
│       │   ├── 📁 admin/              # Komponen 14 Tab Admin Panel
│       │   └── 📁 display/            # Komponen Tampilan Layar TV (Header, Footer, Slider, dll.)
│       ├── 📁 context/                # Global State (DashboardContext)
│       ├── 📁 pages/                  # Halaman TVDisplay, AdminDashboard, Login
│       ├── 📁 styles/                 # CSS terpadu (index.css, admin.css, modern-login.css)
│       └── 📁 utils/                  # Helper format tanggal, media, dan tema
│
├── 📁 database/                       # Skema SQL & README database
│   ├── database.sql                   # Skema DDL lengkap + data bawaan awal
│   ├── database_structure.sql         # Hanya struktur skema tabel
│   └── README.md                      # Panduan import database
│
├── 📁 scripts/                        # Skrip utilitas dev & tools
├── 📁 server/                         # Backward-compatibility bridge (meneruskan ke backend)
├── dev.js                             # Runner Fullstack cerdas (menjalankan backend + frontend)
├── package.json                       # Root script manager & dependensi
├── Dockerfile                         # Multi-stage Dockerfile untuk Frontend + Nginx
├── Dockerfile.backend                 # Dockerfile untuk Backend API
├── docker-compose.yml                 # Orkestrasi Docker (DB, Backend, Nginx, phpMyAdmin)
├── nginx.conf                         # Konfigurasi Nginx Web Server
└── PANDUAN_PUBLIKASI_DAN_DEPLOYMENT.md # Dokumentasi panduan instalasi & server
```

---

## ⚡ Cara Menjalankan Aplikasi

### Mode Pengembangan (Development)
Menjalankan Backend API (`localhost:5000`) dan Frontend (`localhost:5173`) secara bersamaan:
```bash
npm run dev
```

### Menjalankan Terpisah
- **Frontend saja**: `npm run client` (Vite)
- **Backend saja**: `npm run server` (Express API)
- **Migrasi Database**: `npm run migrate`
- **Build Produksi**: `npm run build`
- **Linter**: `npm run lint`

---

## 🐳 Deployment Menggunakan Docker

Jalankan seluruh ekosistem (MySQL, Express API, dan Nginx Frontend) secara instan:
```bash
docker compose up -d --build
```
Lihat panduan lengkap di [PANDUAN_PUBLIKASI_DAN_DEPLOYMENT.md](file:///c:/Dashboard%20Pusat%20Informasi/PANDUAN_PUBLIKASI_DAN_DEPLOYMENT.md).
