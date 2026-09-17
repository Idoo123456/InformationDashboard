import { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Settings, Image as ImageIcon, Calendar, MessageSquare, Save, Trash2, Plus, Edit, LogOut, ChevronRight, User, Upload, Copy, LayoutDashboard, MonitorPlay, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../admin.css';
import logoUnri from '../assets/LogoUnri2.png';

function AdminDashboard() {
  const { 
    facultyName, setFacultyName, 
    schedules, setSchedules, 
    announcements, setAnnouncements, 
    slides, setSlides,
    setIsAuthenticated,
    slideDuration, setSlideDuration,
    marqueeSpeed, setMarqueeSpeed,
    scheduleSpeed, setScheduleSpeed
  } = useDashboard();
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  // local states for editing
  const [localFaculty, setLocalFaculty] = useState(facultyName);
  const [localSlideDuration, setLocalSlideDuration] = useState(slideDuration);
  const [localMarqueeSpeed, setLocalMarqueeSpeed] = useState(marqueeSpeed);
  const [localScheduleSpeed, setLocalScheduleSpeed] = useState(scheduleSpeed);
  
  const handleSaveSettings = () => {
    setFacultyName(localFaculty);
    alert('Pengaturan Umum berhasil disimpan!');
  };

  const [localAnnouncements, setLocalAnnouncements] = useState(announcements);
  const [localSchedules, setLocalSchedules] = useState(schedules);
  const [localSlides, setLocalSlides] = useState(slides);

  const handleAddAnnouncement = () => {
    setLocalAnnouncements([...localAnnouncements, "Pengumuman Baru"]);
  };

  const updateAnnouncement = (index, val) => {
    const newAnn = [...localAnnouncements];
    newAnn[index] = val;
    setLocalAnnouncements(newAnn);
  };

  const deleteAnnouncement = (index) => {
    setLocalAnnouncements(localAnnouncements.filter((_, i) => i !== index));
  };

  const handleSaveAnnouncements = () => {
    setAnnouncements(localAnnouncements);
    setMarqueeSpeed(localMarqueeSpeed);
    alert('Pengumuman berhasil disimpan dan diperbarui di layar TV!');
  };

  const handleAddSchedule = () => {
    setLocalSchedules([...localSchedules, { id: Date.now(), time: '00:00', day: 'Hari Ini', title: 'Kegiatan Baru', loc: 'Ruangan' }]);
  };

  const updateSchedule = (id, field, value) => {
    setLocalSchedules(localSchedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSchedule = (id) => {
    setLocalSchedules(localSchedules.filter(s => s.id !== id));
  };

  const handleSaveSchedules = () => {
    setSchedules(localSchedules);
    setScheduleSpeed(localScheduleSpeed);
    alert('Jadwal berhasil disimpan dan diperbarui di layar TV!');
  };

  const handleAddSlide = () => {
    setLocalSlides([...localSlides, {
      id: Date.now(),
      tag: "Tag Baru",
      tagStyle: { background: "white", color: "#4a7bd1" },
      title: "Judul Slide Baru",
      desc: "Deskripsi singkat slide baru.",
      btnText: "Tombol Aksi",
      btnStyle: { background: "white", color: "#2f5597" },
      bg: "linear-gradient(135deg, #2f5597 0%, #4a7bd1 100%)",
      qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id",
      qrLabel: "Scan QR"
    }]);
  };

  const updateSlide = (id, field, value) => {
    setLocalSlides(localSlides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSlide = (id) => {
    setLocalSlides(localSlides.filter(s => s.id !== id));
  };

  const handleImageUpload = (slideId, file, targetField) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let MAX_WIDTH = targetField === 'qr' ? 300 : 1920;
        let MAX_HEIGHT = targetField === 'qr' ? 300 : 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const finalValue = targetField === 'bg' ? `url('${dataUrl}') center/cover no-repeat` : dataUrl;
        updateSlide(slideId, targetField, finalValue);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSlides = () => {
    setSlides(localSlides);
    setSlideDuration(localSlideDuration);
    alert('Slide berhasil disimpan dan diperbarui di layar TV!');
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img src={logoUnri} alt="Logo UNRI" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Admin Panel</h2>
        </div>
        <nav className="admin-nav" style={{ flex: 1 }}>
          <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> Ringkasan
          </button>
          <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Pengaturan Umum
          </button>
          <button className={`nav-btn ${activeTab === 'slides' ? 'active' : ''}`} onClick={() => setActiveTab('slides')}>
            <ImageIcon size={18} /> Manajemen Slide
          </button>
          <button className={`nav-btn ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => setActiveTab('schedules')}>
            <Calendar size={18} /> Jadwal Kegiatan
          </button>
          <button className={`nav-btn ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
            <MessageSquare size={18} /> Pengumuman
          </button>
        </nav>
        <div className="admin-nav-footer" style={{ padding: '1.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={handleLogout} className="nav-btn" style={{ color: '#ef4444' }}>
            <LogOut size={18} /> Keluar Dasbor
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-breadcrumbs">
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Admin Dasbor</span>
            <ChevronRight size={14} style={{ color: '#94a3b8', margin: '0 0.5rem' }} />
            <h1 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
              {activeTab === 'overview' && 'Ringkasan Dasbor'}
              {activeTab === 'settings' && 'Pengaturan Umum'}
              {activeTab === 'slides' && 'Manajemen Slide'}
              {activeTab === 'schedules' && 'Jadwal Kegiatan'}
              {activeTab === 'announcements' && 'Pengumuman'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="/" target="_blank" className="view-btn">Lihat Layar TV</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <User size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Administrator</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="overview-grid">
                <div className="stat-card">
                  <div className="stat-icon blue"><MonitorPlay /></div>
                  <div className="stat-details">
                    <h4>Total Slide Aktif</h4>
                    <p>{slides.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><Calendar /></div>
                  <div className="stat-details">
                    <h4>Kegiatan Hari Ini</h4>
                    <p>{schedules.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><MessageSquare /></div>
                  <div className="stat-details">
                    <h4>Pengumuman Berjalan</h4>
                    <p>{announcements.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Activity /></div>
                  <div className="stat-details">
                    <h4>Status Sistem</h4>
                    <p style={{ fontSize: '1.2rem', color: '#10b981' }}>Online & Tersinkron</p>
                  </div>
                </div>
              </div>
              
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Akses Cepat</h3>
                <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Pilih menu di bawah untuk langsung memperbarui konten layar TV.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn-save" onClick={() => setActiveTab('slides')} style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>Kelola Slide Foto</button>
                  <button className="btn-save" onClick={() => setActiveTab('schedules')} style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>Update Jadwal Rapat</button>
                  <button className="btn-save" onClick={() => setActiveTab('announcements')} style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>Ganti Teks Berjalan</button>
                </div>
              </div>
            </>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
              <h3>Pengaturan Identitas & Kecepatan Layar</h3>
              <div className="form-group">
                <label>Teks Selamat Datang (Nama Fakultas / Institusi)</label>
                <input 
                  type="text" 
                  value={localFaculty} 
                  onChange={(e) => setLocalFaculty(e.target.value)} 
                  className="admin-input"
                />
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button className="btn-save" onClick={handleSaveSettings}><Save size={16} /> Simpan Pengaturan</button>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
              <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3>Daftar Pengumuman (Teks Berjalan)</h3>
                <button className="btn-add" onClick={handleAddAnnouncement}><Plus size={16} /> Tambah</button>
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Waktu Putar Teks Bawah (Detik, makin kecil makin cepat)</label>
                <input 
                  type="number" 
                  value={localMarqueeSpeed} 
                  onChange={(e) => setLocalMarqueeSpeed(Number(e.target.value))} 
                  className="admin-input"
                  min="5"
                  style={{ maxWidth: '200px' }}
                />
              </div>
              <div className="list-group">
                {localAnnouncements.map((ann, i) => (
                  <div key={i} className="list-item">
                    <input 
                      type="text" 
                      value={ann} 
                      onChange={(e) => updateAnnouncement(i, e.target.value)}
                      className="admin-input"
                    />
                    <button className="btn-delete" onClick={() => deleteAnnouncement(i)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button className="btn-save" onClick={handleSaveAnnouncements}><Save size={16} /> Simpan Pengumuman</button>
              </div>
            </div>
          )}

          {/* SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
              <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3>Jadwal Kegiatan</h3>
                <button className="btn-add" onClick={handleAddSchedule}><Plus size={16} /> Tambah</button>
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Kecepatan Auto-Scroll Jadwal (Pengali, Normal = 1. Semakin besar semakin cepat)</label>
                <input 
                  type="number" 
                  value={localScheduleSpeed} 
                  onChange={(e) => setLocalScheduleSpeed(Number(e.target.value))} 
                  className="admin-input"
                  min="0.1"
                  step="0.1"
                  style={{ maxWidth: '200px' }}
                />
              </div>
              <div className="list-group">
                {localSchedules.map((schedule) => (
                  <div key={schedule.id} className="list-item complex-item">
                    <div className="input-row">
                      <input type="text" value={schedule.time} onChange={(e) => updateSchedule(schedule.id, 'time', e.target.value)} placeholder="Jam (ex: 09:00)" className="admin-input short" />
                      <input type="text" value={schedule.day} onChange={(e) => updateSchedule(schedule.id, 'day', e.target.value)} placeholder="Hari (ex: Hari Ini)" className="admin-input short" />
                      <input type="text" value={schedule.title} onChange={(e) => updateSchedule(schedule.id, 'title', e.target.value)} placeholder="Nama Kegiatan" className="admin-input" />
                      <input type="text" value={schedule.loc} onChange={(e) => updateSchedule(schedule.id, 'loc', e.target.value)} placeholder="Lokasi" className="admin-input" />
                      <button className="btn-delete" onClick={() => deleteSchedule(schedule.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button className="btn-save" onClick={handleSaveSchedules}><Save size={16} /> Simpan Jadwal</button>
              </div>
            </div>
          )}

          {/* SLIDES */}
          {activeTab === 'slides' && (
            <div className="card">
              <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3>Daftar Slide Konten</h3>
                <button className="btn-add" onClick={handleAddSlide}><Plus size={16} /> Tambah Slide</button>
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Durasi Tampil per Slide (Detik)</label>
                <input 
                  type="number" 
                  value={localSlideDuration} 
                  onChange={(e) => setLocalSlideDuration(Number(e.target.value))} 
                  className="admin-input"
                  min="1"
                  style={{ maxWidth: '200px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {localSlides.map((slide) => (
                  <div key={slide.id} className="slide-card-admin">
                    <div className="slide-card-header">
                      <h4>Slide #{localSlides.indexOf(slide) + 1}</h4>
                      <button className="btn-delete-text" onClick={() => deleteSlide(slide.id)}><Trash2 size={16} /> Hapus</button>
                    </div>
                    <div className="slide-card-body">
                      {/* Kiri: Urusan Teks */}
                      <div className="slide-section-text">
                        <div className="form-group">
                          <label>Label Tag</label>
                          <input type="text" value={slide.tag} onChange={(e) => updateSlide(slide.id, 'tag', e.target.value)} className="admin-input" />
                        </div>
                        <div className="form-group">
                          <label>Judul (Bisa tag HTML)</label>
                          <textarea value={typeof slide.title === 'string' ? slide.title : slide.title.props?.children?.join('') || 'Judul'} onChange={(e) => updateSlide(slide.id, 'title', e.target.value)} className="admin-input" rows="2" style={{ minHeight: '44px' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Deskripsi</label>
                          <textarea value={slide.desc} onChange={(e) => updateSlide(slide.id, 'desc', e.target.value)} className="admin-input" rows="4" style={{ minHeight: '110px' }} />
                        </div>
                      </div>

                      {/* Kanan: Urusan Media */}
                      <div className="slide-section-media">
                        <div className="form-group">
                          <label>Latar Belakang (Warna/Upload Foto)</label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                              <input 
                                type="color" 
                                value={slide.bg.startsWith('#') ? slide.bg.slice(0, 7) : '#2f5597'} 
                                onChange={(e) => updateSlide(slide.id, 'bg', e.target.value)} 
                                style={{ position: 'absolute', left: '10px', width: '30px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
                              />
                              <input 
                                type="text" 
                                value={slide.bg} 
                                onChange={(e) => updateSlide(slide.id, 'bg', e.target.value)} 
                                className="admin-input" 
                                style={{ width: '100%', paddingLeft: '50px', paddingRight: '45px' }} 
                                placeholder="hex warna atau url(...)" 
                              />
                              <button 
                                type="button" 
                                onClick={() => { navigator.clipboard.writeText(slide.bg); alert('Kode warna disalin!'); }} 
                                style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                                title="Salin Kode Warna"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                            <label className="btn-save" style={{ cursor: 'pointer', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                              <Upload size={16} /> Pilih Foto
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(slide.id, e.target.files[0], 'bg')} />
                            </label>
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Gambar QR Code (Upload/URL)</label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="text" value={slide.qr} onChange={(e) => updateSlide(slide.id, 'qr', e.target.value)} className="admin-input" style={{ flex: 1 }} placeholder="Masukkan link gambar QR..." />
                            <label className="btn-save" style={{ cursor: 'pointer', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                              <Upload size={16} /> Pilih QR
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(slide.id, e.target.files[0], 'qr')} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button className="btn-save" onClick={handleSaveSlides}><Save size={16} /> Simpan Slide</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
