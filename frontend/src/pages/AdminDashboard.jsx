import { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  Bell, Cog, Settings, Image as ImageIcon, Calendar, MessageSquare, 
  LogOut, ChevronRight, User, LayoutDashboard, MonitorPlay, 
  Activity, ShieldCheck, ClipboardList, Database, Building2, Tv, Users,
  Menu, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/admin.css';
import logoUnri from '../assets/LogoUnri2.png';
import localforage from 'localforage';

// Subcomponents
import ImageCropper from '../components/admin/ImageCropper';
import UserManager from '../components/admin/UserManager';
import TvDeviceManager from '../components/admin/TvDeviceManager';
import FacultyTvView from '../components/admin/FacultyTvView';
import RoomManager from '../components/admin/RoomManager';
import ActivityLogViewer from '../components/admin/ActivityLogViewer';
import OverviewTab from '../components/admin/OverviewTab';
import SettingsTab from '../components/admin/SettingsTab';
import AnnouncementsTab from '../components/admin/AnnouncementsTab';
import SchedulesTab from '../components/admin/SchedulesTab';
import ScheduleModal from '../components/admin/ScheduleModal';
import SlidesTab from '../components/admin/SlidesTab';
import ReportsTab from '../components/admin/ReportsTab';

import { 
  showSuccessPopup, 
  showToastPopup, 
  showConfirmDelete, 
  getDynamicStatus,
  findRoomConflict,
  showRoomConflictPopup
} from '../utils/adminAlerts';
import { getLocalDateStr, getStartOfMonthStr, getEndOfMonthStr } from '../utils/dateUtils';
import { DEFAULT_CAMPUS_TVS, fetchCampusTvDevices } from '../utils/tvDevices';

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
    tuCardGrid, setTuCardGrid,
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
  const [pendingTvCount, setPendingTvCount] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Tutup sidebar mobile saat resize ke desktop atau saat menekan Escape
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Periksa permohonan TV pending untuk badge Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const checkPendingRequests = async () => {
        try {
          const res = await fetch('/api/tv-requests?status=pending');
          if (res.ok) {
            const data = await res.json();
            setPendingTvCount(data.length);
          }
        } catch (e) {
          // ignore
        }
      };
      checkPendingRequests();
      const interval = setInterval(checkPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Filter Reports States: Default string kosong agar menampilkan seluruh agenda secara lengkap
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportStatus, setReportStatus] = useState('Semua');
  const [reportSearch, setReportSearch] = useState('');

  // Master Ruangan State
  const [masterRooms, setMasterRooms] = useState([]);
  const fetchMasterRooms = async () => {
    try {
      const activeFaculty = currentUser?.faculty_prefix || prefix || 'main';
      const isSuper = isSuperAdmin || activeFaculty === 'main';
      const res = await fetch(`/api/rooms?faculty=${activeFaculty}${isSuper ? '&all=true' : ''}`);
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
  }, [prefix, currentUser?.faculty_prefix, isSuperAdmin]);

  // Master Perangkat TV (sinkron antara Slide dan Kegiatan)
  const activeFacPrefix = currentUser?.faculty_prefix || prefix || 'main';
  const isMainCampusAdmin = activeFacPrefix === 'main';
  const [availableTvs, setAvailableTvs] = useState(() => (isMainCampusAdmin ? DEFAULT_CAMPUS_TVS : []));
  const fetchTvDevices = async () => {
    try {
      const activeFaculty = currentUser?.faculty_prefix || prefix || 'main';
      const data = await fetchCampusTvDevices(activeFaculty);
      if (Array.isArray(data)) {
        setAvailableTvs(data);
      }
    } catch (e) {
      console.error('Error fetching tv devices:', e);
    }
  };

  useEffect(() => {
    fetchTvDevices();
  }, [prefix, currentUser?.faculty_prefix]);

  const computedSchedules = schedules.map(s => ({ ...s, status: getDynamicStatus(s) }));

  const filteredSchedules = computedSchedules.filter(s => {
    const matchDate = (!reportStartDate || s.date >= reportStartDate) && (!reportEndDate || s.date <= reportEndDate);
    const matchStatus = reportStatus === 'Semua' || s.status === reportStatus;
    const q = reportSearch.toLowerCase().trim();
    const matchSearch = !q || 
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.loc && s.loc.toLowerCase().includes(q)) ||
      (s.pic && s.pic.toLowerCase().includes(q)) ||
      (s.partnerCategory && s.partnerCategory.toLowerCase().includes(q));
    return matchDate && matchStatus && matchSearch;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleExportExcel = () => {
    const headers = ['Tanggal', 'Waktu', 'Nama Kegiatan', 'Status', 'Ruangan', 'PIC', 'Mitra'];
    const rows = filteredSchedules.map(s => [
      s.date || '-',
      `${s.startTime || '00:00'} - ${s.endTime || '23:59'}`,
      s.title || '-',
      s.status || 'Aktif',
      s.loc || '-',
      s.pic || '-',
      s.partnerCategory || 'Internal'
    ]);

    const tableRows = rows.map(r => `
      <tr>
        ${r.map(cell => `<td style="border: 1px solid #cbd5e1; padding: 6px 12px; font-size: 10pt;">${String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}
      </tr>
    `).join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; }
          th { background-color: #1e40af; color: #ffffff; font-weight: bold; border: 1px solid #0f172a; padding: 8px 12px; font-size: 11pt; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 6px 12px; font-size: 10pt; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <h3 style="font-family: Calibri, Arial, sans-serif; color: #0f172a; margin-bottom: 8px;">
          Laporan Transkrip Agenda - ${facultyName || 'Universitas Riau'}
        </h3>
        <p style="font-family: Calibri, Arial, sans-serif; color: #64748b; font-size: 10pt; margin-top: 0; margin-bottom: 16px;">
          Periode: ${reportStartDate || '-'} s/d ${reportEndDate || '-'} | Total Kegiatan: ${filteredSchedules.length}
        </p>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const periodLabel = reportStartDate && reportEndDate ? `${reportStartDate}_sd_${reportEndDate}` : 'semua_periode';
    link.download = `laporan_agenda_${periodLabel}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = handleExportExcel;

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

  // Sinkronkan nama resmi fakultas secara otomatis sesuai akun / prefix aktif
  useEffect(() => {
    if (facultyName) {
      setLocalFaculty(facultyName);
    }
  }, [facultyName]);
  const [localSubUnit, setLocalSubUnit] = useState((subUnitName && subUnitName !== 'Pusat Informasi & Layanan Terpadu') ? subUnitName : "Perpustakaan");
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
  const [localTuCardGrid, setLocalTuCardGrid] = useState(tuCardGrid || '3x2');

  useEffect(() => {
    if (tuCardGrid) setLocalTuCardGrid(tuCardGrid);
  }, [tuCardGrid]);

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
        schedule_scroll_type: localScheduleScrollType,
        tu_card_grid: localTuCardGrid
      });
      if (setTuCardGrid) setTuCardGrid(localTuCardGrid);
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

  // Flag penanda apakah pengguna sedang memiliki perubahan draft lokal yang belum disimpan
  const isAnnouncementsDirty = useRef(false);
  const isSchedulesDirty = useRef(false);
  const isScheduleSettingsDirty = useRef(false);
  const isSlidesDirty = useRef(false);
  const prevPrefixRef = useRef(prefix);

  // Jika unit/fakultas berganti, reset semua draft dan muat data baru
  useEffect(() => {
    if (prevPrefixRef.current !== prefix) {
      prevPrefixRef.current = prefix;
      isAnnouncementsDirty.current = false;
      isSchedulesDirty.current = false;
      isScheduleSettingsDirty.current = false;
      isSlidesDirty.current = false;
      setLocalSchedules(schedules);
      setLocalAnnouncements(announcements);
      setLocalSlides(slides);
    }
  }, [prefix, schedules, announcements, slides]);

  // Sinkronisasi data schedules dari DB hanya jika user tidak sedang mengedit draft lokal
  useEffect(() => {
    if (!isSchedulesDirty.current) {
      setLocalSchedules(schedules);
    }
  }, [schedules]);

  // Sinkronisasi data announcements dari DB hanya jika user tidak sedang mengedit draft lokal
  useEffect(() => {
    if (!isAnnouncementsDirty.current) {
      setLocalAnnouncements(announcements);
    }
  }, [announcements]);

  // Sinkronisasi data slides dari DB hanya jika user tidak sedang mengedit draft lokal
  useEffect(() => {
    if (!isSlidesDirty.current) {
      setLocalSlides(slides);
    }
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
    if (scheduleSpeed && !isScheduleSettingsDirty.current) {
      setLocalScheduleSpeed(scheduleSpeed);
    }
  }, [scheduleSpeed]);

  useEffect(() => {
    if (scheduleScrollType && !isScheduleSettingsDirty.current) {
      setLocalScheduleScrollType(scheduleScrollType);
    }
  }, [scheduleScrollType]);

  // Announcements Handlers
  const handleDeleteSelectedAnnouncements = () => {
    if (selectedAnnouncements.length === 0) return;
    showConfirmDelete(() => {
      isAnnouncementsDirty.current = true;
      setLocalAnnouncements(prev => prev.filter((_, i) => !selectedAnnouncements.includes(i)));
      setSelectedAnnouncements([]);
    });
  };

  const handleAddAnnouncement = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(nextMonth.getTime() - tzoffset)).toISOString().slice(0, 16);
    
    isAnnouncementsDirty.current = true;
    setLocalAnnouncements([...localAnnouncements, { id: Date.now(), text: "Pengumuman Baru", expiryDate: localISOTime }]);
    showToastPopup('Pengumuman ditambahkan ke daftar draft. Jangan lupa klik "Simpan Pengumuman ke TV".');
  };

  const updateAnnouncement = (index, field, val) => {
    isAnnouncementsDirty.current = true;
    const newAnn = [...localAnnouncements];
    if (typeof newAnn[index] === 'string') {
       newAnn[index] = { id: Date.now(), text: newAnn[index], expiryDate: '' };
    }
    newAnn[index][field] = val;
    setLocalAnnouncements(newAnn);
  };

  const deleteAnnouncement = (index) => {
    showConfirmDelete(() => {
      isAnnouncementsDirty.current = true;
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
      isAnnouncementsDirty.current = false;
      setMarqueeSpeed(localMarqueeSpeed);
      showSuccessPopup('Pengumuman berhasil disimpan ke database MySQL dan diperbarui di layar TV!');
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
  };

  // Schedules Handlers
  const handleAddSchedule = () => {
    fetchMasterRooms();
    const today = getLocalDateStr();
    setEditingSchedule({
      id: Date.now(),
      date: today,
      startTime: '09:00',
      endTime: '12:00',
      title: '',
      description: '',
      loc: '',
      status: 'Otomatis',
      pic: '',
      partnerCategory: 'Internal',
      targetTvs: []
    });
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    fetchMasterRooms();
    const targets = schedule.targetTvs || schedule.target_tvs;
    setEditingSchedule({
      ...schedule,
      targetTvs: Array.isArray(targets) ? targets : []
    });
    setIsScheduleModalOpen(true);
  };

  const updateSchedule = async (id, fieldOrUpdates, value, autoSave = false) => {
    isSchedulesDirty.current = true;
    let nextSchedules;
    setLocalSchedules(prev => {
      nextSchedules = prev.map(s => {
        if (s.id !== id) return s;
        if (typeof fieldOrUpdates === 'object' && fieldOrUpdates !== null) {
          return { ...s, ...fieldOrUpdates };
        }
        return { ...s, [fieldOrUpdates]: value };
      });
      return nextSchedules;
    });

    if (autoSave && isDbConnected && nextSchedules) {
      try {
        await saveSchedulesToDb(nextSchedules);
        isSchedulesDirty.current = false;
      } catch (err) {
        console.warn('Auto save schedule error:', err);
      }
    }
  };

  const handleSaveModalSchedule = async (passedSchedule) => {
    const s = passedSchedule || editingSchedule;
    if (!s) return;

    // 1. Validasi Nama Kegiatan
    if (!s.title || !s.title.trim()) {
      Swal.fire({
        title: 'Form Belum Lengkap',
        text: 'Nama Kegiatan wajib diisi!',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Lengkapi Data'
      });
      return;
    }

    // 2. Validasi Ruangan (dropdown ruangan wajib dipilih/diisi)
    if (!s.loc || !s.loc.trim()) {
      Swal.fire({
        title: 'Form Belum Lengkap',
        text: 'Ruangan kegiatan wajib dipilih dari daftar atau diketik nama ruangannya!',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Pilih Ruangan'
      });
      return;
    }

    // 3. Validasi Tanggal
    if (!s.date) {
      Swal.fire({
        title: 'Form Belum Lengkap',
        text: 'Tanggal pelaksanaan kegiatan wajib dipilih!',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Pilih Tanggal'
      });
      return;
    }

    // 4. Validasi Jam Mulai & Jam Selesai
    if (!s.startTime) {
      Swal.fire({
        title: 'Form Belum Lengkap',
        text: 'Waktu Mulai kegiatan wajib diisi!',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Tentukan Jam'
      });
      return;
    }

    if (!s.endTime) {
      Swal.fire({
        title: 'Form Belum Lengkap',
        text: 'Waktu Selesai kegiatan wajib diisi!',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Tentukan Jam'
      });
      return;
    }

    if (s.startTime && s.endTime && s.endTime <= s.startTime) {
      Swal.fire({
        title: 'Waktu Tidak Valid',
        text: `Waktu Selesai (${s.endTime}) tidak boleh lebih awal atau sama dengan Waktu Mulai (${s.startTime})!`,
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Perbaiki Jam'
      });
      return;
    }

    // 5. Kunci Ruangan: Cek bentrok jadwal ruangan jika ruangan & jam sama
    const roomConflict = findRoomConflict(s, localSchedules);
    if (roomConflict) {
      await showRoomConflictPopup(roomConflict, s);
      return;
    }

    // 6. Alert Peringatan: Jam / Tanggal sudah terlewat
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    const currH = String(now.getHours()).padStart(2, '0');
    const currM = String(now.getMinutes()).padStart(2, '0');
    const currTimeStr = `${currH}:${currM}`;

    let isPastWarning = null;
    if (s.date < todayStr) {
      isPastWarning = `Tanggal kegiatan (${s.date}) sudah terlewat dari hari ini (${todayStr}). Agenda masa lampau otomatis berstatus 'Selesai' dan tidak akan muncul di layar TV utama.`;
    } else if (s.date === todayStr && s.endTime && s.endTime <= currTimeStr) {
      isPastWarning = `Jam selesai kegiatan (${s.endTime}) sudah terlewat dari waktu saat ini (${currTimeStr} WIB). Agenda ini otomatis berstatus 'Selesai' dan tidak akan tayang di layar TV.`;
    }

    if (isPastWarning) {
      const confirmResult = await Swal.fire({
        title: '⚠️ Waktu Sudah Terlewat!',
        html: `
          <div style="text-align: left; font-size: 0.92rem; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; padding: 0.85rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; line-height: 1.45;">
            ${isPastWarning}
          </div>
          <p style="font-weight: 600; color: #1e293b; margin: 0; font-size: 0.95rem;">Apakah Anda tetap ingin menyimpannya sebagai arsip / riwayat kegiatan?</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Tetap Simpan',
        cancelButtonText: 'Batal & Ubah Jadwal',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b'
      });

      if (!confirmResult.isConfirmed) {
        return; // Jangan tutup modal, biarkan pengguna memperbaiki tanggal / waktu
      }
    }

    // Normalisasi kategori mitra agar tidak kosong/hilang
    const partnerCleaned = (s.partnerCategory && s.partnerCategory.trim()) 
      ? s.partnerCategory.trim() 
      : 'Internal';

    const scheduleToSave = {
      ...s,
      partnerCategory: partnerCleaned
    };

    const exists = localSchedules.find(item => item.id === scheduleToSave.id);
    const updatedSchedules = exists
      ? localSchedules.map(item => item.id === scheduleToSave.id ? scheduleToSave : item)
      : [...localSchedules, scheduleToSave];

    setLocalSchedules(updatedSchedules);
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);

    // Otomatis simpan langsung ke database MySQL & perbarui tampilan TV secara real-time!
    try {
      await saveSchedulesToDb(updatedSchedules);
      isSchedulesDirty.current = false;
      // Refresh master rooms agar ruangan baru yang diketik langsung muncul di dropdown dan menu admin
      await fetchMasterRooms();
      showSuccessPopup('Jadwal kegiatan berhasil disimpan ke database MySQL dan langsung tayang di TV!');
    } catch (err) {
      isSchedulesDirty.current = true;
      Swal.fire('Gagal Menyimpan ke Database', err.message, 'error');
    }
  };

  const deleteSchedule = (id) => {
    showConfirmDelete(async () => {
      const nextSchedules = localSchedules.filter(s => s.id !== id);
      setLocalSchedules(nextSchedules);
      try {
        await saveSchedulesToDb(nextSchedules);
        isSchedulesDirty.current = false;
        showToastPopup('Kegiatan berhasil dihapus dari database.');
      } catch (err) {
        isSchedulesDirty.current = true;
        Swal.fire('Gagal Menghapus', err.message, 'error');
      }
    });
  };

  const handleScheduleScrollTypeChange = (newType) => {
    isScheduleSettingsDirty.current = true;
    setLocalScheduleScrollType(newType);
    setScheduleScrollType(newType);
    saveSettingsToDb({ schedule_scroll_type: newType }).catch(err => {
      console.warn('Gagal menyimpan mode gulir ke database:', err);
    });
  };

  const handleScheduleSpeedChange = (newSpeed) => {
    isScheduleSettingsDirty.current = true;
    setLocalScheduleSpeed(newSpeed);
    setScheduleSpeed(newSpeed);
    saveSettingsToDb({ schedule_speed: newSpeed }).catch(err => {
      console.warn('Gagal menyimpan kecepatan gulir ke database:', err);
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
      try {
        await saveSettingsToDb({
          schedule_speed: localScheduleSpeed,
          schedule_scroll_type: localScheduleScrollType
        });
      } catch (settingsErr) {
        console.warn('Gagal simpan schedule settings ke DB:', settingsErr);
      }
      isSchedulesDirty.current = false;
      isScheduleSettingsDirty.current = false;
      setScheduleSpeed(localScheduleSpeed);
      setScheduleScrollType(localScheduleScrollType);
      showSuccessPopup('Jadwal dan Pengaturan Gulir TV berhasil disimpan ke database MySQL dan diperbarui di layar TV!');
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
  };

  // Slides Handlers
  const handleDeleteSelectedSlides = () => {
    if (selectedSlides.length === 0) return;
    showConfirmDelete(() => {
      isSlidesDirty.current = true;
      setLocalSlides(prev => prev.filter(s => !selectedSlides.includes(s.id)));
      setSelectedSlides([]);
    });
  };

  const handleAddSlide = () => {
    isSlidesDirty.current = true;
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
      qrLabel: "Pindai QR",
      duration: null,
      targetTvs: [],
      target_tvs: []
    };
    setLocalSlides(prev => [...prev, newSlide]);
    showToastPopup('Slide baru berhasil dibuat! Silakan atur detailnya.');
    return newSlide;
  };

  const updateSlide = (id, fieldOrUpdates, value) => {
    isSlidesDirty.current = true;
    setLocalSlides(prev => prev.map(s => {
      if (s.id !== id) return s;
      let updated;
      if (typeof fieldOrUpdates === 'object' && fieldOrUpdates !== null) {
        updated = { ...s, ...fieldOrUpdates };
      } else {
        updated = { ...s, [fieldOrUpdates]: value };
      }
      if (updated.bg) updated.bgColor = updated.bg;
      if (updated.bgColor) updated.bg = updated.bgColor;
      if (updated.desc !== undefined) updated.description = updated.desc;
      if (updated.description !== undefined) updated.desc = updated.description;
      if (updated.qr !== undefined) updated.qrUrl = updated.qr;
      if (updated.qrUrl !== undefined) updated.qr = updated.qrUrl;
      return updated;
    }));
  };

  const deleteSlide = (id) => {
    showConfirmDelete(() => {
      isSlidesDirty.current = true;
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
          updateSlide(slideId, { mediaUrl: serverUrl, mediaType: 'image' });
          showToastPopup('Gambar berhasil diunggah ke server!');
        } else {
          const storageKey = `media_${slideId}_${Date.now()}`;
          await localforage.setItem(storageKey, croppedBlob);
          updateSlide(slideId, { mediaUrl: `localforage:${storageKey}`, mediaType: 'image' });
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

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const formData = new FormData();
            formData.append('file', blob, `${targetField}_${slideId}_${Date.now()}.jpg`);
            formData.append('faculty_prefix', prefix || 'main');
            formData.append('uploaded_by', currentUser?.username || 'admin');
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
              const data = await res.json();
              if (data.url) {
                if (targetField === 'bg') {
                  updateSlide(slideId, 'bg', `url('${data.url}') center/cover no-repeat`);
                } else if (targetField === 'mediaUrl') {
                  updateSlide(slideId, 'mediaUrl', data.url);
                  updateSlide(slideId, 'mediaType', 'image');
                } else if (targetField === 'qr') {
                  updateSlide(slideId, 'qr', data.url);
                  updateSlide(slideId, 'qrUrl', data.url);
                } else {
                  updateSlide(slideId, targetField, data.url);
                }
                URL.revokeObjectURL(croppingImage.src);
                URL.revokeObjectURL(objectUrl);
                setCroppingImage(null);
                showToastPopup('Berkas gambar berhasil diunggah ke server!');
                return;
              }
            }
          } catch (err) {
            console.warn(`Upload ${targetField} ke server gagal, fallback ke dataUrl:`, err);
          }
        }
        // Fallback jika endpoint upload gagal
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (targetField === 'bg') {
          updateSlide(slideId, 'bg', `url('${dataUrl}') center/cover no-repeat`);
        } else if (targetField === 'mediaUrl') {
          updateSlide(slideId, 'mediaUrl', dataUrl);
          updateSlide(slideId, 'mediaType', 'image');
        } else if (targetField === 'qr') {
          updateSlide(slideId, 'qr', dataUrl);
          updateSlide(slideId, 'qrUrl', dataUrl);
        } else {
          updateSlide(slideId, targetField, dataUrl);
        }
        URL.revokeObjectURL(croppingImage.src);
        URL.revokeObjectURL(objectUrl);
        setCroppingImage(null);
      }, 'image/jpeg', 0.85);
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

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          updateSlide(slideId, { mediaUrl: data.url, mediaType: 'video' });
          showToastPopup('Video berhasil diunggah ke server!');
          return;
        }
      }
      throw new Error('Server tidak mengembalikan URL berkas');
    } catch (e) {
      console.error(e);
      Swal.fire('Gagal Unggah Video', 'Gagal mengunggah video ke server backend. Pastikan server aktif dan ukuran file di bawah 200MB.', 'error');
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
        tag: s.tag || '',
        title: typeof s.title === 'string' ? s.title : (s.title ? String(s.title) : 'Informasi'),
        bg: bgVal,
        bgColor: bgVal,
        desc: descVal,
        description: descVal,
        qr: qrVal,
        qrUrl: qrVal,
        qrLabel: s.qrLabel || 'Scan QR',
        mediaType: s.mediaType || 'none',
        mediaUrl: s.mediaUrl || '',
        isMediaOnly: Boolean(s.isMediaOnly),
        mediaFit: s.mediaFit || 'cover',
        targetTvs: s.targetTvs || s.target_tvs || [],
        target_tvs: s.targetTvs || s.target_tvs || [],
        btnText: s.btnText || '',
        btnLink: s.btnLink || '',
        sortOrder: idx + 1
      };
    });
    try {
      await saveSlidesToDb(normalized);
      try {
        await saveSettingsToDb({ slide_duration: localSlideDuration });
      } catch (settingsErr) {
        console.warn('Gagal simpan durasi slide ke settings:', settingsErr);
      }
      isSlidesDirty.current = false;
      setLocalSlides(normalized);
      setSlideDuration(localSlideDuration);
      showSuccessPopup('Slide berhasil disimpan ke database MySQL dan diperbarui di layar TV!');
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
  };

  return (
    <div className="admin-layout">
      {/* Backdrop overlay saat sidebar terbuka di layar mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', padding: '1.25rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img 
              src={logoUnri} 
              alt="Logo UNRI" 
              style={{ 
                width: '42px', 
                height: '42px', 
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.06))' 
              }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15, fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ 
                fontSize: '0.68rem', 
                fontWeight: 800, 
                letterSpacing: '1.2px', 
                textTransform: 'uppercase', 
                color: '#3b82f6' 
              }}>
                Information
              </span>
              <span style={{ 
                fontSize: '1.08rem', 
                fontWeight: 800, 
                color: '#0f172a', 
                letterSpacing: '-0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '1px'
              }}>
                <span>Dashboard</span>
                <span style={{ 
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900
                }}>
                  UPA
                </span>
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="admin-sidebar-close-btn"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Tutup Menu Dasbor"
            title="Tutup Menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="admin-nav" style={{ flex: 1 }}>
          <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>
            <LayoutDashboard size={18} /> Ringkasan
          </button>
          <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')}>
            <Settings size={18} /> Pengaturan Umum
          </button>
          <button className={`nav-btn ${activeTab === 'slides' ? 'active' : ''}`} onClick={() => handleTabChange('slides')}>
            <ImageIcon size={18} /> Manajemen Slide
          </button>
          <button className={`nav-btn ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => handleTabChange('schedules')}>
            <Calendar size={18} /> Jadwal Kegiatan
          </button>
          <button className={`nav-btn ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => handleTabChange('announcements')}>
            <MessageSquare size={18} /> Pengumuman
          </button>
          <button className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => handleTabChange('reports')}>
            <Activity size={18} /> Laporan Agenda
          </button>
          <button className={`nav-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => handleTabChange('rooms')}>
            <Building2 size={18} /> Master Ruangan
          </button>

          {!isSuperAdmin && (
            <button className={`nav-btn ${activeTab === 'tv_faculty' ? 'active' : ''}`} onClick={() => handleTabChange('tv_faculty')}>
              <Tv size={18} /> Layar TV & Pengajuan
            </button>
          )}

          {isSuperAdmin && (
            <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ padding: '0 0.75rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pusat & Pengguna
              </div>
              <button className={`nav-btn ${activeTab === 'tv_devices' ? 'active' : ''}`} onClick={() => handleTabChange('tv_devices')}>
                <Tv size={18} /> Kelola Perangkat TV
                {pendingTvCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.35)'
                  }}>
                    {pendingTvCount}
                  </span>
                )}
              </button>
              <button className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleTabChange('users')}>
                <Users size={18} /> Manajemen Pengguna
              </button>
              <button className={`nav-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => handleTabChange('logs')}>
                <ClipboardList size={18} /> Log Aktivitas Kampus
              </button>
            </div>
          )}
        </nav>
        <div className="admin-nav-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button onClick={() => { setIsMobileSidebarOpen(false); window.open(tvDisplayUrl, '_blank'); }} className="nav-btn nav-btn-tv">
            <MonitorPlay size={18} /> Lihat TV Display
          </button>
          <button onClick={() => { setIsMobileSidebarOpen(false); handleLogout(); }} className="nav-btn nav-btn-logout">
            <LogOut size={18} /> Keluar Dasbor
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-row">
            <div className="admin-header-left">
              <button 
                type="button"
                className="admin-mobile-toggle"
                onClick={() => setIsMobileSidebarOpen(prev => !prev)}
                aria-label={isMobileSidebarOpen ? "Tutup menu dasbor" : "Buka menu dasbor"}
                title="Menu Navigasi"
              >
                {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="admin-breadcrumbs">
                <span className="breadcrumb-parent" style={{ color: '#64748b', fontSize: '0.9rem' }}>Admin Dasbor</span>
                <ChevronRight size={14} className="breadcrumb-sep" style={{ color: '#94a3b8', margin: '0 0.5rem' }} />
                <h1 className="breadcrumb-title" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
                  {activeTab === 'overview' && 'Ringkasan Dasbor'}
                  {activeTab === 'settings' && 'Pengaturan Umum'}
                  {activeTab === 'slides' && 'Manajemen Slide'}
                  {activeTab === 'schedules' && 'Jadwal Kegiatan'}
                  {activeTab === 'announcements' && 'Pengumuman'}
                  {activeTab === 'reports' && 'Laporan Agenda'}
                  {activeTab === 'rooms' && 'Master Ruangan Kampus'}
                  {activeTab === 'tv_faculty' && 'Layar TV & Pengajuan Unit Fakultas'}
                  {activeTab === 'tv_devices' && 'Manajemen Perangkat TV (Pusat & Seluruh Fakultas)'}
                  {activeTab === 'users' && 'Manajemen Pengguna & Akun Fakultas'}
                  {activeTab === 'logs' && 'Log Audit Aktivitas Kampus'}
                </h1>
              </div>
            </div>

            <div className="admin-header-actions">
              {/* Selector Fakultas untuk tampilan Desktop */}
              {isSuperAdmin && (
                <div className="admin-faculty-select-wrapper desktop-only">
                  <Building2 size={16} color="#2563eb" />
                  <span className="admin-faculty-label">Fakultas:</span>
                  <select 
                    value={prefix}
                    onChange={(e) => {
                      const sel = FACULTY_LIST.find(f => f.prefix === e.target.value);
                      if (sel) navigate(sel.path);
                    }}
                    className="admin-faculty-select"
                  >
                    {FACULTY_LIST.map(f => (
                      <option key={f.prefix} value={f.prefix}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div 
                className="admin-db-status"
                title={isDbConnected ? 'Koneksi database MySQL aktif & tersinkronisasi' : 'Koneksi database terputus. Pastikan server/index.js & MySQL berjalan.'}
                style={{
                  background: isDbConnected ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${isDbConnected ? '#a7f3d0' : '#fecaca'}`,
                  color: isDbConnected ? '#065f46' : '#991b1b',
                }}
              >
                <Database size={15} color={isDbConnected ? '#059669' : '#dc2626'} />
                <span className="db-status-text">{isDbConnected ? 'MySQL Terhubung' : 'Database Offline'}</span>
                <span className="db-status-dot" style={{
                  background: isDbConnected ? '#10b981' : '#ef4444',
                  boxShadow: isDbConnected ? '0 0 6px #10b981' : 'none'
                }} />
              </div>

              <a href={tvDisplayUrl} target="_blank" rel="noreferrer" className="view-btn" title="Buka Layar TV Display">
                <MonitorPlay size={15} className="view-btn-icon" />
                <span className="view-btn-text">Lihat Layar TV</span>
              </a>

              <div className="admin-user-profile" title={currentUser?.name || (isSuperAdmin ? 'Super Administrator' : 'Admin Fakultas')}>
                <div className="admin-user-avatar" style={{ background: isSuperAdmin ? '#eff6ff' : '#e2e8f0', color: isSuperAdmin ? '#2563eb' : '#64748b' }}>
                  {isSuperAdmin ? <ShieldCheck size={18} /> : <User size={16} />}
                </div>
                <div className="admin-user-info">
                  <span className="admin-user-name">
                    {currentUser?.name || (isSuperAdmin ? 'Super Administrator' : 'Admin Fakultas')}
                  </span>
                  <span className="admin-user-role" style={{ color: isSuperAdmin ? '#2563eb' : '#64748b' }}>
                    {isSuperAdmin ? 'Super Admin (Akses Semua)' : `Admin ${prefix ? prefix.toUpperCase() : ''}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Baris Khusus Selector Fakultas untuk Layar Ponsel (Mobile Only) */}
          {isSuperAdmin && (
            <div className="admin-mobile-subbar mobile-only">
              <div className="admin-faculty-select-mobile">
                <Building2 size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', flexShrink: 0 }}>Unit:</span>
                <select 
                  value={prefix}
                  onChange={(e) => {
                    const sel = FACULTY_LIST.find(f => f.prefix === e.target.value);
                    if (sel) navigate(sel.path);
                  }}
                  className="admin-faculty-select"
                  style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis' }}
                >
                  {FACULTY_LIST.map(f => (
                    <option key={f.prefix} value={f.prefix}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
              localTuCardGrid={localTuCardGrid}
              setLocalTuCardGrid={setLocalTuCardGrid}
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
              setLocalScheduleSpeed={handleScheduleSpeedChange}
              localScheduleScrollType={localScheduleScrollType}
              setLocalScheduleScrollType={handleScheduleScrollTypeChange}
              availableTvs={availableTvs}
              handleAddSchedule={handleAddSchedule}
              handleEditSchedule={handleEditSchedule}
              updateSchedule={updateSchedule}
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
              availableTvs={availableTvs}
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

          {activeTab === 'tv_faculty' && !isSuperAdmin && (
            <FacultyTvView />
          )}

          {activeTab === 'tv_devices' && isSuperAdmin && (
            <TvDeviceManager onRequestsUpdated={setPendingTvCount} />
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
        availableTvs={availableTvs}
        existingSchedules={localSchedules}
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
