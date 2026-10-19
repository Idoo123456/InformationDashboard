import { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import logoUnri from '../assets/logounri.png';
import { Clock, Award, Building2, MapPin, Sparkles } from 'lucide-react';

const Header = () => {
  const [time, setTime] = useState(new Date());
  const { 
    prefix,
    facultyName, 
    subUnitName, 
    accreditation, 
    campusLocation, 
    operationalHours, 
    tagline 
  } = useDashboard();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const formatTime = (date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  // Nama fakultas / unit kerja resmi (dinamis sesuai prefix & pengaturan)
  const displayFaculty = facultyName || (prefix === 'main' ? 'Universitas Riau (Kantor Pusat)' : 'Universitas Riau');
  const displayUnit = subUnitName || (prefix === 'main' ? 'Pusat Informasi & Layanan Terpadu' : 'Pusat Informasi Fakultas');

  return (
    <header className="header glass-panel header-grand">
      {/* BAGIAN KIRI: LOGO RESMI & UNIT KERJA */}
      <div className="header-brand">
        <div className="header-logo-wrap">
          <img src={logoUnri} alt="Logo UNRI" className="header-logo-img" />
        </div>
        <div className="header-brand-divider" />
        <div className="header-brand-text">
          <span className="header-sub-brand">UNIVERSITAS RIAU</span>
          <h3 className="header-unit-title">{displayUnit}</h3>
          <span className="header-campus-info">
            <MapPin size={11} className="header-pin-icon" />
            {campusLocation || 'Kampus Bina Widya, Pekanbaru'}
          </span>
        </div>
      </div>

      {/* BAGIAN TENGAH: NAMA FAKULTAS (HERO), TAGLINE, & METADATA RESMI */}
      <div className="header-center">
        <div className="header-center-pretitle">
          <span className="header-pretitle-line" />
          <span className="header-pretitle-text">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI • UNIVERSITAS RIAU</span>
          <span className="header-pretitle-line" />
        </div>

        {/* NAMA FAKULTAS UTAMA DI TENGAH */}
        <h1 className="header-faculty-hero" title={displayFaculty}>
          {displayFaculty}
        </h1>

        {/* SLOGAN / TAGLINE */}
        <p className="header-tagline-text">
          "{tagline || "Jantung Hati Masyarakat Riau"}"
        </p>

        {/* BADGES ROW LENGKAP */}
        <div className="header-meta-pills">
          <div className="header-status-pill">
            <span className="header-status-dot" />
            <span className="header-status-text">Pusat Informasi & Layanan Terpadu</span>
          </div>
          <div className="header-accreditation-pill">
            <Award size={12} className="chip-icon-gold" />
            <span>{accreditation || 'Akreditasi Unggul'}</span>
          </div>
          <div className="header-hours-pill">
            <Clock size={12} className="header-hours-icon" />
            <span>Jam Layanan: {operationalHours || '08:00 - 16:00 WIB'}</span>
          </div>
        </div>
      </div>

      {/* BAGIAN KANAN: WIDGET JAM DIGITAL LIVE BESAR & TANGGAL LENGKAP */}
      <div className="header-time-widget">
        <div className="header-clock-row">
          <span className="header-clock">{formatTime(time)}</span>
          <span className="header-tz-badge">WIB</span>
        </div>
        <div className="header-date-row">
          <span className="header-day-tag">{days[time.getDay()]}</span>
          <span className="header-date-text">{`${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
