import { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import logoUnri from '../assets/logounri.png';

const Header = () => {
  const [time, setTime] = useState(new Date());
  const { facultyName } = useDashboard();

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
    <header className="header">
      <div className="logo-section">
        <div className="logo-icon">
          <img src={logoUnri} alt="Logo UNRI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="title-section">
        <h2>{facultyName.toUpperCase()}</h2>
        <h3>Pusat Informasi <span className="highlight-text">Perpustakaan</span></h3>
        <div className="welcome-container">
          <div className="welcome-text-wrapper">
            <div className="welcome-text-item">Selamat Datang</div>
            <div className="welcome-text-item">{facultyName}</div>
            <div className="welcome-text-item">Selamat Datang</div>
          </div>
        </div>
      </div>

      <div className="time-section">
        <div className="day-badge">{days[time.getDay()]}</div>
        <div className="time-display">{formatTime(time)}</div>
        <div className="date-display">{`${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`}</div>
      </div>
    </header>
  );
};

export default Header;
