import { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Settings, Image as ImageIcon, Calendar, MessageSquare, Save, Trash2, Plus, Edit, LogOut, ChevronRight, User, Upload, Copy, LayoutDashboard, MonitorPlay, Activity, Download, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../admin.css';
import logoUnri from '../assets/LogoUnri2.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import localforage from 'localforage';

const showSuccessPopup = (message) => {
  Swal.fire({
    title: 'Berhasil!',
    text: message,
    icon: 'success',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#2f5597',
    timer: 2500,
    timerProgressBar: true
  });
};

const showToastPopup = (message) => {
  Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });
};

const showConfirmDelete = (onConfirm) => {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: 'Data yang dihapus tidak dapat dikembalikan!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
      showToastPopup('Data berhasil dihapus');
    }
  });
};

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

  // Filter Reports States
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().split('T')[0];
  });
  const [reportStatus, setReportStatus] = useState('Semua');
  const [reportSearch, setReportSearch] = useState('');

  const getDynamicStatus = (item) => {
    if (item.status === 'Dibatalkan') return 'Dibatalkan';
    if (item.status === 'Selesai') return 'Selesai';
    
    try {
      const scheduleDateStr = item.date || new Date().toISOString().split('T')[0];
      const startStr = item.startTime || '00:00';
      const endStr = item.endTime || '23:59';
      
      const startDateTime = new Date(`${scheduleDateStr}T${startStr}:00`);
      const endDateTime = new Date(`${scheduleDateStr}T${endStr}:00`);
      const currentTime = new Date();
      
      if (currentTime >= startDateTime && currentTime <= endDateTime) {
        return 'Berlangsung';
      } else if (currentTime > endDateTime) {
        return 'Selesai';
      } else {
        return 'Akan Datang';
      }
    } catch (e) {
      return item.status || 'Akan Datang';
    }
  };

  const computedSchedules = schedules.map(s => ({ ...s, status: getDynamicStatus(s) }));

  const filteredSchedules = computedSchedules.filter(s => {
    const matchDate = (!reportStartDate || s.date >= reportStartDate) && (!reportEndDate || s.date <= reportEndDate);
    const matchStatus = reportStatus === 'Semua' || s.status === reportStatus;
    const matchSearch = !reportSearch || (s.title && s.title.toLowerCase().includes(reportSearch.toLowerCase()));
    return matchDate && matchStatus && matchSearch;
  }).sort((a,b) => new Date(a.date) - new Date(b.date));

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Waktu', 'Nama Kegiatan', 'Status', 'Ruangan', 'PIC', 'Mitra'];
    const rows = filteredSchedules.map(s => [
      s.date,
      `${s.startTime} - ${s.endTime}`,
      `"${(s.title || '').replace(/"/g, '""')}"`,
      s.status,
      `"${(s.loc || '').replace(/"/g, '""')}"`,
      `"${(s.pic || '-').replace(/"/g, '""')}"`,
      `"${(s.partnerCategory || 'Internal').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_agenda_${reportStartDate}_sd_${reportEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    showSuccessPopup('Pengaturan Umum berhasil disimpan!');
  };

  const [localAnnouncements, setLocalAnnouncements] = useState(announcements);
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [localSchedules, setLocalSchedules] = useState(schedules);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [localSlides, setLocalSlides] = useState(slides);
  const [selectedSlides, setSelectedSlides] = useState([]);

  useEffect(() => {
    setLocalSchedules(schedules);
  }, [schedules]);

  useEffect(() => {
    setLocalAnnouncements(announcements);
  }, [announcements]);

  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  const handleDeleteSelectedAnnouncements = () => {
    if (selectedAnnouncements.length === 0) return;
    showConfirmDelete(() => {
      setLocalAnnouncements(prev => prev.filter((_, i) => !selectedAnnouncements.includes(i)));
      setSelectedAnnouncements([]);
    });
  };
  const handleDeleteAllAnnouncements = () => {
    if (localAnnouncements.length === 0) return;
    showConfirmDelete(() => {
      setLocalAnnouncements([]);
      setSelectedAnnouncements([]);
    });
  };

  const handleDeleteSelectedSchedules = () => {
    if (selectedSchedules.length === 0) return;
    showConfirmDelete(() => {
      setLocalSchedules(prev => prev.filter(s => !selectedSchedules.includes(s.id)));
      setSelectedSchedules([]);
    });
  };
  const handleDeleteAllSchedules = () => {
    if (localSchedules.length === 0) return;
    showConfirmDelete(() => {
      setLocalSchedules([]);
      setSelectedSchedules([]);
    });
  };

  const handleDeleteSelectedSlides = () => {
    if (selectedSlides.length === 0) return;
    showConfirmDelete(() => {
      setLocalSlides(prev => prev.filter(s => !selectedSlides.includes(s.id)));
      setSelectedSlides([]);
    });
  };
  const handleDeleteAllSlides = () => {
    if (localSlides.length === 0) return;
    showConfirmDelete(() => {
      setLocalSlides([]);
      setSelectedSlides([]);
    });
  };

  const handleAddAnnouncement = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Format to YYYY-MM-DDThh:mm for datetime-local input
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(nextMonth.getTime() - tzoffset)).toISOString().slice(0, 16);
    
    setLocalAnnouncements([...localAnnouncements, { id: Date.now(), text: "Pengumuman Baru", expiryDate: localISOTime }]);
    showToastPopup('Pengumuman berhasil ditambahkan');
  };

  const updateAnnouncement = (index, field, val) => {
    const newAnn = [...localAnnouncements];
    // Jika data lama string, convert on the fly (meski loadState sudah handle, ini jaga-jaga)
    if (typeof newAnn[index] === 'string') {
       newAnn[index] = { id: Date.now(), text: newAnn[index], expiryDate: '' };
    }
    newAnn[index][field] = val;
    setLocalAnnouncements(newAnn);
  };

  const deleteAnnouncement = (index) => {
    showConfirmDelete(() => {
      setLocalAnnouncements(prev => prev.filter((_, i) => i !== index));
    });
  };

  const handleSaveAnnouncements = () => {
    const now = new Date();
    const active = localAnnouncements.filter(item => {
      if (typeof item === 'string') return true;
      if (!item.expiryDate) return true;
      const expiry = new Date(item.expiryDate);
      return expiry >= now;
    });

    setAnnouncements(active);
    setMarqueeSpeed(localMarqueeSpeed);
    showSuccessPopup('Pengumuman berhasil disimpan dan diperbarui di layar TV!');
  };

  const handleAddSchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    setLocalSchedules([...localSchedules, { id: Date.now(), date: today, startTime: '09:00', endTime: '12:00', title: 'Kegiatan Baru', description: '', loc: 'Ruang Rapat 1', status: 'Otomatis', pic: '', partnerCategory: 'Internal' }]);
    showToastPopup('Jadwal berhasil ditambahkan');
  };

  const updateSchedule = (id, field, value) => {
    setLocalSchedules(localSchedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSchedule = (id) => {
    showConfirmDelete(() => {
      setLocalSchedules(prev => prev.filter(s => s.id !== id));
    });
  };

  const handleSaveSchedules = () => {
    const now = new Date();
    const active = localSchedules.filter(item => {
      try {
        const dateStr = item.date || now.toISOString().split('T')[0];
        const endStr = item.endTime || '23:59';
        const endDateTime = new Date(`${dateStr}T${endStr}:00`);
        const hideTime = new Date(endDateTime.getTime() + 10 * 60000); 
        return now <= hideTime;
      } catch (e) {
        return true;
      }
    });

    setSchedules(active);
    setScheduleSpeed(localScheduleSpeed);
    showSuccessPopup('Jadwal berhasil disimpan dan diperbarui di layar TV!');
  };

  const handleAddSlide = () => {
    setLocalSlides([...localSlides, {
      id: Date.now(),
      mediaType: 'none',
      mediaUrl: '',
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
    showToastPopup('Slide berhasil ditambahkan');
  };

  const updateSlide = (id, field, value) => {
    setLocalSlides(localSlides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSlide = (id) => {
    showConfirmDelete(() => {
      setLocalSlides(prev => prev.filter(s => s.id !== id));
    });
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

  const handleMediaUpload = async (slideId, file) => {
    if (!file) return;
    
    // We increase limit to 200MB since we use localforage (IndexedDB)
    if (file.size > 200 * 1024 * 1024) {
      Swal.fire({
        title: 'Ukuran Terlalu Besar',
        text: 'Maksimal ukuran file adalah 200MB. Silakan kompres video Anda.',
        icon: 'warning',
        confirmButtonColor: '#2f5597'
      });
      return;
    }
    
    // For small images (<2MB), base64 is still fast and easy
    if (file.type.startsWith('image/') && file.size < 2 * 1024 * 1024) {
      handleImageUpload(slideId, file, 'mediaUrl');
      return;
    }

    try {
      showToastPopup('Sedang memproses file...');
      const storageKey = `media_${slideId}_${Date.now()}`;
      await localforage.setItem(storageKey, file);
      updateSlide(slideId, 'mediaUrl', `localforage:${storageKey}`);
      showToastPopup('File berhasil diunggah!');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Gagal menyimpan file ke penyimpanan lokal', 'error');
    }
  };

  const handleSaveSlides = () => {
    setSlides(localSlides);
    setSlideDuration(localSlideDuration);
    showSuccessPopup('Slide berhasil disimpan dan diperbarui di layar TV!');
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
          <button className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <Activity size={18} /> Laporan Agenda
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
              {activeTab === 'reports' && 'Laporan Agenda'}
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
                    <p>{schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><MessageSquare /></div>
                  <div className="stat-details">
                    <h4>Total Kegiatan Bulan Ini</h4>
                    <p>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length}</p>
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

              {/* STATISTIK GRAFIK */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', margin: 0 }}>
                  <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Kegiatan Berdasarkan Status</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length },
                          { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length },
                          { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length },
                          { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                          {
                            [
                              { name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length },
                              { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length },
                              { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length },
                              { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', margin: 0 }}>
                  <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Mitra Kegiatan</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(computedSchedules.reduce((acc, curr) => {
                            const cat = curr.partnerCategory || 'Internal';
                            acc[cat] = (acc[cat] || 0) + 1;
                            return acc;
                          }, {})).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {
                            Object.entries(schedules.reduce((acc, curr) => {
                              const cat = curr.partnerCategory || 'Internal';
                              acc[cat] = (acc[cat] || 0) + 1;
                              return acc;
                            }, {})).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                            ))
                          }
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--primary-blue)', color: 'white' }}>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Laporan Singkat (One-Line Report)</h3>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0, opacity: 0.9 }}>
                  Bulan ini terdapat <strong>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length} kegiatan</strong> 
                  ({schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-')) && s.partnerCategory === 'Internal').length} Internal, {schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-')) && s.partnerCategory === 'Eksternal').length} Eksternal) 
                  dengan <strong>{schedules.filter(s => s.status === 'Berlangsung').length} kegiatan</strong> sedang berlangsung saat ini.
                </p>
              </div>
              
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Akses Cepat</h3>
                <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Pilih menu di bawah untuk langsung memperbarui konten layar TV.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn-save" onClick={() => setActiveTab('slides')} style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>Kelola Slide Foto</button>
                  <button className="btn-save" onClick={() => setActiveTab('schedules')} style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>Update Jadwal Rapat</button>
                  <button className="btn-save" onClick={() => setActiveTab('announcements')} style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>Ganti Teks Berjalan</button>
                  <button className="btn-save" onClick={() => setActiveTab('reports')} style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>Lihat Laporan</button>
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
              <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <h3 style={{ flex: 1, minWidth: '200px' }}>Daftar Pengumuman (Teks Berjalan)</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-delete" style={{ background: selectedAnnouncements.length > 0 ? '#ef4444' : '#f1f5f9', color: selectedAnnouncements.length > 0 ? 'white' : '#94a3b8', padding: '0.5rem 1rem' }} onClick={handleDeleteSelectedAnnouncements} disabled={selectedAnnouncements.length === 0}>
                    Hapus Terpilih ({selectedAnnouncements.length})
                  </button>
                  <button className="btn-delete" style={{ background: localAnnouncements.length > 0 ? '#ef4444' : '#f1f5f9', color: localAnnouncements.length > 0 ? 'white' : '#94a3b8', padding: '0.5rem 1rem' }} onClick={handleDeleteAllAnnouncements} disabled={localAnnouncements.length === 0}>
                    Hapus Semua
                  </button>
                  <button className="btn-add" onClick={handleAddAnnouncement}><Plus size={16} /> Tambah</button>
                </div>
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
                {localAnnouncements.map((ann, i) => {
                  const text = typeof ann === 'string' ? ann : ann.text;
                  const expiry = typeof ann === 'string' ? '' : ann.expiryDate;
                  return (
                  <div key={i} className="list-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                      type="checkbox"
                      checked={selectedAnnouncements.includes(i)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAnnouncements(prev => [...prev, i]);
                        else setSelectedAnnouncements(prev => prev.filter(idx => idx !== i));
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: '300px' }}>
                      <input 
                        type="text" 
                        value={text} 
                        onChange={(e) => updateAnnouncement(i, 'text', e.target.value)}
                        className="admin-input"
                        placeholder="Teks pengumuman..."
                      />
                    </div>
                    <div style={{ width: '220px' }}>
                      <input 
                        type="datetime-local" 
                        value={expiry || ''} 
                        onChange={(e) => updateAnnouncement(i, 'expiryDate', e.target.value)}
                        className="admin-input"
                        title="Waktu Berakhir"
                      />
                    </div>
                    <button className="btn-delete" onClick={() => deleteAnnouncement(i)}><Trash2 size={16} /></button>
                  </div>
                  );
                })}
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button className="btn-save" onClick={handleSaveAnnouncements}><Save size={16} /> Simpan Pengumuman</button>
              </div>
            </div>
          )}

          {/* SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
              <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <h3 style={{ flex: 1, minWidth: '200px' }}>Jadwal Kegiatan</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-delete" style={{ background: selectedSchedules.length > 0 ? '#ef4444' : '#f1f5f9', color: selectedSchedules.length > 0 ? 'white' : '#94a3b8', padding: '0.5rem 1rem' }} onClick={handleDeleteSelectedSchedules} disabled={selectedSchedules.length === 0}>
                    Hapus Terpilih ({selectedSchedules.length})
                  </button>
                  <button className="btn-delete" style={{ background: localSchedules.length > 0 ? '#ef4444' : '#f1f5f9', color: localSchedules.length > 0 ? 'white' : '#94a3b8', padding: '0.5rem 1rem' }} onClick={handleDeleteAllSchedules} disabled={localSchedules.length === 0}>
                    Hapus Semua
                  </button>
                  <button className="btn-add" onClick={handleAddSchedule}><Plus size={16} /> Tambah</button>
                </div>
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
                {localSchedules.map((schedule) => {
                  const picOptions = [
                    'Evi Susanti, S.Si., M.I.Kom.', 
                    'Gusti Maya Sari, S. IP.', 
                    'Yuliastuti, S.IP.', 
                    'Anton Yuliarto, S.Kom.', 
                    'H. Thamrin Hasan, M.Pd.', 
                    'Listya Oktaviana, S.Sos.', 
                    ''
                  ];
                  const isCustomPic = schedule.isCustomPic !== undefined ? schedule.isCustomPic : !picOptions.includes(schedule.pic || '');
                  
                  const partnerOptions = ['Internal'];
                  const isCustomPartner = schedule.isCustomPartner !== undefined ? schedule.isCustomPartner : !partnerOptions.includes(schedule.partnerCategory || 'Internal');

                  return (
                  <div key={schedule.id} className="list-item complex-item" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', transition: 'all 0.2s ease' }}>
                    <div style={{ paddingTop: '1.5rem' }}>
                    <input 
                      type="checkbox"
                      checked={selectedSchedules.includes(schedule.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSchedules(prev => [...prev, schedule.id]);
                        else setSelectedSchedules(prev => prev.filter(id => id !== schedule.id));
                      }}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0, accentColor: '#2563eb' }}
                    />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 2 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Kegiatan</label>
                          <input type="text" value={schedule.title || ''} onChange={(e) => updateSchedule(schedule.id, 'title', e.target.value)} placeholder="Contoh: Rapat Koordinasi..." className="admin-input" style={{ fontWeight: '600', fontSize: '1rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                          <select value={schedule.status === 'Dibatalkan' ? 'Dibatalkan' : 'Otomatis'} onChange={(e) => updateSchedule(schedule.id, 'status', e.target.value)} className="admin-input" style={{ fontWeight: '500' }}>
                            <option value="Otomatis">Otomatis (Sesuai Waktu)</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                          </select>
                        </div>
                        <div style={{ paddingTop: '1.4rem' }}>
                           <button className="btn-delete" onClick={() => deleteSchedule(schedule.id)} title="Hapus Kegiatan" style={{ padding: '0.6rem', borderRadius: '0.5rem' }}><Trash2 size={18} /></button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 140px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal</label>
                          <input type="date" value={schedule.date || ''} onChange={(e) => updateSchedule(schedule.id, 'date', e.target.value)} className="admin-input" />
                        </div>
                        <div style={{ flex: '1 1 200px', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu</label>
                            <input type="time" value={schedule.startTime || ''} onChange={(e) => updateSchedule(schedule.id, 'startTime', e.target.value)} className="admin-input" />
                          </div>
                          <span style={{ paddingBottom: '0.6rem', color: '#cbd5e1', fontWeight: 'bold' }}>—</span>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'transparent', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', userSelect: 'none' }}>Waktu</label>
                            <input type="time" value={schedule.endTime || ''} onChange={(e) => updateSchedule(schedule.id, 'endTime', e.target.value)} className="admin-input" />
                          </div>
                        </div>
                        <div style={{ flex: '2 1 200px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ruangan</label>
                          <select value={schedule.loc || ''} onChange={(e) => updateSchedule(schedule.id, 'loc', e.target.value)} className="admin-input">
                            <option value="">Pilih Ruangan...</option>
                            <option value="TGCL - Podcast">TGCL - Podcast</option>
                            <option value="TGCL - Meetingroom">TGCL - Meetingroom</option>
                            <option value="TGCL - Event & Training Area">TGCL - Event & Training Area</option>
                            <option value="Studio Gurindam 12">Studio Gurindam 12</option>
                            <option value="Ruang Pertemuan/Meeting Room">Ruang Pertemuan/Meeting Room</option>
                            <option value="Ruang Diskusi (Max 15 orang)">Ruang Diskusi (Max 15 orang)</option>
                            <option value="Ruang Diskusi (Max 8 orang)">Ruang Diskusi (Max 8 orang)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        <div style={{ flex: '1 1 200px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PIC Kegiatan</label>
                          <select
                            value={isCustomPic ? 'Lainnya' : (schedule.pic || '')}
                            onChange={(e) => {
                              if (e.target.value === 'Lainnya') {
                                setLocalSchedules(localSchedules.map(s => s.id === schedule.id ? { ...s, isCustomPic: true, pic: '' } : s));
                              } else {
                                setLocalSchedules(localSchedules.map(s => s.id === schedule.id ? { ...s, isCustomPic: false, pic: e.target.value } : s));
                              }
                            }}
                            className="admin-input"
                          >
                            <option value="">Pilih PIC...</option>
                            <option value="Evi Susanti, S.Si., M.I.Kom.">Evi Susanti, S.Si., M.I.Kom.</option>
                            <option value="Gusti Maya Sari, S. IP.">Gusti Maya Sari, S. IP.</option>
                            <option value="Yuliastuti, S.IP.">Yuliastuti, S.IP.</option>
                            <option value="Anton Yuliarto, S.Kom.">Anton Yuliarto, S.Kom.</option>
                            <option value="H. Thamrin Hasan, M.Pd.">H. Thamrin Hasan, M.Pd.</option>
                            <option value="Listya Oktaviana, S.Sos.">Listya Oktaviana, S.Sos.</option>
                            <option value="Lainnya">Lainnya (Isi Sendiri)...</option>
                          </select>
                          {isCustomPic && (
                            <input 
                              type="text" 
                              value={schedule.pic || ''} 
                              onChange={(e) => updateSchedule(schedule.id, 'pic', e.target.value)} 
                              className="admin-input" 
                              placeholder="Ketik nama PIC..." 
                              style={{ marginTop: '0.5rem' }}
                            />
                          )}
                        </div>
                        <div style={{ flex: '1 1 200px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kategori Mitra</label>
                          <select
                            value={isCustomPartner ? 'Eksternal' : (schedule.partnerCategory || 'Internal')}
                            onChange={(e) => {
                              if (e.target.value === 'Eksternal') {
                                setLocalSchedules(localSchedules.map(s => s.id === schedule.id ? { ...s, isCustomPartner: true, partnerCategory: '' } : s));
                              } else {
                                setLocalSchedules(localSchedules.map(s => s.id === schedule.id ? { ...s, isCustomPartner: false, partnerCategory: e.target.value } : s));
                              }
                            }}
                            className="admin-input"
                          >
                            <option value="Internal">Internal</option>
                            <option value="Eksternal">Eksternal (Isi Nama Mitra)...</option>
                          </select>
                          {isCustomPartner && (
                            <input 
                              type="text" 
                              value={schedule.partnerCategory || ''} 
                              onChange={(e) => updateSchedule(schedule.id, 'partnerCategory', e.target.value)} 
                              className="admin-input" 
                              placeholder="Ketik nama mitra..." 
                              style={{ marginTop: '0.5rem' }}
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deskripsi Tambahan <span style={{ textTransform: 'none', fontWeight: 'normal', color: '#94a3b8' }}>(Opsional)</span></label>
                        <input type="text" value={schedule.description || ''} onChange={(e) => updateSchedule(schedule.id, 'description', e.target.value)} placeholder="Tambahkan keterangan singkat tentang kegiatan..." className="admin-input" />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button className="btn-save" onClick={handleSaveSchedules}><Save size={16} /> Simpan Jadwal</button>
              </div>
            </div>
          )}

          {/* SLIDES */}
          {activeTab === 'slides' && (
            <div className="card">
              <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <h3 style={{ flex: 1, minWidth: '200px' }}>Daftar Slide Konten</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-delete" style={{ background: selectedSlides.length > 0 ? '#ef4444' : '#f1f5f9', color: selectedSlides.length > 0 ? 'white' : '#94a3b8', padding: '0.5rem 1rem' }} onClick={handleDeleteSelectedSlides} disabled={selectedSlides.length === 0}>
                    Hapus Terpilih ({selectedSlides.length})
                  </button>
                  <button className="btn-delete" style={{ background: localSlides.length > 0 ? '#ef4444' : '#f1f5f9', color: localSlides.length > 0 ? 'white' : '#94a3b8', padding: '0.5rem 1rem' }} onClick={handleDeleteAllSlides} disabled={localSlides.length === 0}>
                    Hapus Semua
                  </button>
                  <button className="btn-add" onClick={handleAddSlide}><Plus size={16} /> Tambah Slide</button>
                </div>
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
                    <div className="slide-card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input 
                        type="checkbox"
                        checked={selectedSlides.includes(slide.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSlides(prev => [...prev, slide.id]);
                          else setSelectedSlides(prev => prev.filter(id => id !== slide.id));
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <h4 style={{ margin: 0 }}>Slide #{localSlides.indexOf(slide) + 1}</h4>
                      <button className="btn-delete-text" style={{ marginLeft: 'auto' }} onClick={() => deleteSlide(slide.id)}><Trash2 size={16} /> Hapus</button>
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
                        <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                          <label>Tipe Latar Belakang (Media)</label>
                          <select 
                            value={slide.mediaType || 'none'} 
                            onChange={(e) => updateSlide(slide.id, 'mediaType', e.target.value)} 
                            className="admin-input" 
                            style={{ marginBottom: '1rem' }}
                          >
                            <option value="none">Warna / Gradien Saja (Kosong)</option>
                            <option value="image">Gambar Berita / Cover</option>
                            <option value="video">Video Latar (Auto-play)</option>
                          </select>

                          {slide.mediaType !== 'none' && (
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
                                <input 
                                  type="checkbox" 
                                  checked={slide.isMediaOnly || false} 
                                  onChange={(e) => updateSlide(slide.id, 'isMediaOnly', e.target.checked)} 
                                  style={{ width: '16px', height: '16px' }}
                                />
                                Tampilkan Media Penuh (Sembunyikan teks & QR Code)
                              </label>
                            </div>
                          )}

                          {slide.mediaType === 'none' && (
                            <>
                              <label>Warna Latar (Hex/URL Lama)</label>
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
                                    style={{ width: '100%', paddingLeft: '50px' }} 
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {slide.mediaType !== 'none' && (
                            <>
                              <label>URL / File {slide.mediaType === 'video' ? 'Video (MP4/WebM)' : 'Gambar (JPG/PNG)'}</label>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                                <input 
                                  type="text" 
                                  value={slide.mediaUrl?.startsWith('localforage:') ? '[File tersimpan di perangkat lokal]' : (slide.mediaUrl || '')} 
                                  onChange={(e) => {
                                    // if user types, overwrite the localforage tag
                                    updateSlide(slide.id, 'mediaUrl', e.target.value);
                                  }} 
                                  className="admin-input" 
                                  style={{ flex: 1 }}
                                  placeholder="Masukkan Link URL atau Upload dari Galeri..." 
                                />
                                <label className="btn-save" style={{ cursor: 'pointer', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', background: '#3b82f6', boxShadow: 'none' }}>
                                  <Upload size={16} /> Pilih File
                                  <input 
                                    type="file" 
                                    accept={slide.mediaType === 'video' ? 'video/*' : 'image/*'} 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleMediaUpload(slide.id, e.target.files[0])} 
                                  />
                                </label>
                              </div>
                              
                              <label>Skala Tampilan (Rasio Aspek)</label>
                              <select 
                                value={slide.mediaFit || 'cover'} 
                                onChange={(e) => updateSlide(slide.id, 'mediaFit', e.target.value)} 
                                className="admin-input" 
                                style={{ marginBottom: '1rem' }}
                              >
                                <option value="cover">Penuhi Layar (Cover - Tepian mungkin terpotong)</option>
                                <option value="contain">Ukuran Asli (Contain - Presisi & tidak terpotong)</option>
                              </select>
                            </>
                          )}
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

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className="card">
              <div className="card-header no-print" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Laporan Transkrip Agenda</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn-save" onClick={handleExportCSV} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#10b981' }}>
                    <Download size={16} /> Export CSV
                  </button>
                  <button className="btn-save" onClick={() => window.print()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Activity size={16} /> Cetak PDF/Print
                  </button>
                </div>
              </div>

              {/* FILTERS */}
              <div className="no-print" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontWeight: 600 }}>
                  <Filter size={16} /> <span>Filter Laporan</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Dari Tanggal</label>
                    <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="admin-input" />
                  </div>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Sampai Tanggal</label>
                    <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="admin-input" />
                  </div>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Status</label>
                    <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="admin-input">
                      <option value="Semua">Semua Status</option>
                      <option value="Akan Datang">Akan Datang</option>
                      <option value="Berlangsung">Berlangsung</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                  <div style={{ flex: '2 1 200px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Cari Nama Kegiatan</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={16} /></div>
                      <input type="text" value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} placeholder="Ketik kata kunci..." className="admin-input" style={{ paddingLeft: '35px' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Menampilkan <strong>{filteredSchedules.length}</strong> kegiatan {reportStartDate && reportEndDate ? `dari ${reportStartDate} hingga ${reportEndDate}` : ''}
                </div>
              </div>

              <div className="print-area">
                <div className="print-header">
                  <div className="print-logo-container">
                    <img src={logoUnri} alt="Logo" className="print-logo" />
                  </div>
                  <div className="print-title-container">
                    <h2 className="print-title">LAPORAN AGENDA KEGIATAN</h2>
                    <p className="print-subtitle">{facultyName}</p>
                    <p className="print-date">Periode: {reportStartDate || '-'} s/d {reportEndDate || '-'}</p>
                  </div>
                </div>
                <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '10%' }}>Tanggal</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '15%' }}>Waktu</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '25%' }}>Nama Kegiatan</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '10%' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '15%' }}>Ruangan</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '10%' }}>PIC</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '15%' }}>Mitra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '0.75rem' }}>{s.date}</td>
                        <td style={{ padding: '0.75rem' }}>{s.startTime} - {s.endTime}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.title}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            backgroundColor: s.status === 'Berlangsung' ? '#dcfce7' : s.status === 'Akan Datang' ? '#dbeafe' : s.status === 'Selesai' ? '#f3e8ff' : '#fee2e2',
                            color: s.status === 'Berlangsung' ? '#166534' : s.status === 'Akan Datang' ? '#1e40af' : s.status === 'Selesai' ? '#6b21a8' : '#991b1b'
                          }}>
                            {s.status || 'Akan Datang'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{s.loc}</td>
                        <td style={{ padding: '0.75rem' }}>{s.pic || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{s.partnerCategory || 'Internal'}</td>
                      </tr>
                    ))}
                    {filteredSchedules.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada kegiatan yang cocok dengan filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
