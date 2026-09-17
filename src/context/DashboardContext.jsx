import { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

const defaultFacultyName = "Universitas Riau";

const defaultSchedules = [
  { id: 1, time: '09:00', day: 'Hari Ini', title: 'Rapat IKU Triwulan III', loc: 'Studio (Lt.1)' },
  { id: 2, time: '10:00', day: 'Hari Ini', title: 'Rapat IKU', loc: 'Studio (Lt.1)' },
  { id: 3, time: '13:00', day: 'Hari Ini', title: 'Rapat Koordinasi Distribusi Pengadaan 2026', loc: 'Studio (Lt.1)' },
  { id: 4, time: '07:30', day: 'Besok', title: 'VAKSIN', loc: 'Ruang Rapat Lobi' },
  { id: 5, time: '08:30', day: 'Besok', title: 'Rapat Rutin Dan Persiapan AMI Profesi Dokter', loc: 'Ruang Rapat Senat (Lt.5)' },
  { id: 6, time: '09:40', day: 'Besok', title: 'Kuliah Sp.KKLP', loc: 'Kuantan Lt.1' }
];

const defaultAnnouncements = [
  "Selamat Datang di Pusat Informasi Kampus Terpadu Universitas Riau.",
  "Rapat IKU Triwulan III akan dilaksanakan pada pukul 09:00 di Gedung Rektorat.",
  "Jangan lupa untuk selalu mematuhi protokol kesehatan di lingkungan kampus.",
  "Pengisian KRS Semester Ganjil 2026/2027 telah dibuka melalui portal akademik."
];

const defaultSlides = [
  {
    id: 1,
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
    tag: "Zona Integritas",
    tagStyle: { background: "white", color: "#4a7bd1" },
    title: "Stop Kekerasan<br/>di <strong>Lingkungan UNRI!</strong>",
    desc: "Terima atau melihat tindakan kekerasan di lingkungan kampus? Jangan diam, laporkan melalui kanal resmi kami. Setiap laporan akan diproses Tim Satgas PPKS Universitas Riau.",
    btnText: "Lapor Disini",
    btnStyle: { background: "white", color: "#2f5597" },
    bg: "linear-gradient(135deg, #2f5597 0%, #4a7bd1 100%)",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unri.ac.id/lapor-kekerasan",
    qrLabel: "Scan QR Lapor"
  }
];

export function DashboardProvider({ children }) {
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved);
    
    // Fallback for corrupted slide data from previous version
    if (key === 'slides' && parsed.length > 0 && !parsed[0].bg) {
      return defaultValue;
    }
    
    return parsed;
  };

  const [facultyName, setFacultyName] = useState(() => loadState('facultyName', defaultFacultyName));
  const [schedules, setSchedules] = useState(() => loadState('schedules', defaultSchedules));
  const [announcements, setAnnouncements] = useState(() => loadState('announcements', defaultAnnouncements));
  const [slides, setSlides] = useState(() => loadState('slides', defaultSlides));
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadState('isAuthenticated', false));
  const [slideDuration, setSlideDuration] = useState(() => loadState('slideDuration', 8));
  const [marqueeSpeed, setMarqueeSpeed] = useState(() => loadState('marqueeSpeed', 20));
  const [scheduleSpeed, setScheduleSpeed] = useState(() => loadState('scheduleSpeed', 1));

  useEffect(() => localStorage.setItem('facultyName', JSON.stringify(facultyName)), [facultyName]);
  useEffect(() => localStorage.setItem('schedules', JSON.stringify(schedules)), [schedules]);
  useEffect(() => localStorage.setItem('announcements', JSON.stringify(announcements)), [announcements]);
  useEffect(() => localStorage.setItem('slides', JSON.stringify(slides)), [slides]);
  useEffect(() => localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated)), [isAuthenticated]);
  useEffect(() => localStorage.setItem('slideDuration', JSON.stringify(slideDuration)), [slideDuration]);
  useEffect(() => localStorage.setItem('marqueeSpeed', JSON.stringify(marqueeSpeed)), [marqueeSpeed]);
  useEffect(() => localStorage.setItem('scheduleSpeed', JSON.stringify(scheduleSpeed)), [scheduleSpeed]);

  // Listen to local storage changes from other tabs (Admin Dashboard)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'facultyName' && e.newValue) setFacultyName(JSON.parse(e.newValue));
      if (e.key === 'schedules' && e.newValue) setSchedules(JSON.parse(e.newValue));
      if (e.key === 'announcements' && e.newValue) setAnnouncements(JSON.parse(e.newValue));
      if (e.key === 'slides' && e.newValue) setSlides(JSON.parse(e.newValue));
      if (e.key === 'isAuthenticated' && e.newValue !== null) setIsAuthenticated(JSON.parse(e.newValue));
      if (e.key === 'slideDuration' && e.newValue) setSlideDuration(JSON.parse(e.newValue));
      if (e.key === 'marqueeSpeed' && e.newValue) setMarqueeSpeed(JSON.parse(e.newValue));
      if (e.key === 'scheduleSpeed' && e.newValue) setScheduleSpeed(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <DashboardContext.Provider value={{
      facultyName, setFacultyName,
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
