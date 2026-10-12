import { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import logoUnri from '../assets/logounri.png';

const Header = () => {
  const [time, setTime] = useState(new Date());
  const { facultyName, tagline } = useDashboard();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const formatTime = (date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  return (
    <header className="header glass-panel">
      {/* LEFT: BRAND IDENTITY */}
      <div className="header-brand">
        <div className="header-logo-wrap">
          <img src={logoUnri} alt="Logo UNRI" className="header-logo-img" />
        </div>
        <div className="header-brand-divider" />
        <div className="header-brand-text">
          <span className="header-sub-brand">UNIVERSITAS RIAU</span>
          <h2 className="header-main-brand" title={facultyName}>{facultyName}</h2>
        </div>
      </div>

      {/* CENTER: TAGLINE & LIVE SYSTEM STATUS */}
      <div className="header-center">
        <h1 className="header-tagline">
          {tagline || "Jantung Hati Masyarakat Riau"}
        </h1>
        <div className="header-status-pill">
          <span className="header-status-dot" />
          <span className="header-status-text">Pusat Informasi & Layanan Terpadu</span>
        </div>
      </div>

      {/* RIGHT: TIME & DATE WIDGET */}
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
