import { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

const defaultTagline = "Jantung Hati Masyarakat Riau";
const defaultPrimaryColor = "#3b82f6";
const defaultTvLayout = "standard";
const defaultLanguage = "id";
const defaultTimezone = "WIB";
const defaultTimeOn = "06:00";
const defaultTimeOff = "22:00";
const defaultAutoRefresh = true;

const defaultSchedules = [
  { id: 1, date: '2026-09-22', startTime: '09:00', endTime: '12:00', title: 'Rapat IKU Triwulan III', description: 'Evaluasi kinerja triwulan', loc: 'Studio (Lt.1)', status: 'Berlangsung', pic: 'Biro Umum', partnerCategory: 'Internal' },
  { id: 2, date: '2026-09-22', startTime: '10:00', endTime: '11:00', title: 'Rapat IKU', description: 'Lanjutan evaluasi', loc: 'Ruang Rapat Senat (Lt.5)', status: 'Akan Datang', pic: 'Bagian Keuangan', partnerCategory: 'Internal' },
  { id: 3, date: '2026-09-22', startTime: '13:00', endTime: '15:00', title: 'Rapat Koordinasi Distribusi Pengadaan 2026', description: 'Persiapan distribusi alat', loc: 'Studio (Lt.1)', status: 'Akan Datang', pic: 'Tim Pengadaan', partnerCategory: 'Eksternal' },
  { id: 4, date: '2026-09-23', startTime: '07:30', endTime: '10:00', title: 'VAKSIN', description: 'Vaksinasi booster', loc: 'Ruang Rapat Lobi', status: 'Akan Datang', pic: 'Dinas Kesehatan', partnerCategory: 'Eksternal' },
  { id: 5, date: '2026-09-23', startTime: '08:30', endTime: '12:00', title: 'Rapat Rutin Dan Persiapan AMI Profesi Dokter', description: 'Rapat rutin bulanan', loc: 'Ruang Rapat Senat (Lt.5)', status: 'Akan Datang', pic: 'Fakultas Kedokteran', partnerCategory: 'Internal' },
  { id: 6, date: '2026-09-23', startTime: '09:40', endTime: '11:40', title: 'Kuliah Sp.KKLP', description: 'Kuliah umum', loc: 'Kuantan Lt.1', status: 'Akan Datang', pic: 'Program Studi', partnerCategory: 'Internal' }
];

const getNextMonthDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

const defaultAnnouncements = [
  { id: 1, text: "Selamat Datang di Pusat Informasi Kampus Terpadu Universitas Riau.", expiryDate: getNextMonthDate() },
  { id: 2, text: "Rapat IKU Triwulan III akan dilaksanakan pada pukul 09:00 di Gedung Rektorat.", expiryDate: getNextMonthDate() },
  { id: 3, text: "Jangan lupa untuk selalu mematuhi protokol kesehatan di lingkungan kampus.", expiryDate: getNextMonthDate() },
  { id: 4, text: "Pengisian KRS Semester Ganjil 2026/2027 telah dibuka melalui portal akademik.", expiryDate: getNextMonthDate() }
];

const defaultSlides = [
  {
    id: 1,
    mediaType: 'none',
    mediaUrl: '',
    tag: "Whistle Blower System",
    tagStyle: { background: "rgba(255,255,255,0.2)", color: "white" },
    title: "Laporkan Pelanggaran<br/>Integritas <strong>UNRI!</strong>",
    desc: "Temukan korupsi, pungli, kecurangan akademik, atau pemalsuan dokumen? Laporkan sekarang! Identitas pelapor dijamin aman dan rahasia. Bersama wujudkan Universitas Riau menuju WBK dan WBBM!",
    btnText: "Laporkan Sekarang",
    btnStyle: { background: "var(--primary-blue)", color: "white" },
    bg: "linear-gradient(135deg, #1c7947 0%, #2a9d5c 100%)",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id/lapor",
    qrLabel: "Scan untuk Melapor"
  },
  {
    id: 2,
    mediaType: 'none',
    mediaUrl: '',
    tag: "Zona Integritas",
    tagStyle: { background: "white", color: "#4a7bd1" },
    title: "Stop Kekerasan<br/>di <strong>Lingkungan UNRI!</strong>",
    desc: "Terima atau melihat tindakan kekerasan di lingkungan kampus? Jangan diam, laporkan melalui kanal resmi kami. Setiap laporan akan diproses Tim Satgas PPKS Universitas Riau.",
    btnText: "",
    btnStyle: { background: "white", color: "#2f5597" },
    bg: "linear-gradient(135deg, #2f5597 0%, #4a7bd1 100%)",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id/lapor-kekerasan",
    qrLabel: "Scan QR Lapor"
  }
];

export function DashboardProvider({ children, prefix = 'main', defaultFacultyNameOverride = 'Universitas Riau' }) {
  const getKey = (key) => prefix === 'main' ? key : `${prefix}_${key}`;

  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(getKey(key));
    if (!saved) return defaultValue;
    try {
      const parsed = JSON.parse(saved);
      
      // Data Migration
      if (key === 'announcements' && Array.isArray(parsed)) {
        return parsed.map((item, idx) => {
          if (typeof item === 'string') {
            return { id: Date.now() + idx, text: item, expiryDate: getNextMonthDate() };
          }
          return item;
        });
      }
      
      if (key === 'schedules' && Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          pic: item.pic || '-',
          partnerCategory: item.partnerCategory || 'Internal'
        }));
      }

      if (key === 'slides' && Array.isArray(parsed)) {
        if (parsed.length > 0 && !parsed[0].bg) return defaultValue;
        return parsed.map(item => ({
          ...item,
          mediaType: item.mediaType || 'none',
          mediaUrl: item.mediaUrl || ''
        }));
      }
      
      return parsed;
    } catch (e) {
      return defaultValue;
    }
  };

  const [facultyName, setFacultyName] = useState(() => loadState('facultyName', defaultFacultyNameOverride));
  const [tagline, setTagline] = useState(() => loadState('tagline', defaultTagline));
  const [primaryColor, setPrimaryColor] = useState(() => loadState('primaryColor', defaultPrimaryColor));
  const [tvLayout, setTvLayout] = useState(() => loadState('tvLayout', defaultTvLayout));
  const [language, setLanguage] = useState(() => loadState('language', defaultLanguage));
  const [timezone, setTimezone] = useState(() => loadState('timezone', defaultTimezone));
  const [timeOn, setTimeOn] = useState(() => loadState('timeOn', defaultTimeOn));
  const [timeOff, setTimeOff] = useState(() => loadState('timeOff', defaultTimeOff));
  const [autoRefresh, setAutoRefresh] = useState(() => loadState('autoRefresh', defaultAutoRefresh));
  const [schedules, setSchedules] = useState(() => loadState('schedules', defaultSchedules));
  const [announcements, setAnnouncements] = useState(() => loadState('announcements', defaultAnnouncements));
  const [slides, setSlides] = useState(() => loadState('slides', defaultSlides));
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadState('isAuthenticated', false));
  const [slideDuration, setSlideDuration] = useState(() => loadState('slideDuration', 8));
  const [marqueeSpeed, setMarqueeSpeed] = useState(() => loadState('marqueeSpeed', 20));
  const [scheduleSpeed, setScheduleSpeed] = useState(() => loadState('scheduleSpeed', 1));

  useEffect(() => localStorage.setItem(getKey('facultyName'), JSON.stringify(facultyName)), [facultyName, prefix]);
  useEffect(() => localStorage.setItem(getKey('tagline'), JSON.stringify(tagline)), [tagline, prefix]);
  useEffect(() => localStorage.setItem(getKey('primaryColor'), JSON.stringify(primaryColor)), [primaryColor, prefix]);
  useEffect(() => localStorage.setItem(getKey('tvLayout'), JSON.stringify(tvLayout)), [tvLayout, prefix]);
  useEffect(() => localStorage.setItem(getKey('language'), JSON.stringify(language)), [language, prefix]);
  useEffect(() => localStorage.setItem(getKey('timezone'), JSON.stringify(timezone)), [timezone, prefix]);
  useEffect(() => localStorage.setItem(getKey('timeOn'), JSON.stringify(timeOn)), [timeOn, prefix]);
  useEffect(() => localStorage.setItem(getKey('timeOff'), JSON.stringify(timeOff)), [timeOff, prefix]);
  useEffect(() => localStorage.setItem(getKey('autoRefresh'), JSON.stringify(autoRefresh)), [autoRefresh, prefix]);
  useEffect(() => localStorage.setItem(getKey('schedules'), JSON.stringify(schedules)), [schedules, prefix]);
  useEffect(() => localStorage.setItem(getKey('announcements'), JSON.stringify(announcements)), [announcements, prefix]);
  useEffect(() => localStorage.setItem(getKey('slides'), JSON.stringify(slides)), [slides, prefix]);
  useEffect(() => localStorage.setItem(getKey('isAuthenticated'), JSON.stringify(isAuthenticated)), [isAuthenticated, prefix]);
  useEffect(() => localStorage.setItem(getKey('slideDuration'), JSON.stringify(slideDuration)), [slideDuration, prefix]);
  useEffect(() => localStorage.setItem(getKey('marqueeSpeed'), JSON.stringify(marqueeSpeed)), [marqueeSpeed, prefix]);
  useEffect(() => localStorage.setItem(getKey('scheduleSpeed'), JSON.stringify(scheduleSpeed)), [scheduleSpeed, prefix]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === getKey('facultyName') && e.newValue) setFacultyName(JSON.parse(e.newValue));
      if (e.key === getKey('tagline') && e.newValue) setTagline(JSON.parse(e.newValue));
      if (e.key === getKey('primaryColor') && e.newValue) setPrimaryColor(JSON.parse(e.newValue));
      if (e.key === getKey('tvLayout') && e.newValue) setTvLayout(JSON.parse(e.newValue));
      if (e.key === getKey('language') && e.newValue) setLanguage(JSON.parse(e.newValue));
      if (e.key === getKey('timezone') && e.newValue) setTimezone(JSON.parse(e.newValue));
      if (e.key === getKey('timeOn') && e.newValue) setTimeOn(JSON.parse(e.newValue));
      if (e.key === getKey('timeOff') && e.newValue) setTimeOff(JSON.parse(e.newValue));
      if (e.key === getKey('autoRefresh') && e.newValue !== null) setAutoRefresh(JSON.parse(e.newValue));
      if (e.key === getKey('schedules') && e.newValue) setSchedules(JSON.parse(e.newValue));
      if (e.key === getKey('announcements') && e.newValue) setAnnouncements(JSON.parse(e.newValue));
      if (e.key === getKey('slides') && e.newValue) setSlides(JSON.parse(e.newValue));
      if (e.key === getKey('isAuthenticated') && e.newValue !== null) setIsAuthenticated(JSON.parse(e.newValue));
      if (e.key === getKey('slideDuration') && e.newValue) setSlideDuration(JSON.parse(e.newValue));
      if (e.key === getKey('marqueeSpeed') && e.newValue) setMarqueeSpeed(JSON.parse(e.newValue));
      if (e.key === getKey('scheduleSpeed') && e.newValue) setScheduleSpeed(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [prefix]);

  const basePath = prefix === 'main' ? '' : `/${prefix}`;

  return (
    <DashboardContext.Provider value={{
      basePath, prefix,
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
      isAuthenticated, setIsAuthenticated,
      slideDuration, setSlideDuration,
      marqueeSpeed, setMarqueeSpeed,
      scheduleSpeed, setScheduleSpeed
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
