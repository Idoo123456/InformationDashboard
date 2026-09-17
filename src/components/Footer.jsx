import { Info, Globe } from 'lucide-react';
import { useEffect, useRef } from 'react';
import logoUnri from '../assets/LogoUnri2.png';
import { useDashboard } from '../context/DashboardContext';

const Footer = () => {
  const marqueeRef = useRef(null);
  const { announcements, marqueeSpeed } = useDashboard();

  // To make it seamless, we double the content in CSS animation
  return (
    <footer className="footer">
      <div className="announcement-bar">
        <div className="announcement-label">PENGUMUMAN</div>
        <div className="marquee-container">
          <div className="marquee-content" ref={marqueeRef} style={{ animationDuration: `${marqueeSpeed || 20}s` }}>
            {/* Group 1 */}
            <div className="marquee-group">
              {announcements.map((text, i) => (
                <span key={i}>
                  <Info size={16} className="icon-blue" style={{ marginRight: '8px' }} /> {text}
                </span>
              ))}
            </div>
            {/* Group 2 (Clone for seamless loop) */}
            <div className="marquee-group" aria-hidden="true">
              {announcements.map((text, i) => (
                <span key={`clone-${i}`}>
                  <Info size={16} className="icon-blue" style={{ marginRight: '8px' }} /> {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-info">
        <div className="footer-logo">
          <img src={logoUnri} alt="Logo UNRI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="address">
          <strong>Universitas Riau</strong>
          <span>Kampus Bina Widya Km. 12,5, Simpang Baru, Pekanbaru 28293</span>
        </div>
        <div className="social-links">
          <a href="#"><Globe size={14} /> lib.unri.ac.id</a>
          <a href="#"><i className="fa-brands fa-instagram"></i> @unriofficial</a>
          <a href="#"><i className="fa-brands fa-youtube"></i> @unriofficial</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
