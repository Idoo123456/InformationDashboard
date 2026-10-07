import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { Lock, User, ArrowRight, Eye, EyeOff, LayoutDashboard, MonitorPlay, Zap } from 'lucide-react';
import logoUnri from '../assets/logounri.png';
import bgPerpus from '../assets/bg-perpus.png';
import '../modern-login.css';

export default function Login() {
  const { setIsAuthenticated, basePath, prefix } = useDashboard();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const expectedUsername = prefix === 'main' ? 'admin' : `admin_${prefix}`;
      
      if (username === expectedUsername && password === 'admin123') {
        setIsAuthenticated(true);
        navigate(`${basePath}/admin`);
      } else {
        setError(`Akses ditolak! Anda tidak memiliki izin (role) yang sesuai.`);
        setIsLoading(false);
      }
    }, 1000); // Slightly longer for premium feel
  };

  return (
    <div className="premium-layout">
      {/* LEFT PANEL - IMMERSIVE IMAGE WITH GLASSMORPHISM */}
      <div className="premium-left" style={{ backgroundImage: `url(${bgPerpus})` }}>
        <div className="premium-overlay"></div>
        <div className="premium-left-content">
          
          <div className="premium-brand">
            <div className="premium-logo-box">
              <img src={logoUnri} alt="UNRI" />
            </div>
            <div className="premium-brand-text">
              <h2>Universitas Riau</h2>
              <span>Sistem Informasi Terpadu</span>
            </div>
          </div>

          <div className="premium-quote-card">
            <h3>"Memberikan pengalaman informasi terbaik untuk sivitas akademika."</h3>
            <p>Satu platform untuk mengelola jadwal, pengumuman, dan tampilan layar digital di seluruh fakultas secara real-time.</p>
            
            <div className="premium-features-row">
              <div className="feat-chip">
                <LayoutDashboard size={14} /> Tata Letak Fleksibel
              </div>
              <div className="feat-chip">
                <MonitorPlay size={14} /> Tampilan Langsung
              </div>
              <div className="feat-chip">
                <Zap size={14} /> Sinkronisasi Cepat
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL - SUPER COOL FORM */}
      <div className="premium-right">
        <div className="cool-form-wrapper">
          
          <div className="cool-form-header">
            <h2>Portal <span>Admin</span></h2>
            <p>Masukkan kredensial Anda untuk melanjutkan ke dasbor pengelolaan.</p>
          </div>

          {error && (
            <div className="premium-alert shake-animation">
              <div className="alert-icon">!</div>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="cool-form">
            
            <div className="cool-input-group">
              <User size={20} className="cool-icon" />
              <input 
                type="text" 
                id="username"
                placeholder=" " 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="off"
              />
              <label htmlFor="username">Nama Pengguna</label>
            </div>

            <div className="cool-input-group">
              <Lock size={20} className="cool-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                placeholder=" " 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <label htmlFor="password">Kata Sandi</label>
              
              <button 
                type="button" 
                className="cool-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="cool-form-actions">
              <label className="cool-checkbox">
                <input type="checkbox" />
                <div className="cool-checkmark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="cool-label-text">Tetap masuk</span>
              </label>
              <a href="#" className="cool-link">Lupa sandi?</a>
            </div>

            <div className="cool-buttons">
              <button type="submit" className={`cool-btn-primary ${isLoading ? 'btn-loading' : ''}`} disabled={isLoading}>
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>Autentikasi <ArrowRight size={18} className="btn-icon" /></>
                )}
              </button>
              
              <div className="cool-divider">
                <span>ATAU</span>
              </div>

              <button type="button" className="cool-btn-secondary" onClick={() => window.open(`${basePath}`, '_blank')}>
                <MonitorPlay size={18} /> Kunjungi Layar TV
              </button>
            </div>
          </form>

          <div className="cool-footer">
            <p>Sistem Informasi Terpadu &copy; {new Date().getFullYear()}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
