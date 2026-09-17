import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { Lock, User, ArrowRight } from 'lucide-react';
import logoUnri from '../assets/logounri.png';
import '../admin.css';

export default function Login() {
  const { setIsAuthenticated } = useDashboard();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      navigate('/admin');
    } else {
      setError('Username atau Password salah!');
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-card-wrapper">
        {/* LEFT SIDE - BRANDING */}
        <div className="login-left-panel">
          <div className="login-overlay"></div>
          <div className="login-branding-content">
            <div className="brand-logo-large">
              <img src={logoUnri} alt="UNRI Logo" />
            </div>
            <h1>Portal Manajemen Pusat Informasi</h1>
            <p>Kelola semua konten layar informasi kampus Universitas Riau dengan mudah, cepat, dan terpusat dalam satu dasbor pintar berstandar profesional.</p>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h2>Selamat Datang Kembali</h2>
              <p>Silakan masuk ke akun Administrator Anda</p>
            </div>
            
            {error && <div className="login-error">{error}</div>}
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group login-group">
                <label>Username</label>
                <div className="input-with-icon-wrapper">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Masukkan username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="admin-input with-icon"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group login-group" style={{marginTop: '1.5rem'}}>
                <label>Password</label>
                <div className="input-with-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Masukkan kata sandi" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="admin-input with-icon"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn-save login-btn">
                Masuk ke Dasbor <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
