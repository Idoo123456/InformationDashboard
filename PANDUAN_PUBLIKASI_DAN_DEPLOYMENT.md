# 🚀 Panduan Publikasi & Deployment Resmi (Production Ready)
## Dashboard Pusat Informasi Terpadu Universitas Riau (UNRI)

Dokumen ini adalah panduan lengkap dan siap pakai bagi tim IT / Administrator Kampus untuk mempublikasikan dan mengoperasikan sistem **Dashboard Pusat Informasi** di server lokal kampus maupun server cloud.

---

### 🏛️ 1. Ikhtisar Arsitektur Sistem
Sistem dibangun dengan arsitektur **Enterprise Multi-Tenant**:
* **Frontend**: React + Vite (Aesthetic Glassmorphism, Responsive, Realtime Marquee & Carousel).
* **Backend**: Node.js + Express (RESTful API, Bcrypt Encryption, JWT Auth, Multer Media Upload).
* **Database**: MySQL / MariaDB (`db_pusat_informasi` dengan 10 tabel terstruktur).
* **Multi-TV Central Display**: 3 Monitor TV Lobi/Kampus dapat dikontrol secara **mandiri** maupun **serentak (Broadcast)**.
* **Audit Trail**: Setiap aktivitas (login sukses/gagal, ubah setting, hapus, tambah ruang, broadcast TV) tercatat otomatis di tabel `activity_logs`.

---

### 🔑 2. Akun Bawaan (Default Credentials)

| No | Username | Password Bawaan | Peran (Role) | Hak Akses Unit / Fakultas |
|---|---|---|---|---|
| 1 | `admin` | `admin123` | **Super Admin** | Akses penuh ke seluruh 11 fakultas, TV Pusat, audit log, & kelola akun |
| 2 | `admin_fkip` | `fkip123` | Admin Fakultas | Fakultas Keguruan dan Ilmu Pendidikan (FKIP) |
| 3 | `admin_fisip` | `admin123` | Admin Fakultas | Fakultas Ilmu Sosial dan Ilmu Politik (FISIP) |
| 4 | `admin_feb` | `admin123` | Admin Fakultas | Fakultas Ekonomi dan Bisnis (FEB) |
| 5 | `admin_fmipa` | `admin123` | Admin Fakultas | Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA) |
| 6 | `admin_ft` | `admin123` | Admin Fakultas | Fakultas Teknik (FT) |

> 🔒 **Keamanan**: Seluruh password langsung di-hash otomatis menggunakan algoritma **Bcrypt** berstandar industri. Super Admin dapat mengganti password kapan saja melalui menu **Manajemen Pengguna**.

---

### 🗄️ 3. Langkah Persiapan Database (MySQL / XAMPP)

1. Buka **XAMPP Control Panel** dan pastikan modul **MySQL** dalam status **Running**.
2. Buka antarmuka database melalui browser: `http://localhost/phpmyadmin`.
3. Buat database baru bernama `db_pusat_informasi` (Collation: `utf8mb4_unicode_ci`).
4. Klik tab **Import**, pilih berkas:
   ```
   c:\Dashboard Pusat Informasi\database.sql
   ```
5. Klik tombol **Import** di bagian bawah. Seluruh 10 tabel enterprise, relasi, dan data awal akan terpasang otomatis.

---

### ⚙️ 4. Konfigurasi Lingkungan (`server/.env`)

Periksa berkas `server/.env` pada folder proyek:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_pusat_informasi
JWT_SECRET=unri_pusat_informasi_secret_key_2026_super_secure
```
*(Sesuaikan `DB_PASSWORD` jika MySQL server kampus menggunakan password root).*

---

### 🖥️ 5. Cara Menjalankan di Server Kampus

Sistem telah dilengkapi dengan fitur **All-in-One Production Serving**, di mana backend server Node.js sekaligus menyajikan antarmuka frontend (SPA) dan berkas media upload.

#### Langkah A: Build Aset Frontend
Jalankan perintah berikut pada terminal proyek:
```bash
npm run build
```
*(Proses ini menghasilkan bundle file yang teroptimasi di folder `dist/` dalam waktu 1-2 detik).*

#### Langkah B: Jalankan Server Produksi
```bash
node server/index.js
```
Server akan aktif di port `5000`.

---

### 🔄 6. Menjalankan Otomatis di Background (Autostart Windows Server)

Agar sistem selalu menyala 24/7 dan otomatis hidup kembali saat server kampus restart atau mati listrik, gunakan **PM2**:

1. Install PM2 secara global:
   ```bash
   npm install -g pm2
   npm install -g pm2-windows-startup
   ```
2. Jalankan server dengan nama proses `unri-dashboard`:
   ```bash
   pm2 start server/index.js --name "unri-dashboard"
   ```
3. Simpan konfigurasi agar otomatis berjalan saat booting:
   ```bash
   pm2-startup install
   pm2 save
   ```
4. Cek status kapan saja dengan:
   ```bash
   pm2 status
   ```

---

### 🐳 6b. Opsi Deployment Modern: Menggunakan Docker & Docker Compose (Rekomendasi Enterprise)

Jika Anda ingin menjalankan seluruh ekosistem (Database MySQL 8.0, Backend Express, dan Frontend Nginx) dalam kontainer terisolasi yang stabil dan otomatis tanpa perlu menginstall XAMPP secara manual:

#### A. Persyaratan:
- **Windows**: Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) (pilih backend WSL 2).
- **Linux (Ubuntu Server)**:
  ```bash
  sudo apt update && sudo apt install -y docker.io docker-compose-v2
  sudo systemctl enable --now docker
  ```

#### B. Cara Menjalankan dengan 1 Perintah:
Buka terminal di direktori proyek `c:\Dashboard Pusat Informasi` (atau lokasi clone di server), lalu jalankan:
```bash
docker compose up -d --build
```

#### C. Yang Dilakukan Docker Secara Otomatis:
1. **Container MySQL (`unri_dashboard_db`)**: Membuat database `db_pusat_informasi`, menjalankan otomatis `database.sql` (10 tabel, akun pengguna, dan data awal siap pakai) tanpa perlu import phpMyAdmin manual.
2. **Container Backend (`unri_dashboard_backend`)**: Menjalankan API Node.js/Express, menghubungkan otomatis ke container database.
3. **Container Frontend (`unri_dashboard_frontend`)**: Mengompilasi aplikasi React menjadi bundle production yang dilayani web server **Nginx Alpine** berkecepatan tinggi dengan kompresi gzip.

#### D. Akses Layar & Dasbor:
- **Portal Admin & Dasbor**: `http://localhost` atau `http://[IP-SERVER]`
- **Display TV Pusat**: `http://localhost/tv` atau `http://[IP-SERVER]/tv`
- **Display TV Fakultas**: `http://localhost/fkip/tv` atau `http://[IP-SERVER]/fkip/tv`

#### E. Perintah Manajemen Docker:
```bash
# Melihat status kontainer yang berjalan
docker compose ps

# Melihat log aplikasi secara realtime
docker compose logs -f backend

# Menghentikan seluruh sistem kontainer
docker compose down

# Menghentikan kontainer dan menghapus volume data jika ingin reset bersih
docker compose down -v
```

---

### 📺 7. URL Layar TV Display Kampus

Cukup buka browser (Google Chrome / Edge) di masing-masing Smart TV atau Mini PC TV, lalu tekan tombol `F11` (Full Screen):

| Lokasi TV Display | URL TV Display | Keterangan |
|---|---|---|
| **TV 1 (Lobi Utama Rektorat)** | `http://[IP-SERVER]:5000/tv?screen=1` | Konfigurasi Layout & Warna TV 1 |
| **TV 2 (Lobi UPA Perpustakaan)** | `http://[IP-SERVER]:5000/tv?screen=2` | Konfigurasi Layout & Warna TV 2 |
| **TV 3 (Gedung PKM / Publik)** | `http://[IP-SERVER]:5000/tv?screen=3` | Konfigurasi Layout & Warna TV 3 |
| **TV Display Fakultas FKIP** | `http://[IP-SERVER]:5000/fkip/tv` | Konten khusus agenda & slide FKIP |
| **TV Display Fakultas FISIP** | `http://[IP-SERVER]:5000/fisip/tv` | Konten khusus agenda & slide FISIP |
| **TV Display Fakultas FEB** | `http://[IP-SERVER]:5000/feb/tv` | Konten khusus agenda & slide FEB |
| **TV Display Fakultas FMIPA** | `http://[IP-SERVER]:5000/fmipa/tv` | Konten khusus agenda & slide FMIPA |
| **TV Display Fakultas FT** | `http://[IP-SERVER]:5000/ft/tv` | Konten khusus agenda & slide FT |

---

### 🛡️ 8. Fitur Keamanan & Audit yang Tersedia
1. **Bcrypt Password Security**: Semua sandi terenkripsi satu arah dengan salt cost 10.
2. **JWT Authentication**: Akses token berbasis JSON Web Token untuk validasi session.
3. **Multi-Tenant Protection**: Operator fakultas hanya berwenang mengubah konten fakultasnya sendiri.
4. **Audit Trail Realtime**: Setiap aksi tercatat dengan IP Address client, nama pengguna, waktu presisi WIB, dan status aktivitas.
5. **Server Media Uploads**: Berkas gambar dan video flyer tersimpan permanen di server (`server/uploads/`) dan dapat diakses bersamaan oleh seluruh monitor TV di jaringan kampus.

---
**Status Sistem**: ✅ *100% Siap Pakai & Siap Dipublikasikan di Lingkungan Universitas Riau.*
