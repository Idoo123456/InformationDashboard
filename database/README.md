# Panduan Database MySQL - Dashboard Pusat Informasi UNRI

Direktori ini berisi skema dan data awal database MySQL untuk aplikasi Dashboard Pusat Informasi Kampus UNRI.

---

## 📁 Berkas di Folder Ini

1. **`database.sql`**
   - Berisi struktur lengkap seluruh tabel + data bawaan awal (data master fakultas, akun pengguna default/superadmin, template jadwal, dll.).
   - Disarankan untuk import awal di server lokal (XAMPP / MySQL Workbench / Docker).

2. **`database_structure.sql`**
   - Berisi **hanya skema DDL** (CREATE TABLE, INDEX, RELASI) tanpa data baris (clean structure).

---

## 🚀 Cara Import Database

### Cara 1: Menggunakan phpMyAdmin (XAMPP / cPanel)
1. Buka phpMyAdmin di browser (`http://localhost/phpmyadmin`).
2. Buat database baru dengan nama: `db_pusat_informasi`.
3. Klik tab **Import** pada database tersebut.
4. Pilih file `database.sql` lalu klik **Go / Kirim**.

### Cara 2: Menggunakan Terminal / CMD (MySQL CLI)
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS db_pusat_informasi;"
mysql -u root -p db_pusat_informasi < database/database.sql
```

### Cara 3: Menggunakan Migration Script Otomatis
Aplikasi juga menyediakan skrip migrasi bawaan Node.js di server:
```bash
npm run migrate
```
Skrip ini akan memeriksa koneksi dan membuat seluruh tabel yang diperlukan secara otomatis.

