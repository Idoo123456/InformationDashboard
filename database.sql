-- ========================================================
-- Database: db_pusat_informasi
-- Sistem Dashboard Pusat Informasi Kampus (Enterprise Edition)
-- Universitas Riau
-- ========================================================

CREATE DATABASE IF NOT EXISTS `db_pusat_informasi` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `db_pusat_informasi`;

-- --------------------------------------------------------
-- 1. Tabel: faculties (Master Fakultas & Unit Kampus)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `faculties`;
CREATE TABLE `faculties` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT,
    `dean_or_head` VARCHAR(100),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `faculties` (`code`, `name`, `slug`, `description`) VALUES
('PUSAT', 'Universitas Riau (Kantor Pusat Rektorat)', 'main', 'Gedung Rektorat Kampus Bina Widya'),
('FKIP', 'Fakultas Keguruan dan Ilmu Pendidikan', 'fkip', 'Kampus Bina Widya Km 12.5'),
('FISIP', 'Fakultas Ilmu Sosial dan Ilmu Politik', 'fisip', 'Kampus Bina Widya Km 12.5'),
('FEB', 'Fakultas Ekonomi dan Bisnis', 'feb', 'Kampus Bina Widya Km 12.5'),
('FMIPA', 'Fakultas Matematika dan Ilmu Pengetahuan Alam', 'fmipa', 'Kampus Bina Widya Km 12.5'),
('FT', 'Fakultas Teknik', 'ft', 'Kampus Bina Widya Km 12.5'),
('FP', 'Fakultas Pertanian', 'fp', 'Kampus Bina Widya Km 12.5'),
('FPK', 'Fakultas Perikanan dan Kelautan', 'fpk', 'Kampus Bina Widya Km 12.5'),
('FK', 'Fakultas Kedokteran', 'fk', 'Kampus Diponegoro'),
('FH', 'Fakultas Hukum', 'hukum', 'Kampus Bina Widya Km 12.5'),
('FKP', 'Fakultas Keperawatan', 'fkp', 'Kampus Bina Widya Km 12.5');

-- --------------------------------------------------------
-- 2. Tabel: users (Pengguna & Operator Fakultas)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100),
    `phone` VARCHAR(30),
    `faculty_prefix` VARCHAR(20) NOT NULL DEFAULT 'main',
    `role` ENUM('superadmin', 'admin', 'operator') DEFAULT 'admin',
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `password`, `name`, `faculty_prefix`, `role`) VALUES
('admin', 'admin123', 'Administrator Utama UNRI', 'main', 'superadmin'),
('admin_fkip', 'fkip123', 'Admin FKIP UNRI', 'fkip', 'admin'),
('admin_fisip', 'admin123', 'Admin FISIP UNRI', 'fisip', 'admin'),
('admin_feb', 'admin123', 'Admin FEB UNRI', 'feb', 'admin'),
('admin_fmipa', 'admin123', 'Admin FMIPA UNRI', 'fmipa', 'admin'),
('admin_ft', 'admin123', 'Admin FT UNRI', 'ft', 'admin');

-- --------------------------------------------------------
-- 3. Tabel: rooms (Master Ruangan & Studio Kampus)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_prefix` VARCHAR(20) NOT NULL DEFAULT 'main',
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'Ruang Rapat',
    `building` VARCHAR(100),
    `floor` VARCHAR(20),
    `capacity` INT DEFAULT 30,
    `facilities` TEXT,
    `is_available` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rooms` (`faculty_prefix`, `name`, `category`, `building`, `floor`, `capacity`, `facilities`) VALUES
('main', 'Studio Gurindam 12', 'Studio Multimedia', 'Gedung Rektorat', 'Lt. 1', 60, 'Sound system, Wireless Mic, Video Wall, AC'),
('main', 'Ruang Senat (Lt.5)', 'Ruang Rapat Pimpinan', 'Gedung Rektorat', 'Lt. 5', 100, 'Microphone Delegasi, Proyektor Laser, Streaming'),
('main', 'Gedung PKM Gobah', 'Auditorium Utama', 'Gedung PKM', 'Lt. 1', 1500, 'Panggung Utama, Lighting, Sound System 10000W'),
('main', 'TGCL - Podcast', 'Studio Recording', 'UPA Perpustakaan', 'Lt. 2', 8, 'Microphone Shure, Soundcard Focusrite, Akustik Ruang'),
('main', 'TGCL - Meetingroom', 'Ruang Rapat', 'UPA Perpustakaan', 'Lt. 2', 25, 'Smart TV 75 inch, Conference Camera, AC'),
('main', 'TGCL - Event & Training Area', 'Area Pelatihan', 'UPA Perpustakaan', 'Lt. 3', 80, 'Proyektor HD, Whiteboard Elektronik, WiFi Dedicated'),
('main', 'Ruang Diskusi (Max 15 orang)', 'Ruang Kolaborasi', 'UPA Perpustakaan', 'Lt. 1', 15, 'TV Monitor, Whiteboard, Meja Modular'),
('main', 'Ruang Diskusi (Max 8 orang)', 'Ruang Kolaborasi', 'UPA Perpustakaan', 'Lt. 1', 8, 'TV Monitor, Whiteboard, Port Charger');

-- --------------------------------------------------------
-- 4. Tabel: settings (Pengaturan Fakultas & Display TV)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
    `faculty_prefix` VARCHAR(20) PRIMARY KEY,
    `faculty_name` VARCHAR(150) NOT NULL,
    `sub_unit_name` VARCHAR(150) DEFAULT 'UPA Perpustakaan',
    `accreditation` VARCHAR(50) DEFAULT 'Akreditasi Unggul',
    `campus_location` VARCHAR(100) DEFAULT 'Kampus Bina Widya',
    `operational_hours` VARCHAR(100) DEFAULT '08:00 - 16:00 WIB',
    `tagline` TEXT,
    `primary_color` VARCHAR(20) DEFAULT '#1e40af',
    `template_colors` JSON,
    `tv_layout` VARCHAR(30) DEFAULT 'standard',
    `language` VARCHAR(10) DEFAULT 'id',
    `timezone` VARCHAR(10) DEFAULT 'WIB',
    `time_on` VARCHAR(10) DEFAULT '06:00',
    `time_off` VARCHAR(10) DEFAULT '22:00',
    `auto_refresh` BOOLEAN DEFAULT TRUE,
    `slide_duration` INT DEFAULT 8,
    `marquee_speed` INT DEFAULT 20,
    `schedule_speed` INT DEFAULT 1,
    `schedule_scroll_type` VARCHAR(20) DEFAULT 'step',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` 
(`faculty_prefix`, `faculty_name`, `sub_unit_name`, `accreditation`, `campus_location`, `operational_hours`, `tagline`, `primary_color`, `template_colors`, `tv_layout`) 
VALUES
('main', 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)', 'UPA Perpustakaan', 'Akreditasi Unggul', 'Kampus Bina Widya', '08:00 - 16:00 WIB', 'Jantung Hati Masyarakat Riau', '#1e40af', '{"standard": "#1e40af", "tu": "#1e40af", "agenda-focus": "#1e40af", "full-media": "#1e40af", "admin": "#1e40af"}', 'standard'),
('fkip', 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)', 'Sekretariat Dekanat', 'Akreditasi Unggul', 'Kampus Bina Widya', '08:00 - 16:00 WIB', 'Mencerdaskan Kehidupan Bangsa', '#1e40af', '{"standard": "#1e40af", "tu": "#1e40af", "agenda-focus": "#1e40af", "full-media": "#1e40af", "admin": "#1e40af"}', 'standard');

-- --------------------------------------------------------
-- 5. Tabel: schedules (Jadwal & Agenda Kegiatan)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_prefix` VARCHAR(20) NOT NULL DEFAULT 'main',
    `room_id` INT NULL,
    `date` DATE NOT NULL,
    `start_time` VARCHAR(10) NOT NULL,
    `end_time` VARCHAR(10) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `loc` VARCHAR(150) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'Akan Datang',
    `pic` VARCHAR(100) DEFAULT '-',
    `partner_category` ENUM('Internal', 'Eksternal') DEFAULT 'Internal',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `schedules` 
(`faculty_prefix`, `date`, `start_time`, `end_time`, `title`, `description`, `loc`, `status`, `pic`, `partner_category`) 
VALUES
('main', CURDATE(), '08:30', '10:30', 'Rapat IKU Triwulan III', 'Evaluasi kinerja triwulan & capaian sasaran', 'Studio Gurindam 12', 'Berlangsung', 'Biro Umum', 'Internal'),
('main', CURDATE(), '11:00', '12:30', 'Koordinasi Sarana Prasarana', 'Review kebutuhan logistik & inventaris', 'Ruang Senat (Lt.5)', 'Akan Datang', 'Bagian Umum', 'Internal'),
('main', CURDATE(), '13:30', '15:30', 'Distribusi Pengadaan Lab 2026', 'Persiapan distribusi alat riset terpadu', 'Gedung Rektorat', 'Akan Datang', 'Tim Pengadaan', 'Eksternal'),
('main', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:30', '11:00', 'Rapat Rutin Persiapan AMI', 'Audit mutu internal akademik fakultas', 'Ruang Senat (Lt.5)', 'Akan Datang', 'Fakultas Kedokteran', 'Internal'),
('main', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00', '15:00', 'Sosialisasi Tata Tertib Kampus', 'Pembinaan karakter civitas akademika', 'Gedung PKM Gobah', 'Akan Datang', 'BEM & DPM', 'Internal');

-- --------------------------------------------------------
-- 6. Tabel: announcements (Pengumuman Running Text)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_prefix` VARCHAR(20) NOT NULL DEFAULT 'main',
    `text` TEXT NOT NULL,
    `priority` ENUM('Normal', 'Penting', 'Mendesak') DEFAULT 'Normal',
    `expiry_date` DATE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`faculty_prefix`, `text`, `expiry_date`) VALUES
('main', 'Selamat Datang di Pusat Informasi Kampus Terpadu Universitas Riau.', DATE_ADD(CURDATE(), INTERVAL 1 MONTH)),
('main', 'Rapat IKU Triwulan III akan dilaksanakan pada pukul 09:00 di Gedung Rektorat.', DATE_ADD(CURDATE(), INTERVAL 1 MONTH)),
('main', 'Jangan lupa untuk selalu mematuhi protokol kesehatan di lingkungan kampus.', DATE_ADD(CURDATE(), INTERVAL 1 MONTH)),
('main', 'Pengisian KRS Semester Ganjil 2026/2027 telah dibuka melalui portal akademik.', DATE_ADD(CURDATE(), INTERVAL 1 MONTH));

-- --------------------------------------------------------
-- 7. Tabel: slides (Media Banner / Slide Informasi)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `slides`;
CREATE TABLE `slides` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_prefix` VARCHAR(20) NOT NULL DEFAULT 'main',
    `tag` VARCHAR(100),
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `btn_text` VARCHAR(100),
    `bg` TEXT,
    `qr_url` TEXT,
    `qr_label` VARCHAR(100),
    `media_type` ENUM('none', 'image', 'video') DEFAULT 'none',
    `media_url` TEXT,
    `sort_order` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `slides` 
(`faculty_prefix`, `tag`, `title`, `description`, `btn_text`, `bg`, `qr_url`, `qr_label`, `media_type`, `media_url`, `sort_order`) 
VALUES
('main', 'Whistle Blower System', 'Laporkan Pelanggaran<br/>Integritas <strong>UNRI!</strong>', 'Temukan korupsi, pungli, kecurangan akademik, atau pemalsuan dokumen? Laporkan sekarang! Identitas pelapor dijamin aman dan rahasia.', 'Laporkan Sekarang', 'linear-gradient(135deg, #1c7947 0%, #2a9d5c 100%)', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id/lapor', 'Scan untuk Melapor', 'none', '', 1),
('main', 'Zona Integritas', 'Stop Kekerasan<br/>di <strong>Lingkungan UNRI!</strong>', 'Terima atau melihat tindakan kekerasan di lingkungan kampus? Jangan diam, laporkan melalui kanal resmi kami.', '', 'linear-gradient(135deg, #2f5597 0%, #4a7bd1 100%)', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id/lapor-kekerasan', 'Scan QR Lapor', 'none', '', 2);

-- --------------------------------------------------------
-- 8. Tabel: tv_screens (Manajemen 3 TV Pusat)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tv_screens`;
CREATE TABLE `tv_screens` (
    `id` INT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `location` VARCHAR(150),
    `faculty_prefix` VARCHAR(20) NOT NULL DEFAULT 'main',
    `layout` VARCHAR(30) NOT NULL DEFAULT 'standard',
    `theme_color` VARCHAR(20) DEFAULT '#1e40af',
    `is_active` BOOLEAN DEFAULT TRUE,
    `custom_announcement` TEXT,
    `slide_duration` INT DEFAULT 8,
    `marquee_speed` INT DEFAULT 20,
    `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
    `last_ping` TIMESTAMP NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tv_screens` (`id`, `name`, `location`, `faculty_prefix`, `layout`, `theme_color`, `is_active`, `custom_announcement`, `slide_duration`, `marquee_speed`)
VALUES
(1, 'TV Pusat 1', 'Lobi Utama Rektorat', 'main', 'standard', '#1e40af', 1, '', 8, 20),
(2, 'TV Pusat 2', 'Lobi Gedung Kuliah / Senat', 'main', 'agenda-focus', '#1e40af', 1, '', 8, 20),
(3, 'TV Pusat 3', 'Ruang Publik & Perpustakaan', 'main', 'full-media', '#1e40af', 1, '', 8, 20);

-- --------------------------------------------------------
-- 9. Tabel: activity_logs (Audit Trail / Riwayat Log Aktivitas)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `username` VARCHAR(50) NOT NULL,
    `faculty_prefix` VARCHAR(20) DEFAULT 'main',
    `action` VARCHAR(100) NOT NULL,
    `details` TEXT,
    `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activity_logs` (`username`, `faculty_prefix`, `action`, `details`) VALUES
('system', 'main', 'SISTEM_INIT', 'Inisialisasi database kampus enterprise berhasil diselesaikan.');

-- --------------------------------------------------------
-- 10. Tabel: media_library (Galeri & Arsip Berkas Kampus)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `media_library`;
CREATE TABLE `media_library` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_prefix` VARCHAR(20) NOT NULL DEFAULT 'main',
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` TEXT NOT NULL,
    `file_type` VARCHAR(50) DEFAULT 'image',
    `file_size` BIGINT DEFAULT 0,
    `uploaded_by` VARCHAR(50) DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
