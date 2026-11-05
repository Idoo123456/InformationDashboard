import { Info, Globe, Megaphone, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logoUnri from '../../assets/LogoUnri2.png';
import { useDashboard } from '../../context/DashboardContext';

const InstagramIcon = ({ size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M14 13.5h2.5l1-4H14V7.2c0-1 .4-1.7 1.8-1.7H17.5V2.1c-.6-.1-1.8-.1-3.2-.1-3.2 0-5.3 1.9-5.3 5.5v2H6v4h3v9.5h5V13.5z" />
  </svg>
);

const YoutubeIcon = ({ size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.26 5 12 5 12 5s-6.26 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2 26.3 26.3 0 0 0 2 12a26.3 26.3 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.74 19 12 19 12 19s6.26 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26.3 26.3 0 0 0 22 12a26.3 26.3 0 0 0-.42-4.81z" fill="#ffffff" />
    <polygon points="10 15 15 12 10 9 10 15" fill="#0f172a" />
  </svg>
);

const Footer = ({ customAnnouncement }) => {
  const marqueeRef = useRef(null);
  const { announcements, marqueeSpeed, isDbConnected } = useDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const activeAnnouncements = (announcements || []).filter(item => {
    if (typeof item === 'string') return true;
    const expiryRaw = item.expiryDate || item.expiry_date;
    if (!expiryRaw) return true;
    const expiryStr = String(expiryRaw).split('T')[0];
    const expiry = new Date(`${expiryStr}T23:59:59`);
    if (isNaN(expiry.getTime())) return true;
    return expiry >= currentTime;
  });

  // Jika TV memiliki custom announcement khusus, sertakan di urutan terdepan
  const displayAnnouncements = [
    ...(customAnnouncement && customAnnouncement.trim() ? [{ text: `📢 [TV KHUSUS] ${customAnnouncement.trim()}` }] : []),
    ...activeAnnouncements
  ];

  const emptyText = isDbConnected
    ? 'Pusat Informasi & Layanan Terpadu Universitas Riau — Belum ada pengumuman khusus saat ini.'
    : 'Pusat Informasi Kampus Terpadu — [Database Offline: Menunggu Koneksi MySQL Server...]';

  return (
    <footer className="footer glass-panel">
      {/* RUNNING ANNOUNCEMENTS BAR */}
      <div className="announcement-bar">
        <div className="announcement-badge">
          <Megaphone size={18} className="announcement-badge-icon" />
          <span>PENGUMUMAN</span>
        </div>
        <div className="marquee-container">
          <div className="marquee-content" ref={marqueeRef} style={{ animationDuration: `${marqueeSpeed || 20}s` }}>
            {/* Group 1 */}
            <div className="marquee-group">
              {displayAnnouncements.length === 0 ? (
                <span className="marquee-item">
                  <Info size={17} className="marquee-item-icon" />
                  <span className="marquee-item-text">{emptyText}</span>
                  <span className="marquee-separator">•</span>
                </span>
              ) : (
                displayAnnouncements.map((item, i) => {
                  const text = typeof item === 'string' ? item : item.text;
                  return (
                    <span key={i} className="marquee-item">
                      <Info size={17} className="marquee-item-icon" />
                      <span className="marquee-item-text">{text}</span>
                      <span className="marquee-separator">•</span>
                    </span>
                  );
                })
              )}
            </div>
            {/* Group 2 (Clone for seamless loop) */}
            <div className="marquee-group" aria-hidden="true">
              {displayAnnouncements.length === 0 ? (
                <span className="marquee-item">
                  <Info size={17} className="marquee-item-icon" />
                  <span className="marquee-item-text">{emptyText}</span>
                  <span className="marquee-separator">•</span>
                </span>
              ) : (
                displayAnnouncements.map((item, i) => {
                  const text = typeof item === 'string' ? item : item.text;
                  return (
                    <span key={`clone-${i}`} className="marquee-item">
                      <Info size={17} className="marquee-item-icon" />
                      <span className="marquee-item-text">{text}</span>
                      <span className="marquee-separator">•</span>
                    </span>
                  );
                })
              )}
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
          {/* Social Media: IG, FB, YT */}
          <div className="footer-social-pill">
            <div className="footer-social-icons-group">
              <a
                href="https://www.instagram.com/unri_library"
                target="_blank"
                rel="noreferrer"
                className="footer-icon-badge"
                title="Instagram @unri_library"
              >
                <InstagramIcon size={11} />
              </a>
              <a
                href="https://www.facebook.com/unri_library"
                target="_blank"
                rel="noreferrer"
                className="footer-icon-badge"
                title="Facebook unri_library"
              >
                <FacebookIcon size={11} />
              </a>
              <a
                href="https://www.youtube.com/@unri_library"
                target="_blank"
                rel="noreferrer"
                className="footer-icon-badge"
                title="YouTube unri_library"
              >
                <YoutubeIcon size={11} />
              </a>
            </div>
            <a
              href="https://www.instagram.com/unri_library"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
            >
              unri_library
            </a>
          </div>

          {/* Website: lib.unri.ac.id */}
          <a
            href="https://lib.unri.ac.id"
            target="_blank"
            rel="noreferrer"
            className="footer-social-pill"
          >
            <span className="footer-icon-badge">
              <Globe size={11} strokeWidth={2.4} />
            </span>
            <span>lib.unri.ac.id</span>
          </a>

          {/* NPP */}
          <div className="footer-social-pill footer-npp-pill">
            <span>NPP: 1471082D1010432</span>
          </div>

          {/* Email: infolib@staff.unri.ac.id */}
          <a
            href="mailto:infolib@staff.unri.ac.id"
            className="footer-social-pill"
          >
            <span className="footer-icon-badge">
              <Mail size={11} strokeWidth={2.4} />
            </span>
            <span>infolib@staff.unri.ac.id</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
