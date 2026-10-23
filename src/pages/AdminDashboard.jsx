import { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  Bell, Cog, Settings, Image as ImageIcon, Calendar, MessageSquare, 
  LogOut, ChevronRight, User, LayoutDashboard, MonitorPlay, 
  Activity, ShieldCheck, ClipboardList, Database, Building2, Tv, Users 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../admin.css';
import logoUnri from '../assets/LogoUnri2.png';
import localforage from 'localforage';

// Subcomponents
import ImageCropper from '../components/admin/ImageCropper';
import UserManager from '../components/admin/UserManager';
import TvScreenManager from '../components/admin/TvScreenManager';
import RoomManager from '../components/admin/RoomManager';
import ActivityLogViewer from '../components/admin/ActivityLogViewer';
import OverviewTab from '../components/admin/OverviewTab';
import SettingsTab from '../components/admin/SettingsTab';
import AnnouncementsTab from '../components/admin/AnnouncementsTab';
import SchedulesTab from '../components/admin/SchedulesTab';
import ScheduleModal from '../components/admin/ScheduleModal';
import SlidesTab from '../components/admin/SlidesTab';
import ReportsTab from '../components/admin/ReportsTab';

// Alert and formatting utilities
import { 
  showSuccessPopup, 
  showToastPopup, 
  showConfirmDelete, 
  getDynamicStatus 
} from '../utils/adminAlerts';

function AdminDashboard() {
  const [croppingImage, setCroppingImage] = useState(null);
  const { 
    basePath,
    facultyName, setFacultyName, 
    subUnitName, setSubUnitName,
    accreditation, setAccreditation,
    campusLocation, setCampusLocation,
    operationalHours, setOperationalHours,
    tagline, setTagline,
    primaryColor, setPrimaryColor,
    templateColors, setTemplateColors,
    tvLayout, setTvLayout,
    language, setLanguage,
    timezone, setTimezone,
    timeOn, setTimeOn,
    timeOff, setTimeOff,
    autoRefresh, setAutoRefresh,
    schedules, 
    announcements, 
    slides, 
    setIsAuthenticated, setCurrentUser,
    prefix, currentUser, isSuperAdmin, FACULTY_LIST,
    slideDuration, setSlideDuration,
    marqueeSpeed, setMarqueeSpeed,
    scheduleSpeed, setScheduleSpeed,
    scheduleScrollType, setScheduleScrollType,
    isDbConnected,
    saveSchedulesToDb,
    saveAnnouncementsToDb,
    saveSlidesToDb,
    saveSettingsToDb
  } = useDashboard();
  
  const navigate = useNavigate();

  // URL Layar TV: admin fakultas membuka TV fakultasnya, superadmin membuka TV unit yang sedang aktif
  const tvDisplayUrl = (currentUser?.role !== 'superadmin' && currentUser?.faculty_prefix && currentUser.faculty_prefix !== 'main')
    ? `/${currentUser.faculty_prefix}/tv`
    : (basePath ? `${basePath}/tv` : '/tv');

  const [activeTab, setActiveTab] = useState('overview');
  const [overviewLayout, setOverviewLayout] = useState('modern');

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

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

  // Master Ruangan State
  const [masterRooms, setMasterRooms] = useState([]);
  const fetchMasterRooms = async () => {
    try {
      const res = await fetch(`/api/rooms?faculty=${prefix || 'main'}`);
      if (res.ok) {
        const data = await res.json();
        setMasterRooms(data);
      }
    } catch (e) {
      console.error('Error fetching rooms:', e);
    }
  };

  useEffect(() => {
    fetchMasterRooms();
  }, [prefix]);

  const computedSchedules = schedules.map(s => ({ ...s, status: getDynamicStatus(s) }));

  const filteredSchedules = computedSchedules.filter(s => {
    const matchDate = (!reportStartDate || s.date >= reportStartDate) && (!reportEndDate || s.date <= reportEndDate);
    const matchStatus = reportStatus === 'Semua' || s.status === reportStatus;
    const matchSearch = !reportSearch || (s.title && s.title.toLowerCase().includes(reportSearch.toLowerCase()));
    return matchDate && matchStatus && matchSearch;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

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
    setCurrentUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('auth_token');
    navigate(basePath ? `${basePath}/login` : '/login');
  };

  // local states for settings
  const [localFaculty, setLocalFaculty] = useState(facultyName);
  const [localSubUnit, setLocalSubUnit] = useState(subUnitName || "UPA Perpustakaan");
  const [localAccreditation, setLocalAccreditation] = useState(accreditation || "Akreditasi Unggul");
  const [localCampusLocation, setLocalCampusLocation] = useState(campusLocation || "Kampus Bina Widya");
  const [localOperationalHours, setLocalOperationalHours] = useState(operationalHours || "08:00 - 16:00 WIB");
  const [localTagline, setLocalTagline] = useState(tagline || "");
  const [localPrimaryColor, setLocalPrimaryColor] = useState(primaryColor || "#3b82f6");
  const [localTemplateColors, setLocalTemplateColors] = useState(templateColors || {
    standard: '#1e40af',
    tu: '#1e40af',
    'agenda-focus': '#1e40af',
    'full-media': '#1e40af',
    admin: '#1e40af'
  });
  const [selectedTemplateTab] = useState('all');
  const [localTvLayout, setLocalTvLayout] = useState(tvLayout || "standard");
  const [localLanguage, setLocalLanguage] = useState(language || "id");
  const [localTimezone, setLocalTimezone] = useState(timezone || "WIB");
  const [localTimeOn, setLocalTimeOn] = useState(timeOn || "06:00");
  const [localTimeOff, setLocalTimeOff] = useState(timeOff || "22:00");
  const [localAutoRefresh, setLocalAutoRefresh] = useState(autoRefresh ?? true);
  const [localSlideDuration, setLocalSlideDuration] = useState(slideDuration);
  const [localMarqueeSpeed, setLocalMarqueeSpeed] = useState(marqueeSpeed);
  const [localScheduleSpeed, setLocalScheduleSpeed] = useState(scheduleSpeed);
  const [localScheduleScrollType, setLocalScheduleScrollType] = useState(scheduleScrollType || 'step');

  const activeWorkingColor = selectedTemplateTab === 'all'
    ? localPrimaryColor
    : (localTemplateColors?.[selectedTemplateTab] || localPrimaryColor);

  const handleColorChange = (color) => {
    if (!color) return;
    setLocalPrimaryColor(color);
    setLocalTemplateColors({
      standard: color,
      tu: color,
      'agenda-focus': color,
      'full-media': color,
      admin: color
    });
  };

  const handleSaveSettings = async () => {
    if (!isDbConnected) {
      Swal.fire({
        title: 'Database Terputus!',
        text: 'Tidak dapat menyimpan pengaturan karena database MySQL sedang mati / offline. Silakan hidupkan MySQL terlebih dahulu.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    try {
      await saveSettingsToDb({
        faculty_name: localFaculty,
        sub_unit_name: localSubUnit,
        accreditation: localAccreditation,
        campus_location: localCampusLocation,
        operational_hours: localOperationalHours,
        tagline: localTagline,
        primary_color: localPrimaryColor,
        template_colors: localTemplateColors,
        tv_layout: localTvLayout,
        language: localLanguage,
        timezone: localTimezone,
        time_on: localTimeOn,
        time_off: localTimeOff,
        auto_refresh: localAutoRefresh,
        slide_duration: localSlideDuration,
        marquee_speed: localMarqueeSpeed,
        schedule_speed: localScheduleSpeed,
        schedule_scroll_type: localScheduleScrollType
      });
      setFacultyName(localFaculty);
      setSubUnitName(localSubUnit);
      setAccreditation(localAccreditation);
      setCampusLocation(localCampusLocation);
      setOperationalHours(localOperationalHours);
      setTagline(localTagline);
      setPrimaryColor(localPrimaryColor);
      setTemplateColors(localTemplateColors);
      setTvLayout(localTvLayout);
      setLanguage(localLanguage);
      setTimezone(localTimezone);
      setTimeOn(localTimeOn);
      setTimeOff(localTimeOff);
      setAutoRefresh(localAutoRefresh);
      setScheduleSpeed(localScheduleSpeed);
      setScheduleScrollType(localScheduleScrollType);
      showSuccessPopup('Pengaturan Umum & Warna Template berhasil disimpan ke database MySQL!');
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
  };

  const [localAnnouncements, setLocalAnnouncements] = useState(announcements);
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [localSchedules, setLocalSchedules] = useState(schedules);
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

  useEffect(() => {
    if (primaryColor) setLocalPrimaryColor(primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    if (templateColors) setLocalTemplateColors(templateColors);
  }, [templateColors]);

  useEffect(() => {
    if (tvLayout) setLocalTvLayout(tvLayout);
  }, [tvLayout]);

  useEffect(() => {
    if (scheduleSpeed) setLocalScheduleSpeed(scheduleSpeed);
  }, [scheduleSpeed]);

  useEffect(() => {
    if (scheduleScrollType) setLocalScheduleScrollType(scheduleScrollType);
  }, [scheduleScrollType]);

  // Announcements Handlers
  const handleDeleteSelectedAnnouncements = () => {
    if (selectedAnnouncements.length === 0) return;
    showConfirmDelete(() => {
      setLocalAnnouncements(prev => prev.filter((_, i) => !selectedAnnouncements.includes(i)));
      setSelectedAnnouncements([]);
    });
  };

  const handleAddAnnouncement = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(nextMonth.getTime() - tzoffset)).toISOString().slice(0, 16);
    
    setLocalAnnouncements([...localAnnouncements, { id: Date.now(), text: "Pengumuman Baru", expiryDate: localISOTime }]);
    showToastPopup('Pengumuman berhasil ditambahkan');
  };

  const updateAnnouncement = (index, field, val) => {
    const newAnn = [...localAnnouncements];
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

  const handleSaveAnnouncements = async () => {
    if (!isDbConnected) {
      Swal.fire({
        title: 'Database Terputus!',
        text: 'Tidak dapat menyimpan pengumuman karena database MySQL sedang mati / terputus. Silakan aktifkan MySQL terlebih dahulu.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    try {
      await saveAnnouncementsToDb(localAnnouncements);
      setMarqueeSpeed(localMarqueeSpeed);
      showSuccessPopup('Pengumuman berhasil disimpan ke database MySQL dan diperbarui di layar TV!');
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
  };

  // Schedules Handlers
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
    showToastPopup('Jadwal berhasil diperbarui di daftar lokal. Klik "Publikasikan ke Layar TV" untuk menyimpan ke database MySQL.');
  };

  const deleteSchedule = (id) => {
    showConfirmDelete(() => {
      setLocalSchedules(prev => prev.filter(s => s.id !== id));
    });
  };

  const handleSaveSchedules = async () => {
    if (!isDbConnected) {
      Swal.fire({
        title: 'Database Terputus!',
        text: 'Tidak dapat menyimpan agenda kegiatan karena database MySQL sedang mati / terputus. Silakan aktifkan MySQL terlebih dahulu.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    try {
      await saveSchedulesToDb(localSchedules);
      setScheduleSpeed(localScheduleSpeed);
      setScheduleScrollType(localScheduleScrollType);
      showSuccessPopup('Jadwal berhasil disimpan ke database MySQL dan diperbarui di layar TV!');
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
  };

  // Slides Handlers
  const handleDeleteSelectedSlides = () => {
    if (selectedSlides.length === 0) return;
    showConfirmDelete(() => {
      setLocalSlides(prev => prev.filter(s => !selectedSlides.includes(s.id)));
      setSelectedSlides([]);
    });
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      mediaType: 'none',
      mediaUrl: '',
      tag: "Pengumuman",
      tagStyle: { background: "rgba(255,255,255,0.2)", color: "white" },
      title: "Judul Slide Baru",
      desc: "Deskripsi singkat mengenai informasi slide ini.",
      description: "Deskripsi singkat mengenai informasi slide ini.",
      btnText: "",
      btnStyle: { background: "white", color: "#1e40af" },
      bg: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
      bgColor: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
      qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id",
      qrLabel: "Pindai QR"
    };
    setLocalSlides([...localSlides, newSlide]);
    showToastPopup('Slide berhasil ditambahkan');
  };

  const updateSlide = (id, field, value) => {
    setLocalSlides(localSlides.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === 'bg') updated.bgColor = value;
      if (field === 'bgColor') updated.bg = value;
      if (field === 'desc') updated.description = value;
      if (field === 'description') updated.desc = value;
      if (field === 'qr') updated.qrUrl = value;
      if (field === 'qrUrl') updated.qr = value;
      return updated;
    }));
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
        showToastPopup('Mengunggah gambar ke server...');
        const formData = new FormData();
        formData.append('file', croppedBlob, `slide_${slideId}_${Date.now()}.jpg`);
        formData.append('faculty_prefix', prefix || 'main');
        formData.append('uploaded_by', currentUser?.username || 'admin');

        let serverUrl = null;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) serverUrl = data.url;
          }
        } catch (netErr) {
          console.warn('Gagal upload gambar ke server, fallback ke local:', netErr);
        }

        if (serverUrl) {
          updateSlide(slideId, 'mediaUrl', serverUrl);
          showToastPopup('Gambar berhasil diunggah ke server!');
        } else {
          const storageKey = `media_${slideId}_${Date.now()}`;
          await localforage.setItem(storageKey, croppedBlob);
          updateSlide(slideId, 'mediaUrl', `localforage:${storageKey}`);
          showToastPopup('Gambar tersimpan di lokal');
        }
        URL.revokeObjectURL(croppingImage.src);
        setCroppingImage(null);
      } catch(e) {
        console.error(e);
        Swal.fire('Error', 'Gagal memproses gambar crop', 'error');
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

      if (targetField === 'bg') {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const formData = new FormData();
              formData.append('file', blob, `bg_${slideId}_${Date.now()}.jpg`);
              formData.append('faculty_prefix', prefix || 'main');
              formData.append('uploaded_by', currentUser?.username || 'admin');
              const res = await fetch('/api/upload', { method: 'POST', body: formData });
              if (res.ok) {
                const data = await res.json();
                if (data.url) {
                  updateSlide(slideId, 'bg', `url('${data.url}') center/cover no-repeat`);
                  URL.revokeObjectURL(croppingImage.src);
                  URL.revokeObjectURL(objectUrl);
                  setCroppingImage(null);
                  return;
                }
              }
            } catch (err) {
              console.warn('Upload bg ke server gagal, fallback ke dataUrl', err);
            }
          }
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          updateSlide(slideId, 'bg', `url('${dataUrl}') center/cover no-repeat`);
          URL.revokeObjectURL(croppingImage.src);
          URL.revokeObjectURL(objectUrl);
          setCroppingImage(null);
        }, 'image/jpeg', 0.85);
        return;
      }
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      updateSlide(slideId, targetField, dataUrl);
      URL.revokeObjectURL(croppingImage.src);
      URL.revokeObjectURL(objectUrl);
      setCroppingImage(null);
    };
    img.src = objectUrl;
  };

  const handleMediaUpload = async (slideId, file) => {
    if (!file) return;
    
    if (file.size > 200 * 1024 * 1024) {
      Swal.fire({
        title: 'Ukuran Terlalu Besar',
        text: 'Maksimal ukuran file adalah 200MB. Silakan kompres video Anda.',
        icon: 'warning',
        confirmButtonColor: '#2f5597'
      });
      return;
    }
    
    if (file.type.startsWith('image/')) {
      handleImageUpload(slideId, file, 'mediaUrl');
      return;
    }

    try {
      showToastPopup('Mengunggah video ke server...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('faculty_prefix', prefix || 'main');
      formData.append('uploaded_by', currentUser?.username || 'admin');

      let serverUrl = null;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) serverUrl = data.url;
        }
      } catch (netErr) {
        console.warn('Gagal upload video ke server, fallback ke local:', netErr);
      }

      if (serverUrl) {
        updateSlide(slideId, 'mediaUrl', serverUrl);
        showToastPopup('Video berhasil diunggah ke server!');
      } else {
        const storageKey = `media_${slideId}_${Date.now()}`;
        await localforage.setItem(storageKey, file);
        updateSlide(slideId, 'mediaUrl', `localforage:${storageKey}`);
        showToastPopup('Video tersimpan secara lokal!');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Gagal memproses unggahan file', 'error');
    }
  };

  const handleSaveSlides = async () => {
    if (!isDbConnected) {
      Swal.fire({
        title: 'Database Terputus!',
        text: 'Tidak dapat menyimpan slide karena database MySQL sedang mati / terputus. Silakan aktifkan MySQL terlebih dahulu.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    const fallbackGradients = [
      'linear-gradient(135deg, #1c7947 0%, #2a9d5c 100%)',
      'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
    ];
    const normalized = localSlides.map((s, idx) => {
      const rawBg = s.bg || s.bgColor || '';
      const isWhiteOrEmpty = !rawBg || rawBg.trim() === '' || rawBg.toLowerCase() === '#fff' || rawBg.toLowerCase() === '#ffffff' || rawBg.toLowerCase() === 'white';
      const bgVal = isWhiteOrEmpty ? fallbackGradients[idx % fallbackGradients.length] : rawBg;
      const descVal = s.desc !== undefined ? s.desc : (s.description || '');
      const qrVal = s.qr !== undefined ? s.qr : (s.qrUrl || '');
      return {
        ...s,
        id: s.id || Date.now() + idx,
        bg: bgVal,
        bgColor: bgVal,
        desc: descVal,
        description: descVal,
        qr: qrVal,
        qrUrl: qrVal,
        mediaType: s.mediaType || 'none',
        mediaUrl: s.mediaUrl || ''
      };
    });
    try {
      await saveSlidesToDb(normalized);
      setLocalSlides(normalized);
      setSlideDuration(localSlideDuration);
      showSuccessPopup('Slide berhasil disimpan ke database MySQL dan diperbarui di layar TV!');
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img src={logoUnri} alt="Logo UNRI" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Dashboard</h2>
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
          <button className={`nav-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            <Building2 size={18} /> Master Ruangan
          </button>

          {isSuperAdmin && (
            <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ padding: '0 0.75rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pusat & Pengguna
              </div>
              <button className={`nav-btn ${activeTab === 'tv_manager' ? 'active' : ''}`} onClick={() => setActiveTab('tv_manager')}>
                <Tv size={18} /> TV Pusat (3 Layar)
              </button>
              <button className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                <Users size={18} /> Manajemen Pengguna
              </button>
              <button className={`nav-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                <ClipboardList size={18} /> Log Aktivitas Kampus
              </button>
            </div>
          )}
        </nav>
        <div className="admin-nav-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button onClick={() => window.open(tvDisplayUrl, '_blank')} className="nav-btn nav-btn-tv">
            <MonitorPlay size={18} /> Lihat TV Display
          </button>
          <button onClick={handleLogout} className="nav-btn nav-btn-logout">
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
              {activeTab === 'rooms' && 'Master Ruangan Kampus'}
              {activeTab === 'tv_manager' && 'Manajemen 3 Layar TV Pusat'}
              {activeTab === 'users' && 'Manajemen Pengguna & Akun Fakultas'}
              {activeTab === 'logs' && 'Log Audit Aktivitas Kampus'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {isSuperAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
                <Building2 size={16} color="#2563eb" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Fakultas:</span>
                <select 
                  value={prefix}
                  onChange={(e) => {
                    const sel = FACULTY_LIST.find(f => f.prefix === e.target.value);
                    if (sel) navigate(sel.path);
                  }}
                  style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer', outline: 'none' }}
                >
                  {FACULTY_LIST.map(f => (
                    <option key={f.prefix} value={f.prefix}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#67748e" />
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#ea0606', borderRadius: '50%', border: '2px solid white' }}></span>
            </div>
            <div style={{ cursor: 'pointer' }}>
              <Cog size={20} color="#67748e" />
            </div>
            <div 
              title={isDbConnected ? 'Koneksi database MySQL aktif & tersinkronisasi' : 'Koneksi database terputus. Pastikan server/index.js & MySQL berjalan.'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '999px',
                background: isDbConnected ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${isDbConnected ? '#a7f3d0' : '#fecaca'}`,
                color: isDbConnected ? '#065f46' : '#991b1b',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Database size={15} color={isDbConnected ? '#059669' : '#dc2626'} />
              <span>{isDbConnected ? 'MySQL Terhubung' : 'Database Offline'}</span>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isDbConnected ? '#10b981' : '#ef4444',
                boxShadow: isDbConnected ? '0 0 6px #10b981' : 'none'
              }} />
            </div>
            <a href={tvDisplayUrl} target="_blank" rel="noreferrer" className="view-btn">Lihat Layar TV</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isSuperAdmin ? '#eff6ff' : '#e2e8f0', color: isSuperAdmin ? '#2563eb' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSuperAdmin ? <ShieldCheck size={20} /> : <User size={18} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                  {currentUser?.name || (isSuperAdmin ? 'Super Administrator' : 'Admin Fakultas')}
                </span>
                <span style={{ fontSize: '0.75rem', color: isSuperAdmin ? '#2563eb' : '#64748b', fontWeight: 600 }}>
                  {isSuperAdmin ? 'Super Admin (Akses Semua)' : `Admin ${prefix.toUpperCase()}`}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main">
          {activeTab === 'overview' && (
            <OverviewTab 
              overviewLayout={overviewLayout}
              setOverviewLayout={setOverviewLayout}
              slides={slides}
              schedules={schedules}
              computedSchedules={computedSchedules}
              isDbConnected={isDbConnected}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              localFaculty={localFaculty}
              setLocalFaculty={setLocalFaculty}
              localSubUnit={localSubUnit}
              setLocalSubUnit={setLocalSubUnit}
              localAccreditation={localAccreditation}
              setLocalAccreditation={setLocalAccreditation}
              localCampusLocation={localCampusLocation}
              setLocalCampusLocation={setLocalCampusLocation}
              localOperationalHours={localOperationalHours}
              setLocalOperationalHours={setLocalOperationalHours}
              localTagline={localTagline}
              setLocalTagline={setLocalTagline}
              localTvLayout={localTvLayout}
              setLocalTvLayout={setLocalTvLayout}
              activeWorkingColor={activeWorkingColor}
              handleColorChange={handleColorChange}
              localSlideDuration={localSlideDuration}
              setLocalSlideDuration={setLocalSlideDuration}
              localTimeOn={localTimeOn}
              setLocalTimeOn={setLocalTimeOn}
              localTimeOff={localTimeOff}
              setLocalTimeOff={setLocalTimeOff}
              localAutoRefresh={localAutoRefresh}
              setLocalAutoRefresh={setLocalAutoRefresh}
              handleSaveSettings={handleSaveSettings}
              logoUnri={logoUnri}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsTab 
              localMarqueeSpeed={localMarqueeSpeed}
              setLocalMarqueeSpeed={setLocalMarqueeSpeed}
              localAnnouncements={localAnnouncements}
              selectedAnnouncements={selectedAnnouncements}
              setSelectedAnnouncements={setSelectedAnnouncements}
              handleDeleteSelectedAnnouncements={handleDeleteSelectedAnnouncements}
              handleAddAnnouncement={handleAddAnnouncement}
              updateAnnouncement={updateAnnouncement}
              deleteAnnouncement={deleteAnnouncement}
              handleSaveAnnouncements={handleSaveAnnouncements}
            />
          )}

          {activeTab === 'schedules' && (
            <SchedulesTab 
              localSchedules={localSchedules}
              localScheduleSpeed={localScheduleSpeed}
              setLocalScheduleSpeed={setLocalScheduleSpeed}
              localScheduleScrollType={localScheduleScrollType}
              setLocalScheduleScrollType={setLocalScheduleScrollType}
              handleAddSchedule={handleAddSchedule}
              handleEditSchedule={handleEditSchedule}
              deleteSchedule={deleteSchedule}
              handleSaveSchedules={handleSaveSchedules}
            />
          )}

          {activeTab === 'slides' && (
            <SlidesTab 
              localSlides={localSlides}
              localSlideDuration={localSlideDuration}
              setLocalSlideDuration={setLocalSlideDuration}
              selectedSlides={selectedSlides}
              setSelectedSlides={setSelectedSlides}
              handleDeleteSelectedSlides={handleDeleteSelectedSlides}
              handleAddSlide={handleAddSlide}
              handleSaveSlides={handleSaveSlides}
              deleteSlide={deleteSlide}
              updateSlide={updateSlide}
              handleImageUpload={handleImageUpload}
              handleMediaUpload={handleMediaUpload}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              filteredSchedules={filteredSchedules}
              reportStartDate={reportStartDate}
              setReportStartDate={setReportStartDate}
              reportEndDate={reportEndDate}
              setReportEndDate={setReportEndDate}
              reportStatus={reportStatus}
              setReportStatus={setReportStatus}
              reportSearch={reportSearch}
              setReportSearch={setReportSearch}
              handleExportCSV={handleExportCSV}
              facultyName={facultyName}
              logoUnri={logoUnri}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomManager />
          )}

          {activeTab === 'tv_manager' && isSuperAdmin && (
            <TvScreenManager />
          )}

          {activeTab === 'users' && isSuperAdmin && (
            <UserManager />
          )}

          {activeTab === 'logs' && isSuperAdmin && (
            <ActivityLogViewer />
          )}
        </main>
      </div>

      <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }}
        editingSchedule={editingSchedule}
        setEditingSchedule={setEditingSchedule}
        isExisting={Boolean(localSchedules.find(s => s.id === editingSchedule?.id))}
        masterRooms={masterRooms}
        onSave={handleSaveModalSchedule}
      />

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
