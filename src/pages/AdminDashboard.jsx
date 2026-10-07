import { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Bell, Cog, Settings, Image as ImageIcon, Calendar, MessageSquare, Save, Trash2, Plus, Edit, LogOut, ChevronRight, ChevronLeft, User, Upload, Copy, LayoutDashboard, MonitorPlay, Activity, Download, Filter, Search, X, List, LayoutGrid, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../admin.css';
import logoUnri from '../assets/LogoUnri2.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import localforage from 'localforage';
import ImageCropper from '../components/ImageCropper';

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
  const [croppingImage, setCroppingImage] = useState(null);
  const { 
    basePath,
    facultyName, setFacultyName, 
    tagline, setTagline,
    primaryColor, setPrimaryColor,
    tvLayout, setTvLayout,
    language, setLanguage,
    timezone, setTimezone,
    timeOn, setTimeOn,
    timeOff, setTimeOff,
    autoRefresh, setAutoRefresh,
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
  const [overviewLayout, setOverviewLayout] = useState('modern');

  // Schedule Views & Modal States
  const [scheduleView, setScheduleView] = useState('daftar');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleDateFrom, setScheduleDateFrom] = useState('');
  const [scheduleDateTo, setScheduleDateTo] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    navigate(`${basePath}/login`);
  };

  // local states for editing
  const [localFaculty, setLocalFaculty] = useState(facultyName);
  const [localTagline, setLocalTagline] = useState(tagline || "");
  const [localPrimaryColor, setLocalPrimaryColor] = useState(primaryColor || "#3b82f6");
  const [localTvLayout, setLocalTvLayout] = useState(tvLayout || "standard");
  const [localLanguage, setLocalLanguage] = useState(language || "id");
  const [localTimezone, setLocalTimezone] = useState(timezone || "WIB");
  const [localTimeOn, setLocalTimeOn] = useState(timeOn || "06:00");
  const [localTimeOff, setLocalTimeOff] = useState(timeOff || "22:00");
  const [localAutoRefresh, setLocalAutoRefresh] = useState(autoRefresh ?? true);
  const [localSlideDuration, setLocalSlideDuration] = useState(slideDuration);
  const [localMarqueeSpeed, setLocalMarqueeSpeed] = useState(marqueeSpeed);
  const [localScheduleSpeed, setLocalScheduleSpeed] = useState(scheduleSpeed);
  
  const handleSaveSettings = () => {
    setFacultyName(localFaculty);
    setTagline(localTagline);
    setPrimaryColor(localPrimaryColor);
    setTvLayout(localTvLayout);
    setLanguage(localLanguage);
    setTimezone(localTimezone);
    setTimeOn(localTimeOn);
    setTimeOff(localTimeOff);
    setAutoRefresh(localAutoRefresh);
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
    setAnnouncements(localAnnouncements);
    setMarqueeSpeed(localMarqueeSpeed);
    showSuccessPopup('Pengumuman berhasil disimpan dan diperbarui di layar TV!');
  };

  const handleAddSchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingSchedule({ id: Date.now(), date: today, startTime: '09:00', endTime: '12:00', title: '', description: '', loc: '', status: 'Otomatis', pic: '', partnerCategory: 'Internal' });
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule({ ...schedule });
    setIsScheduleModalOpen(true);
  };

  const handleSaveModalSchedule = () => {
    if (!editingSchedule.title) {
      Swal.fire('Error', 'Nama Kegiatan harus diisi', 'error');
      return;
    }
    const exists = localSchedules.find(s => s.id === editingSchedule.id);
    if (exists) {
      setLocalSchedules(localSchedules.map(s => s.id === editingSchedule.id ? editingSchedule : s));
    } else {
      setLocalSchedules([...localSchedules, editingSchedule]);
    }
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
    showToastPopup('Jadwal berhasil disimpan');
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
    setSchedules(localSchedules);
    setScheduleSpeed(localScheduleSpeed);
    showSuccessPopup('Jadwal berhasil disimpan dan diperbarui di layar TV!');
  };

  const schedulesWithDynamicStatus = localSchedules.map(s => ({ ...s, dynamicStatus: getDynamicStatus(s) }));
  
  const filteredSchedulesView = schedulesWithDynamicStatus.filter(s => {
    const matchSearch = !scheduleSearch || (s.title && s.title.toLowerCase().includes(scheduleSearch.toLowerCase()));
    const matchDateFrom = !scheduleDateFrom || s.date >= scheduleDateFrom;
    const matchDateTo = !scheduleDateTo || s.date <= scheduleDateTo;
    return matchSearch && matchDateFrom && matchDateTo;
  }).sort((a,b) => new Date(a.date) - new Date(b.date));

  const activeSchedulesList = filteredSchedulesView.filter(s => s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Berlangsung' || s.dynamicStatus === 'Otomatis');
  const historySchedulesList = filteredSchedulesView.filter(s => s.dynamicStatus === 'Selesai' || s.dynamicStatus === 'Dibatalkan').sort((a,b) => new Date(b.date) - new Date(a.date));

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));


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
    const objectUrl = URL.createObjectURL(file);
    setCroppingImage({
      slideId,
      targetField,
      src: objectUrl,
      aspect: targetField === 'qr' ? 1 : undefined
    });
  };

  const handleCropComplete = async (croppedBlob) => {
    const { slideId, targetField } = croppingImage;
    
    if (targetField === 'mediaUrl') {
      try {
        const storageKey = `media_${slideId}_${Date.now()}`;
        await localforage.setItem(storageKey, croppedBlob);
        updateSlide(slideId, 'mediaUrl', `localforage:${storageKey}`);
        URL.revokeObjectURL(croppingImage.src);
        setCroppingImage(null);
      } catch(e) {
        console.error(e);
        Swal.fire('Error', 'Gagal menyimpan gambar crop ke lokal', 'error');
      }
      return;
    }

    const objectUrl = URL.createObjectURL(croppedBlob);
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
      
      URL.revokeObjectURL(croppingImage.src);
      URL.revokeObjectURL(objectUrl);
      setCroppingImage(null);
    };
    img.src = objectUrl;
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
    
    // For images, redirect to cropper
    if (file.type.startsWith('image/')) {
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
        <div className="admin-nav-footer" style={{ padding: '1.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => window.open(basePath || '/', '_blank')} className="nav-btn" style={{ color: '#3b82f6' }}>
            <MonitorPlay size={18} /> Lihat TV Display
          </button>
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
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#67748e" />
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#ea0606', borderRadius: '50%', border: '2px solid white' }}></span>
            </div>
            <div style={{ cursor: 'pointer' }}>
              <Cog size={20} color="#67748e" />
            </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Layout Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LayoutDashboard size={18} color="#3b82f6"/> Tampilan Dasbor</h3>
                <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.25rem' }}>
                  <button 
                    onClick={() => setOverviewLayout('modern')}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, background: overviewLayout === 'modern' ? 'white' : 'transparent', color: overviewLayout === 'modern' ? '#3b82f6' : '#64748b', border: 'none', cursor: 'pointer', boxShadow: overviewLayout === 'modern' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  ><LayoutGrid size={16} /> Modern</button>
                  <button 
                    onClick={() => setOverviewLayout('compact')}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, background: overviewLayout === 'compact' ? 'white' : 'transparent', color: overviewLayout === 'compact' ? '#3b82f6' : '#64748b', border: 'none', cursor: 'pointer', boxShadow: overviewLayout === 'compact' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  ><List size={16} /> Kompak</button>
                  <button 
                    onClick={() => setOverviewLayout('analytics')}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, background: overviewLayout === 'analytics' ? 'white' : 'transparent', color: overviewLayout === 'analytics' ? '#3b82f6' : '#64748b', border: 'none', cursor: 'pointer', boxShadow: overviewLayout === 'analytics' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  ><Activity size={16} /> Analitik</button>
                </div>
              </div>

              {/* ==============================================
                  LAYOUT 1: MODERN (Default) 
                  ============================================== */}
              {overviewLayout === 'modern' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: 'linear-gradient(to right, #eff6ff, #ffffff)', borderLeft: '4px solid #3b82f6', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                    <div style={{ padding: '0.75rem', background: '#3b82f6', borderRadius: '50%', color: 'white' }}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1rem' }}>Ringkasan Bulan Ini</h3>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                        Terdapat <strong>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length} kegiatan</strong> {' '}
                        ({schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-')) && s.partnerCategory === 'Internal').length} Internal, {schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-')) && s.partnerCategory === 'Eksternal').length} Eksternal). 
                        Saat ini <strong>{schedules.filter(s => s.status === 'Berlangsung').length} kegiatan</strong> sedang berlangsung.
                      </p>
                    </div>
                  </div>

                  <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MonitorPlay size={24} /></div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Slide Aktif</p>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }}>{slides.length}</h3>
                      </div>
                    </div>
                    <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={24} /></div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Kegiatan Hari Ini</p>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }}>{schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</h3>
                      </div>
                    </div>
                    <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={24} /></div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Kegiatan Bulan Ini</p>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }}>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length}</h3>
                      </div>
                    </div>
                    <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={24} /></div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Status Sistem</p>
                        <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.1rem', fontWeight: 700 }}>Online</h3>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Kegiatan Berdasarkan Status</h3>
                      </div>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length },
                            { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length },
                            { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length },
                            { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length },
                          ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                              {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Mitra Kegiatan</h3>
                      </div>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                              {Object.entries(schedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card" style={{ margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Akses Cepat</h3>
                      <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Pilih menu di bawah untuk langsung memperbarui konten layar TV.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <button onClick={() => setActiveTab('slides')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><ImageIcon size={20} color="#3b82f6" /> Kelola Slide</button>
                      <button onClick={() => setActiveTab('schedules')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#a7f3d0'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><Calendar size={20} color="#10b981" /> Update Jadwal</button>
                      <button onClick={() => setActiveTab('announcements')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fed7aa'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><MessageSquare size={20} color="#f59e0b" /> Teks Berjalan</button>
                      <button onClick={() => setActiveTab('reports')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.borderColor = '#e9d5ff'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><Activity size={20} color="#8b5cf6" /> Lihat Laporan</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================
                  LAYOUT 2: COMPACT
                  ============================================== */}
              {overviewLayout === 'compact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                       <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Slide</p><h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{slides.length}</h3></div>
                       <MonitorPlay size={24} color="#3b82f6" />
                    </div>
                    <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                       <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Aktivitas Hari Ini</p><h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</h3></div>
                       <Calendar size={24} color="#10b981" />
                    </div>
                    <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                       <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Bulan Ini</p><h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length}</h3></div>
                       <MessageSquare size={24} color="#f59e0b" />
                    </div>
                    <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none', background: '#ecfdf5' }}>
                       <div><p style={{ margin: '0 0 0.2rem 0', color: '#065f46', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sistem</p><h3 style={{ margin: 0, fontSize: '1.25rem', color: '#065f46' }}>Online</h3></div>
                       <Shield size={24} color="#10b981" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', margin: 0, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                      <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem' }}>Status Kegiatan</h3>
                      <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{ name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length }, { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length }, { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length }, { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length }]} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                              {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="card" style={{ padding: '1rem', margin: 0, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem' }}>Mitra</h3>
                      <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="45%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                              {Object.entries(schedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }} />
                            <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================
                  LAYOUT 3: ANALYTICS
                  ============================================== */}
              {overviewLayout === 'analytics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div className="card" style={{ flex: 2, margin: 0, padding: '2rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Kinerja Kegiatan</h2>
                        <p style={{ color: '#64748b', margin: 0 }}>Analisis status kegiatan keseluruhan dari jadwal yang tersimpan.</p>
                      </div>
                      <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{ name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length }, { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length }, { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length }, { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length }]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 13 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                              {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 500, opacity: 0.9 }}>Total Kegiatan Selesai</h4>
                        <h1 style={{ margin: 0, fontSize: '3rem' }}>{computedSchedules.filter(s => s.status === 'Selesai').length}</h1>
                      </div>
                      <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Distribusi Mitra</h4>
                        <div style={{ flex: 1 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="40%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                {Object.entries(schedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                              <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto 2rem' }}>
              
              {/* Identitas Institusi */}
              <div className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={18} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Identitas Institusi</h3>
                </div>
                <div className="form-group">
                  <label>Nama Fakultas / Institusi Utama</label>
                  <input 
                    type="text" 
                    value={localFaculty} 
                    onChange={(e) => setLocalFaculty(e.target.value)} 
                    className="admin-input"
                    placeholder="Contoh: UNIVERSITAS RIAU"
                  />
                </div>
                <div className="form-group">
                  <label>Slogan / Tagline (Opsional)</label>
                  <input type="text" value={localTagline} onChange={(e) => setLocalTagline(e.target.value)} className="admin-input" placeholder="Contoh: Jantung Hati Masyarakat Riau" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Logo Instansi</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={logoUnri} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                    <button className="btn-save" style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}><Upload size={14} /> Ganti Logo</button>
                  </div>
                </div>
              </div>

              {/* Preferensi Tampilan */}
              <div className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: '#fdf4ff', color: '#d946ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LayoutDashboard size={18} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Preferensi Tampilan TV</h3>
                </div>
                <div className="form-group">
                  <label>Tema Warna Utama</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a'].map(color => (
                      <div 
                        key={color} 
                        onClick={() => setLocalPrimaryColor(color)}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, cursor: 'pointer', border: color === localPrimaryColor ? '3px solid #bfdbfe' : 'none', boxShadow: color === localPrimaryColor ? '0 0 0 2px white' : 'none', transform: color === localPrimaryColor ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Layout Layar Utama</label>
                  <select className="admin-input" value={localTvLayout} onChange={(e) => setLocalTvLayout(e.target.value)}>
                    <option value="standard">Standard (Slide Kiri, Agenda Kanan)</option>
                    <option value="full-media">Full Media (Slide Full Screen)</option>
                    <option value="agenda-focus">Fokus Agenda (Agenda Lebar, Slide Kecil)</option>
                    <option value="tu">Tema TU (Sidebar Kanan, Aksen Hangat)</option>
                    <option value="admin">Tema Admin (Profesional, Sidebar Lebar)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Bahasa Tampilan</label>
                  <select className="admin-input" value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value)}>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Operasional & Waktu</h3>
                </div>
                <div className="form-group">
                  <label>Zona Waktu</label>
                  <select className="admin-input" value={localTimezone} onChange={(e) => setLocalTimezone(e.target.value)}>
                    <option value="WIB">WIB (Waktu Indonesia Barat)</option>
                    <option value="WITA">WITA (Waktu Indonesia Tengah)</option>
                    <option value="WIT">WIT (Waktu Indonesia Timur)</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '1rem', marginBottom: 0 }}>
                  <div style={{ flex: 1 }}>
                    <label>Layar Nyala (On)</label>
                    <input type="time" value={localTimeOn} onChange={(e) => setLocalTimeOn(e.target.value)} className="admin-input" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Layar Mati (Standby)</label>
                    <input type="time" value={localTimeOff} onChange={(e) => setLocalTimeOff(e.target.value)} className="admin-input" />
                  </div>
                </div>
              </div>

              {/* Keamanan & Sistem */}
              <div className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={18} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Keamanan & Sistem</h3>
                </div>
                <div className="form-group">
                  <label>Ubah Password Admin</label>
                  <input type="password" placeholder="Masukkan password baru" className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Konfirmasi Password</label>
                  <input type="password" placeholder="Ulangi password baru" className="admin-input" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={localAutoRefresh} onChange={(e) => setLocalAutoRefresh(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#db2777' }} />
                    Auto-refresh data tiap 5 menit
                  </label>
                </div>
              </div>

              {/* Floating Save Bar */}
              <div style={{ gridColumn: '1 / -1', position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'center', marginTop: '1rem', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', padding: '0.75rem 1rem', borderRadius: '999px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)', display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
                  <button onClick={handleSaveSettings} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Save size={18} /> Simpan Semua Pengaturan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* BAGIAN ATAS: LIVE PREVIEW & SPEED */}
              <div className="card" style={{ padding: '2rem' }}>
                <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#344767' }}>
                      <MonitorPlay size={22} color="#cb0c9f" /> Pratinjau Layar TV
                    </h3>
                    <p style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
                      Simulasi tampilan teks berjalan pada layar utama.
                    </p>
                  </div>
                  
                  {/* SPEED CONTROL */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #e9ecef' }}>
                    <Activity size={18} color="#8392ab" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', fontWeight: 600 }}>Kecepatan (Detik):</span>
                    <input 
                      type="number" 
                      value={localMarqueeSpeed} 
                      onChange={(e) => setLocalMarqueeSpeed(Number(e.target.value))} 
                      min="5" max="60"
                      className="admin-input"
                      style={{ width: '70px', padding: '0.35rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#cb0c9f' }}
                    />
                  </div>
                </div>
                
                {/* TV SIMULATOR */}
                <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)', marginTop: '1rem' }}>
                  
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.95)', height: '55px', borderRadius: '0.5rem', overflow: 'hidden', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                    {/* BLUE BADGE */}
                    <div style={{ background: 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)', color: 'white', fontWeight: 800, padding: '0 1.5rem', height: '100%', display: 'flex', alignItems: 'center', zIndex: 10, letterSpacing: '1px', fontSize: '0.9rem', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
                      PENGUMUMAN
                    </div>
                    {/* SCROLLING TEXT */}
                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap', 
                        display: 'inline-block',
                        animation: `scroll ${localMarqueeSpeed}s linear infinite`,
                        color: '#344767',
                        fontWeight: 700,
                        fontSize: '1.15rem',
                        paddingLeft: '100%'
                      }}>
                        {localAnnouncements.length > 0 ? localAnnouncements.map(a => typeof a === 'string' ? a : a.text).join(' • ') : 'Tidak ada pengumuman aktif...'}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* BAGIAN BAWAH: LIST PENGUMUMAN */}
              <div className="card" style={{ padding: '2rem' }}>
                <div className="card-header" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef', paddingBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#344767' }}>Manajemen Daftar Pengumuman</h3>
                    <p style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>Atur teks pengumuman yang akan ditampilkan di layar bawah TV.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn-delete" onClick={handleDeleteSelectedAnnouncements} disabled={selectedAnnouncements.length === 0} style={{ opacity: selectedAnnouncements.length === 0 ? 0.5 : 1 }}>
                      Hapus Pilihan ({selectedAnnouncements.length})
                    </button>
                    <button className="btn-add" onClick={handleAddAnnouncement}>
                      <Plus size={16} /> Tambah Baru
                    </button>
                  </div>
                </div>
                
                <div className="list-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {localAnnouncements.length === 0 ? (
                    <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 500, background: '#f8f9fa', borderRadius: '1rem', border: '2px dashed #e9ecef' }}>
                      <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#344767' }}>Belum ada pengumuman.</p>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Klik tombol "Tambah Baru" di atas untuk mulai membuat teks berjalan.</p>
                    </div>
                  ) : (
                    localAnnouncements.map((ann, i) => {
                      const text = typeof ann === 'string' ? ann : ann.text;
                      const expiry = typeof ann === 'string' ? '' : ann.expiryDate;
                      return (
                      <div key={i} className="list-item" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '1rem', border: '1px solid #e9ecef', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}>
                        
                        {/* Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="checkbox"
                            checked={selectedAnnouncements.includes(i)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAnnouncements(prev => [...prev, i]);
                              else setSelectedAnnouncements(prev => prev.filter(idx => idx !== i));
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#cb0c9f' }}
                          />
                        </div>

                        {/* Input Teks */}
                        <div style={{ flex: 2 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Isi Pengumuman</label>
                          <input 
                            type="text" 
                            value={text} 
                            onChange={(e) => updateAnnouncement(i, 'text', e.target.value)}
                            className="admin-input"
                            placeholder="Tuliskan teks pengumuman di sini..."
                            style={{ fontWeight: 600, color: '#344767', width: '100%' }}
                          />
                        </div>

                        {/* Input Expiry Date */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={12} /> Tanggal Berakhir (Opsional)
                          </label>
                          <input 
                            type="datetime-local" 
                            value={expiry || ''} 
                            onChange={(e) => updateAnnouncement(i, 'expiryDate', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%', color: '#475569', fontWeight: 600 }}
                          />
                        </div>

                        {/* Action Button */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: '1.5rem' }}>
                          <button className="btn-delete" onClick={() => deleteAnnouncement(i)} style={{ padding: '0.75rem' }} title="Hapus Pengumuman">
                            <Trash2 size={18} />
                          </button>
                        </div>

                      </div>
                      );
                    })
                  )}
                </div>
                
                <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}>
                  <button className="btn-save" onClick={handleSaveAnnouncements} style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
                    <Save size={18} /> Simpan Pengumuman ke TV
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
              
              {/* HEADER & TOGGLES */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Jadwal & Agenda</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Kelola semua aktivitas operasional dan jadwal di satu tempat.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', background: 'white', borderRadius: '999px', padding: '0.3rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <button onClick={() => setScheduleView('daftar')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '999px', background: scheduleView === 'daftar' ? '#3b82f6' : 'transparent', color: scheduleView === 'daftar' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}><List size={16} /> Timeline</button>
                    <button onClick={() => setScheduleView('kalender')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '999px', background: scheduleView === 'kalender' ? '#3b82f6' : 'transparent', color: scheduleView === 'kalender' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}><Calendar size={16} /> Kalender</button>
                    <button onClick={() => setScheduleView('grid')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '999px', background: scheduleView === 'grid' ? '#3b82f6' : 'transparent', color: scheduleView === 'grid' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}><LayoutGrid size={16} /> Kanvas</button>
                  </div>
                  <button onClick={handleAddSchedule} style={{ padding: '0.85rem 1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Plus size={18} /> Entri Baru
                  </button>
                </div>
              </div>

              {/* MODERN FILTER BAR */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div style={{ flex: '2 1 250px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={18} /></div>
                  <input type="text" value={scheduleSearch} onChange={(e) => setScheduleSearch(e.target.value)} placeholder="Cari judul kegiatan, PIC, atau ruangan..." style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem', color: '#1e293b', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="date" value={scheduleDateFrom} onChange={(e) => setScheduleDateFrom(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.9rem', color: '#475569' }} />
                    <span style={{ position: 'absolute', top: '-8px', left: '12px', background: 'white', padding: '0 4px', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', borderRadius: '4px' }}>Mulai</span>
                  </div>
                  <span style={{ color: '#cbd5e1' }}>—</span>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="date" value={scheduleDateTo} onChange={(e) => setScheduleDateTo(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.9rem', color: '#475569' }} />
                    <span style={{ position: 'absolute', top: '-8px', left: '12px', background: 'white', padding: '0 4px', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', borderRadius: '4px' }}>Akhir</span>
                  </div>
                </div>
              </div>

              {/* VIEW: DAFTAR (TIMELINE LAYOUT) */}
              {scheduleView === 'daftar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  
                  {/* ACTIVE SCHEDULES */}
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '8px', height: '24px', background: '#3b82f6', borderRadius: '4px' }}></div>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Aktivitas Mendatang & Berlangsung</h4>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{activeSchedulesList.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activeSchedulesList.map((s) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '1.25rem 1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }} onMouseOver={e => {e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';}} onMouseOut={e => {e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';}}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: s.dynamicStatus === 'Berlangsung' ? '#10b981' : '#3b82f6' }}></div>
                          
                          <div style={{ width: '160px', paddingLeft: '0.5rem' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>{s.startTime}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>s/d {s.endTime}</div>
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>{s.title}</h4>
                            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14}/> {s.date}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><LayoutGrid size={14}/> {s.loc || '-'}</span>
                              {s.pic && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14}/> {s.pic}</span>}
                            </div>
                          </div>

                          <div style={{ width: '130px', textAlign: 'center' }}>
                             <span style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: s.dynamicStatus === 'Berlangsung' ? '#ecfdf5' : '#eff6ff', color: s.dynamicStatus === 'Berlangsung' ? '#059669' : '#2563eb', border: `1px solid ${s.dynamicStatus === 'Berlangsung' ? '#a7f3d0' : '#bfdbfe'}`, display: 'inline-block' }}>
                              {s.dynamicStatus}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                            <button onClick={() => handleEditSchedule(s)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }} title="Edit" onMouseOver={e => {e.currentTarget.style.background = '#e2e8f0';}} onMouseOut={e => {e.currentTarget.style.background = '#f8fafc';}}><Edit size={16} /></button>
                            <button onClick={() => deleteSchedule(s.id)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s' }} title="Hapus" onMouseOver={e => {e.currentTarget.style.background = '#fee2e2';}} onMouseOut={e => {e.currentTarget.style.background = '#fef2f2';}}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                      {activeSchedulesList.length === 0 && (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                          <Calendar size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                          <h4 style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>Belum ada aktivitas baru.</h4>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* HISTORY LOG */}
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                      <div style={{ width: '8px', height: '24px', background: '#94a3b8', borderRadius: '4px' }}></div>
                      <h4 style={{ margin: 0, color: '#475569', fontSize: '1.25rem' }}>Log Historis</h4>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{historySchedulesList.length}</span>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                      {/* Timeline line */}
                      <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }}></div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {historySchedulesList.map((s) => (
                          <div key={s.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'transparent', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', opacity: 0.75 }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.75}>
                            {/* Timeline dot */}
                            <div style={{ position: 'absolute', left: '-22px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: s.dynamicStatus === 'Selesai' ? '#cbd5e1' : '#fca5a5', border: '2px solid white', zIndex: 2 }}></div>
                            
                            <div style={{ width: '120px' }}>
                              <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>{s.date}</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{s.startTime}</div>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: '#334155', fontWeight: 600 }}>{s.title}</h4>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.loc}</div>
                            </div>

                            <div style={{ width: '110px', textAlign: 'center' }}>
                               <span style={{ padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: s.dynamicStatus === 'Selesai' ? '#f1f5f9' : '#fef2f2', color: s.dynamicStatus === 'Selesai' ? '#64748b' : '#dc2626' }}>
                                {s.dynamicStatus}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem' }}>
                              <button onClick={() => handleEditSchedule(s)} style={{ padding: '0.4rem', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}><Edit size={14} /></button>
                              <button onClick={() => deleteSchedule(s.id)} style={{ padding: '0.4rem', background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                        {historySchedulesList.length === 0 && (
                          <div style={{ padding: '2rem', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Riwayat bersih.
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW: GRID (KANVAS) */}
              {scheduleView === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                  {filteredSchedulesView.map(s => (
                    <div key={s.id} style={{ position: 'relative', background: 'white', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {/* Decorative Gradient Blob */}
                      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '120px', height: '120px', background: s.dynamicStatus === 'Berlangsung' ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0 }}></div>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <span style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: s.dynamicStatus === 'Berlangsung' ? '#10b981' : s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Otomatis' ? '#3b82f6' : s.dynamicStatus === 'Selesai' ? '#94a3b8' : '#ef4444', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          {s.dynamicStatus}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} /> {s.date}</span>
                      </div>
                      
                      <h4 style={{ position: 'relative', zIndex: 1, margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.3, fontWeight: 800 }}>{s.title}</h4>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem', fontSize: '0.9rem', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Activity size={14} /></div>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{s.startTime} - {s.endTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><LayoutGrid size={14} /></div>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.loc || 'Belum diatur'}</span>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                          <User size={14} />
                          <span style={{ fontWeight: 500, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.pic || 'Tanpa PIC'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditSchedule(s)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', color: '#475569', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}><Edit size={14} /></button>
                          <button onClick={() => deleteSchedule(s.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSchedulesView.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                      <LayoutGrid size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                      <h4 style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>Kanvas kosong. Tidak ada data.</h4>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: KALENDER (MODERN) */}
              {scheduleView === 'kalender' && (
                <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', background: 'linear-gradient(to right, #f8fafc, #ffffff)', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>{currentMonth.getFullYear()}</span>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: 800 }}>{currentMonth.toLocaleString('id-ID', { month: 'long' })}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={prevMonth} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform='scale(1.05)'}} onMouseOut={e => {e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform='scale(1)'}}><ChevronLeft size={20} /></button>
                      <button onClick={nextMonth} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform='scale(1.05)'}} onMouseOut={e => {e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform='scale(1)'}}><ChevronRight size={20} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9', background: '#fafaf9' }}>
                    {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day, idx) => (
                      <div key={day} style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: 700, color: idx === 0 || idx === 6 ? '#94a3b8' : '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{day.substring(0,3)}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', gap: '1px' }}>
                    {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                      <div key={'empty-'+i} style={{ padding: '1rem', minHeight: '140px', background: '#f8fafc' }}></div>
                    ))}
                    {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const daySchedules = localSchedules.filter(s => s.date === dateStr);
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      return (
                        <div key={day} style={{ padding: '0.75rem', minHeight: '140px', background: isToday ? '#f0fdfa' : 'white', position: 'relative', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = isToday ? '#f0fdfa' : '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = isToday ? '#f0fdfa' : 'white'}>
                          <div style={{ fontWeight: 800, color: isToday ? '#0d9488' : '#334155', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ background: isToday ? '#14b8a6' : 'transparent', color: isToday ? 'white' : 'inherit', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem' }}>{day}</span>
                            {daySchedules.length > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }}></span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {daySchedules.map(s => (
                              <div key={s.id} onClick={() => handleEditSchedule(s)} style={{ padding: '0.35rem 0.5rem', background: s.dynamicStatus === 'Berlangsung' ? '#dcfce7' : s.dynamicStatus === 'Selesai' ? '#f1f5f9' : '#eff6ff', color: s.dynamicStatus === 'Berlangsung' ? '#166534' : s.dynamicStatus === 'Selesai' ? '#64748b' : '#1e40af', fontSize: '0.75rem', borderRadius: '0.35rem', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, borderLeft: `3px solid ${s.dynamicStatus === 'Berlangsung' ? '#10b981' : s.dynamicStatus === 'Selesai' ? '#94a3b8' : '#3b82f6'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} title={s.title}>
                                {s.startTime} {s.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FLOATING SAVE BAR */}
              <div style={{ position: 'sticky', bottom: '2rem', left: 0, right: 0, marginTop: '3rem', zIndex: 10 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '1rem 1.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Kecepatan Scroll TV (Normal=1):</label>
                    <input 
                      type="number" 
                      value={localScheduleSpeed} 
                      onChange={(e) => setLocalScheduleSpeed(Number(e.target.value))} 
                      className="admin-input"
                      min="0.1"
                      step="0.1"
                      style={{ width: '80px', padding: '0.4rem', margin: 0, borderRadius: '0.5rem', textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                  <button onClick={handleSaveSchedules} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Save size={16} /> Publikasikan ke Layar TV
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* SLIDES */}
          {activeTab === 'slides' && (
            <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
              
              {/* HEADER */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Manajemen Slide Konten</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Atur tampilan gambar, video, dan pesan utama di layar TV Anda.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.5rem 0.75rem 0.5rem 1rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                     <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <Activity size={16} color="#64748b" /> Durasi / Slide:
                     </label>
                     <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '0.2rem 0.4rem', gap: '0.25rem' }}>
                       <input 
                          type="number" 
                          value={localSlideDuration} 
                          onChange={(e) => setLocalSlideDuration(Number(e.target.value))} 
                          min="1"
                          style={{ width: '40px', border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, color: '#3b82f6', textAlign: 'center', fontSize: '0.9rem', padding: 0 }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>dtk</span>
                     </div>
                  </div>

                  <button onClick={handleDeleteSelectedSlides} disabled={selectedSlides.length === 0} style={{ padding: '0.75rem 1.25rem', background: selectedSlides.length > 0 ? '#fef2f2' : 'white', color: selectedSlides.length > 0 ? '#ef4444' : '#cbd5e1', border: `1px solid ${selectedSlides.length > 0 ? '#fecaca' : '#e2e8f0'}`, borderRadius: '999px', cursor: selectedSlides.length > 0 ? 'pointer' : 'not-allowed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                    <Trash2 size={16} /> Hapus ({selectedSlides.length})
                  </button>
                  <button onClick={handleAddSlide} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Plus size={18} /> Tambah Slide
                  </button>
                </div>
              </div>

              <div className="slide-grid">
                {localSlides.map((slide, index) => (
                  <div key={slide.id} className="slide-card-admin">
                    <div className="slide-card-header">
                      <input 
                        type="checkbox"
                        checked={selectedSlides.includes(slide.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSlides(prev => [...prev, slide.id]);
                          else setSelectedSlides(prev => prev.filter(id => id !== slide.id));
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>Slide #{index + 1}</h4>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.25rem', background: slide.mediaType === 'video' ? '#fef08a' : slide.mediaType === 'image' ? '#dcfce7' : '#e0e7ff', color: slide.mediaType === 'video' ? '#854d0e' : slide.mediaType === 'image' ? '#166534' : '#3730a3', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {slide.mediaType === 'none' ? 'Teks & Warna' : slide.mediaType}
                        </span>
                      </div>
                      <button onClick={() => deleteSlide(slide.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', borderRadius: '0.35rem', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2';}} onMouseOut={e => {e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent';}} title="Hapus Slide">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="slide-card-body">
                      {/* Konten Teks */}
                      <div className="slide-section">
                        <div className="slide-section-title"><MessageSquare size={14} /> KONTEN TEKS</div>
                        <div className="form-group">
                          <label>Label Tag (Contoh: PENGUMUMAN)</label>
                          <input type="text" value={slide.tag} onChange={(e) => updateSlide(slide.id, 'tag', e.target.value)} className="admin-input" style={{ background: 'white' }} />
                        </div>
                        <div className="form-group">
                          <label>Judul Utama</label>
                          <textarea value={typeof slide.title === 'string' ? slide.title : slide.title.props?.children?.join('') || 'Judul'} onChange={(e) => updateSlide(slide.id, 'title', e.target.value)} className="admin-input" rows="2" style={{ background: 'white', minHeight: '60px', resize: 'vertical' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Deskripsi Tambahan</label>
                          <textarea value={slide.desc} onChange={(e) => updateSlide(slide.id, 'desc', e.target.value)} className="admin-input" rows="3" style={{ background: 'white', minHeight: '80px', resize: 'vertical' }} />
                        </div>
                      </div>

                      {/* Konten Media */}
                      <div className="slide-section">
                        <div className="slide-section-title"><ImageIcon size={14} /> MEDIA & LATAR BELAKANG</div>
                        
                        <div className="form-group">
                          <label>Tipe Latar Belakang</label>
                          <select 
                            value={slide.mediaType || 'none'} 
                            onChange={(e) => updateSlide(slide.id, 'mediaType', e.target.value)} 
                            className="admin-input" 
                            style={{ background: 'white', fontWeight: 600, color: '#3b82f6' }}
                          >
                            <option value="none">Hanya Warna / Gradien</option>
                            <option value="image">Gambar (JPG/PNG)</option>
                            <option value="video">Video Latar (MP4/WebM)</option>
                          </select>
                        </div>

                        {slide.mediaType !== 'none' && (
                          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#334155', fontWeight: 600, margin: 0 }}>
                              <input 
                                type="checkbox" 
                                checked={slide.isMediaOnly || false} 
                                onChange={(e) => updateSlide(slide.id, 'isMediaOnly', e.target.checked)} 
                                style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                              />
                              Mode Full-Screen Media (Sembunyikan Teks)
                            </label>
                          </div>
                        )}

                        {slide.mediaType === 'none' ? (
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Pilih Warna Latar</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                              <input 
                                type="color" 
                                value={slide.bg.startsWith('#') ? slide.bg.slice(0, 7) : '#2f5597'} 
                                onChange={(e) => updateSlide(slide.id, 'bg', e.target.value)} 
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', padding: 0 }}
                              />
                              <input 
                                type="text" 
                                value={slide.bg} 
                                onChange={(e) => updateSlide(slide.id, 'bg', e.target.value)} 
                                className="admin-input" 
                                style={{ border: 'none', boxShadow: 'none', background: 'transparent' }} 
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="form-group">
                              <label>Upload File Media</label>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input 
                                  type="text" 
                                  value={slide.mediaUrl?.startsWith('localforage:') ? '[File tersimpan secara lokal]' : (slide.mediaUrl || '')} 
                                  onChange={(e) => updateSlide(slide.id, 'mediaUrl', e.target.value)} 
                                  className="admin-input" 
                                  style={{ background: 'white', flex: 1, fontSize: '0.8rem' }}
                                  placeholder="Link URL gambar/video..." 
                                />
                                <label style={{ cursor: 'pointer', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', background: '#3b82f6', color: 'white', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#2563eb'} onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}>
                                  <Upload size={16} /> Browse
                                  <input 
                                    type="file" 
                                    accept={slide.mediaType === 'video' ? 'video/*' : 'image/*'} 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleMediaUpload(slide.id, e.target.files[0])} 
                                  />
                                </label>
                              </div>
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Mode Tampilan Media</label>
                              <select 
                                value={slide.mediaFit || 'cover'} 
                                onChange={(e) => updateSlide(slide.id, 'mediaFit', e.target.value)} 
                                className="admin-input" 
                                style={{ background: 'white' }}
                              >
                                <option value="cover">Penuhi Layar (Cover)</option>
                                <option value="contain">Ukuran Asli (Contain)</option>
                                <option value="fill">Tarik Penuh (Fill)</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      {/* QR Code */}
                      <div className="slide-section" style={{ background: '#fdf4ff', borderColor: '#fbcfe8' }}>
                        <div className="slide-section-title" style={{ color: '#d946ef' }}><ImageIcon size={14} /> KODE QR (OPSIONAL)</div>
                        <div className="form-group">
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #fbcfe8' }}>
                            <input 
                                type="text" 
                                value={slide.qr} 
                                onChange={(e) => updateSlide(slide.id, 'qr', e.target.value)} 
                                className="admin-input" 
                                style={{ border: 'none', boxShadow: 'none', flex: 1 }} 
                                placeholder="Link gambar QR..." 
                            />
                            <label style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', background: '#d946ef', color: 'white', borderRadius: '0.35rem', fontWeight: 600, fontSize: '0.8rem' }}>
                              <Upload size={14} /> Upload QR
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(slide.id, e.target.files[0], 'qr')} />
                            </label>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a21caf', marginBottom: '0.25rem', display: 'block' }}>Ukuran (px)</label>
                            <input type="number" value={slide.qrSize || 240} onChange={(e) => updateSlide(slide.id, 'qrSize', parseInt(e.target.value))} className="admin-input" style={{ background: 'white', borderColor: '#fbcfe8' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a21caf', marginBottom: '0.25rem', display: 'block' }}>Potongan QR</label>
                            <select value={slide.qrFit || 'cover'} onChange={(e) => updateSlide(slide.id, 'qrFit', e.target.value)} className="admin-input" style={{ background: 'white', borderColor: '#fbcfe8' }}>
                              <option value="cover">Cover</option>
                              <option value="contain">Contain</option>
                              <option value="fill">Fill</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {localSlides.length === 0 && (
                <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1.5rem', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#94a3b8' }}>
                    <ImageIcon size={40} />
                  </div>
                  <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>Belum ada slide</h3>
                  <p style={{ color: '#64748b', margin: '0 0 1.5rem 0' }}>Mulai buat slide pertama Anda untuk ditampilkan di layar TV.</p>
                  <button onClick={handleAddSlide} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                    <Plus size={18} /> Buat Slide Baru
                  </button>
                </div>
              )}

              {/* FLOATING SAVE BAR */}
              <div style={{ position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'center', marginTop: '3rem', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', padding: '0.75rem 1rem', borderRadius: '999px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)', display: 'flex', alignItems: 'center', gap: '1rem', pointerEvents: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem', borderRight: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Total: {localSlides.length} Slide</span>
                  </div>
                  <button onClick={handleSaveSlides} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Save size={18} /> Publikasikan ke TV
                  </button>
                </div>
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
            {isScheduleModalOpen && editingSchedule && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{localSchedules.find(s => s.id === editingSchedule.id) ? 'Ubah Kegiatan' : 'Tambah Kegiatan Baru'}</h3>
              <button onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Kegiatan</label>
                <input type="text" value={editingSchedule.title} onChange={(e) => setEditingSchedule({...editingSchedule, title: e.target.value})} className="admin-input" placeholder="Misal: Rapat Koordinasi..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal</label>
                  <input type="date" value={editingSchedule.date} onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})} className="admin-input" />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                  <select value={editingSchedule.status === 'Dibatalkan' ? 'Dibatalkan' : 'Otomatis'} onChange={(e) => setEditingSchedule({...editingSchedule, status: e.target.value})} className="admin-input">
                    <option value="Otomatis">Otomatis (Sesuai Waktu)</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu Mulai</label>
                  <input type="time" value={editingSchedule.startTime} onChange={(e) => setEditingSchedule({...editingSchedule, startTime: e.target.value})} className="admin-input" />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu Selesai</label>
                  <input type="time" value={editingSchedule.endTime} onChange={(e) => setEditingSchedule({...editingSchedule, endTime: e.target.value})} className="admin-input" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ruangan</label>
                <select value={['TGCL - Podcast', 'TGCL - Meetingroom', 'TGCL - Event & Training Area', 'Studio Gurindam 12', 'Ruang Pertemuan/Meeting Room', 'Ruang Diskusi (Max 15 orang)', 'Ruang Diskusi (Max 8 orang)'].includes(editingSchedule.loc) ? editingSchedule.loc : (editingSchedule.loc ? 'Lainnya' : '')} onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value === 'Lainnya' ? '' : e.target.value})} className="admin-input">
                  <option value="">Pilih Ruangan...</option>
                  <option value="TGCL - Podcast">TGCL - Podcast</option>
                  <option value="TGCL - Meetingroom">TGCL - Meetingroom</option>
                  <option value="TGCL - Event & Training Area">TGCL - Event & Training Area</option>
                  <option value="Studio Gurindam 12">Studio Gurindam 12</option>
                  <option value="Ruang Pertemuan/Meeting Room">Ruang Pertemuan/Meeting Room</option>
                  <option value="Ruang Diskusi (Max 15 orang)">Ruang Diskusi (Max 15 orang)</option>
                  <option value="Ruang Diskusi (Max 8 orang)">Ruang Diskusi (Max 8 orang)</option>
                  <option value="Lainnya">Lainnya (Isi Sendiri)...</option>
                </select>
                {!['TGCL - Podcast', 'TGCL - Meetingroom', 'TGCL - Event & Training Area', 'Studio Gurindam 12', 'Ruang Pertemuan/Meeting Room', 'Ruang Diskusi (Max 15 orang)', 'Ruang Diskusi (Max 8 orang)', ''].includes(editingSchedule.loc) && (
                  <input type="text" value={editingSchedule.loc} onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value})} className="admin-input" placeholder="Ketik nama ruangan..." style={{ marginTop: '0.5rem' }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PIC Kegiatan</label>
                  <select value={['Evi Susanti, S.Si., M.I.Kom.', 'Gusti Maya Sari, S. IP.', 'Yuliastuti, S.IP.', 'Anton Yuliarto, S.Kom.', 'H. Thamrin Hasan, M.Pd.', 'Listya Oktaviana, S.Sos.'].includes(editingSchedule.pic) ? editingSchedule.pic : (editingSchedule.pic ? 'Lainnya' : '')} onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value === 'Lainnya' ? '' : e.target.value})} className="admin-input">
                    <option value="">Pilih PIC...</option>
                    <option value="Evi Susanti, S.Si., M.I.Kom.">Evi Susanti, S.Si., M.I.Kom.</option>
                    <option value="Gusti Maya Sari, S. IP.">Gusti Maya Sari, S. IP.</option>
                    <option value="Yuliastuti, S.IP.">Yuliastuti, S.IP.</option>
                    <option value="Anton Yuliarto, S.Kom.">Anton Yuliarto, S.Kom.</option>
                    <option value="H. Thamrin Hasan, M.Pd.">H. Thamrin Hasan, M.Pd.</option>
                    <option value="Listya Oktaviana, S.Sos.">Listya Oktaviana, S.Sos.</option>
                    <option value="Lainnya">Lainnya (Isi Sendiri)...</option>
                  </select>
                  {!['Evi Susanti, S.Si., M.I.Kom.', 'Gusti Maya Sari, S. IP.', 'Yuliastuti, S.IP.', 'Anton Yuliarto, S.Kom.', 'H. Thamrin Hasan, M.Pd.', 'Listya Oktaviana, S.Sos.', ''].includes(editingSchedule.pic) && (
                    <input type="text" value={editingSchedule.pic} onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value})} className="admin-input" placeholder="Ketik nama PIC..." style={{ marginTop: '0.5rem' }} />
                  )}
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kategori Mitra</label>
                  <select value={editingSchedule.partnerCategory === 'Internal' ? 'Internal' : 'Eksternal'} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value === 'Eksternal' ? '' : 'Internal'})} className="admin-input">
                    <option value="Internal">Internal</option>
                    <option value="Eksternal">Eksternal (Isi Nama Mitra)...</option>
                  </select>
                  {editingSchedule.partnerCategory !== 'Internal' && (
                    <input type="text" value={editingSchedule.partnerCategory} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value})} className="admin-input" placeholder="Ketik nama mitra..." style={{ marginTop: '0.5rem' }} />
                  )}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deskripsi Tambahan</label>
                <textarea value={editingSchedule.description} onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})} className="admin-input" placeholder="Tambahkan keterangan singkat tentang kegiatan..." rows="2"></textarea>
              </div>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#f8fafc', borderRadius: '0 0 0.75rem 0.75rem' }}>
              <button onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Batal</button>
              <button onClick={handleSaveModalSchedule} style={{ padding: '0.6rem 1.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Save size={16} /> Simpan</button>
            </div>
          </div>
        </div>
      )}
{croppingImage && (
        <ImageCropper 
          imageSrc={croppingImage.src}
          initialAspect={croppingImage.aspect}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            URL.revokeObjectURL(croppingImage.src);
            setCroppingImage(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
