import { Info, Globe, Megaphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logoUnri from '../assets/LogoUnri2.png';
import { useDashboard } from '../context/DashboardContext';

const Footer = () => {
  const marqueeRef = useRef(null);
  const { announcements, marqueeSpeed } = useDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const activeAnnouncements = announcements.filter(item => {
    if (typeof item === 'string') return true;
    if (!item.expiryDate) return true;
    const expiry = new Date(item.expiryDate);
    return expiry >= currentTime;
  });

  return (
    <footer className="footer glass-panel">
      {/* RUNNING ANNOUNCEMENTS BAR */}
      <div className="announcement-bar">
        <div className="announcement-badge">
          <Megaphone size={15} className="announcement-badge-icon" />
          <span>PENGUMUMAN</span>
        </div>
        <div className="marquee-container">
          <div className="marquee-content" ref={marqueeRef} style={{ animationDuration: `${marqueeSpeed || 20}s` }}>
            {/* Group 1 */}
            <div className="marquee-group">
              {activeAnnouncements.map((item, i) => {
                const text = typeof item === 'string' ? item : item.text;
                return (
                  <span key={i} className="marquee-item">
                    <Info size={14} className="marquee-item-icon" />
                    <span className="marquee-item-text">{text}</span>
                    <span className="marquee-separator">•</span>
                  </span>
                );
              })}
            </div>
            {/* Group 2 (Clone for seamless loop) */}
            <div className="marquee-group" aria-hidden="true">
              {activeAnnouncements.map((item, i) => {
                const text = typeof item === 'string' ? item : item.text;
                return (
                  <span key={`clone-${i}`} className="marquee-item">
                    <Info size={14} className="marquee-item-icon" />
                    <span className="marquee-item-text">{text}</span>
                    <span className="marquee-separator">•</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM INFO BAR */}
      <div className="footer-info">
        <div className="footer-brand-side">
          <div className="footer-logo">
            <img src={logoUnri} alt="Logo UNRI" className="footer-logo-img" />
          </div>
          <div className="footer-address">
            <span className="footer-title">Universitas Riau</span>
            <span className="footer-bullet">•</span>
            <span className="footer-desc">Kampus Bina Widya Km. 12,5, Simpang Baru, Pekanbaru 28293</span>
          </div>
        </div>
        <div className="footer-social-side">
          <a href="https://lib.unri.ac.id" target="_blank" rel="noreferrer" className="footer-social-pill">
            <Globe size={13} />
            <span>lib.unri.ac.id</span>
          </a>
          <span className="footer-social-pill">
            <span className="social-bullet">@</span>
            <span>unriofficial</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
