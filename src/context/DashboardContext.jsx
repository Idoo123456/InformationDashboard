import { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

const defaultTagline = "Jantung Hati Masyarakat Riau";
const defaultPrimaryColor = "#1e40af";
const defaultTvLayout = "standard";
const defaultTemplateColors = {
  standard: "#1e40af",
  tu: "#1e40af",
  "agenda-focus": "#1e40af",
  "full-media": "#1e40af",
  admin: "#1e40af"
};
const defaultLanguage = "id";
const defaultTimezone = "WIB";
const defaultTimeOn = "06:00";
const defaultTimeOff = "22:00";
const defaultAutoRefresh = true;

const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const defaultSchedules = [
  // MINGGU INI (12 KEGIATAN: 2 HALAMAN SLIDE DENGAN GRID 3x2)
  { id: 1, date: getRelativeDate(0), startTime: '08:30', endTime: '10:30', title: 'Rapat IKU Triwulan III', description: 'Evaluasi kinerja triwulan & capaian sasaran', loc: 'Studio (Lt.1)', status: 'Berlangsung', pic: 'Biro Umum', partnerCategory: 'Internal' },
  { id: 2, date: getRelativeDate(0), startTime: '11:00', endTime: '12:30', title: 'Koordinasi Sarana Prasarana', description: 'Review kebutuhan logistik & inventaris', loc: 'Ruang Senat (Lt.5)', status: 'Akan Datang', pic: 'Bagian Umum', partnerCategory: 'Internal' },
  { id: 3, date: getRelativeDate(0), startTime: '13:30', endTime: '15:30', title: 'Distribusi Pengadaan Lab 2026', description: 'Persiapan distribusi alat riset terpadu', loc: 'Gedung Rektorat', status: 'Akan Datang', pic: 'Tim Pengadaan', partnerCategory: 'Eksternal' },
  { id: 4, date: getRelativeDate(1), startTime: '08:30', endTime: '11:00', title: 'Rapat Rutin Persiapan AMI', description: 'Audit mutu internal akademik fakultas', loc: 'Ruang Rapat Senat', status: 'Akan Datang', pic: 'Fakultas Kedokteran', partnerCategory: 'Internal' },
  { id: 5, date: getRelativeDate(1), startTime: '13:00', endTime: '15:00', title: 'Sosialisasi Tata Tertib Kampus', description: 'Pembinaan karakter civitas akademika', loc: 'Auditorium FKIP', status: 'Akan Datang', pic: 'BEM & DPM', partnerCategory: 'Internal' },
  { id: 6, date: getRelativeDate(2), startTime: '09:00', endTime: '11:30', title: 'Kuliah Tamu Spesialis KKLP', description: 'Kuliah umum pakar kedokteran keluarga', loc: 'Kuantan Lt.1', status: 'Akan Datang', pic: 'Program Studi', partnerCategory: 'Internal' },
  { id: 7, date: getRelativeDate(2), startTime: '13:30', endTime: '15:00', title: 'FGD Hilirisasi Riset Sawit', description: 'Pengembangan inovasi riset hilirisasi', loc: 'LPPM UNRI', status: 'Akan Datang', pic: 'Pusat Studi Riset', partnerCategory: 'Eksternal' },
  { id: 8, date: getRelativeDate(3), startTime: '08:00', endTime: '10:30', title: 'Bimtek Penulisan Jurnal Scopus', description: 'Pelatihan publikasi artikel ilmiah', loc: 'Lab Komputer Lt.2', status: 'Akan Datang', pic: 'Lembaga Publikasi', partnerCategory: 'Internal' },
  { id: 9, date: getRelativeDate(4), startTime: '09:00', endTime: '11:00', title: 'Evaluasi Pembelajaran UTS', description: 'Rapat koordinasi dosen pengampu MK', loc: 'Ruang Sidang Lt.3', status: 'Akan Datang', pic: 'Wakil Dekan I', partnerCategory: 'Internal' },
  { id: 10, date: getRelativeDate(4), startTime: '13:30', endTime: '15:30', title: 'Workshop Akreditasi Program Studi', description: 'Sinkronisasi borang pemenuhan mutu LAM', loc: 'Ruang Rapat Senat', status: 'Akan Datang', pic: 'Badan Penjamin Mutu', partnerCategory: 'Internal' },
  { id: 11, date: getRelativeDate(5), startTime: '07:30', endTime: '09:30', title: 'Senam Pagi & Silaturahmi Dosen', description: 'Kegiatan kebugaran jasmani civitas', loc: 'Lapangan Rektorat', status: 'Akan Datang', pic: 'Biro Kemahasiswaan', partnerCategory: 'Internal' },
  { id: 12, date: getRelativeDate(6), startTime: '08:30', endTime: '12:00', title: 'Donor Darah Sukarela KSR PMI', description: 'Aksi sosial kemanusiaan kampus terpadu', loc: 'Gedung PKM Gobah', status: 'Akan Datang', pic: 'KSR PMI UNRI', partnerCategory: 'Eksternal' },

  // YANG AKAN DATANG (12 KEGIATAN: 2 HALAMAN SLIDE DENGAN GRID 3x2)
  { id: 13, date: getRelativeDate(7), startTime: '08:00', endTime: '12:00', title: 'Vaksinasi Booster & MCU Pegawai', description: 'Pemeriksaan kesehatan berkala civitas', loc: 'Lobi Utama Rektorat', status: 'Akan Datang', pic: 'Klinik & Dinkes', partnerCategory: 'Eksternal' },
  { id: 14, date: getRelativeDate(7), startTime: '13:30', endTime: '15:30', title: 'Koordinasi Penerimaan Maba', description: 'Persiapan jalur seleksi nasional SNBP', loc: 'Ruang Senat Rektorat', status: 'Akan Datang', pic: 'Biro Akademik', partnerCategory: 'Internal' },
  { id: 15, date: getRelativeDate(8), startTime: '09:00', endTime: '15:00', title: 'Lokakarya Kurikulum Berbasis OBE', description: 'Penyusunan kurikulum capaian luaran', loc: 'Hotel Grand Central', status: 'Akan Datang', pic: 'LPPMP UNRI', partnerCategory: 'Internal' },
  { id: 16, date: getRelativeDate(8), startTime: '13:00', endTime: '15:00', title: 'MoU Kemitraan Industri Energi', description: 'Nota kesepahaman program magang riset', loc: 'Ruang Rapat Pimpinan', status: 'Akan Datang', pic: 'Bagian Kerjasama', partnerCategory: 'Eksternal' },
  { id: 17, date: getRelativeDate(9), startTime: '10:00', endTime: '12:00', title: 'Seminar Nasional Sains Teknologi', description: 'Diseminasi hasil riset terapan unggulan', loc: 'Gedung PKM UNRI', status: 'Akan Datang', pic: 'Fakultas Teknik', partnerCategory: 'Internal' },
  { id: 18, date: getRelativeDate(10), startTime: '08:30', endTime: '11:30', title: 'Pelatihan Auditor Mutu Internal', description: 'Sertifikasi kompetensi auditor kampus', loc: 'Ruang Multimedia', status: 'Akan Datang', pic: 'Badan Mutu UNRI', partnerCategory: 'Internal' },
  { id: 19, date: getRelativeDate(11), startTime: '13:30', endTime: '16:00', title: 'Rapat Pagu Anggaran RKA-KL 2027', description: 'Sinkronisasi usulan pagu prioritas', loc: 'Ruang Senat (Lt.5)', status: 'Akan Datang', pic: 'Biro Perencanaan', partnerCategory: 'Internal' },
  { id: 20, date: getRelativeDate(14), startTime: '09:00', endTime: '12:00', title: 'Wisuda Pascasarjana & Sarjana', description: 'Prosesi wisuda periode wisudawan 2026', loc: 'Gedung PKM Gobah', status: 'Akan Datang', pic: 'Panitia Wisuda', partnerCategory: 'Internal' },
  { id: 21, date: getRelativeDate(18), startTime: '08:30', endTime: '14:30', title: 'Audit Eksternal ISO 9001:2015', description: 'Surveillance audit manajemen mutu', loc: 'Seluruh Unit Kerja', status: 'Akan Datang', pic: 'Badan Sertifikasi', partnerCategory: 'Eksternal' },
  { id: 22, date: getRelativeDate(21), startTime: '10:00', endTime: '12:30', title: 'Kuliah Umum Hubungan Diplomatik', description: 'Studium generale kerjasama global', loc: 'Auditorium Rektorat', status: 'Akan Datang', pic: 'Biro Kerjasama Luar Negeri', partnerCategory: 'Eksternal' },
  { id: 23, date: getRelativeDate(25), startTime: '08:30', endTime: '16:00', title: 'Pekan Ilmiah Mahasiswa 2026', description: 'Kompetisi karya tulis dan prototipe inovasi', loc: 'Gedung PKM Gobah', status: 'Akan Datang', pic: 'Biro Kemahasiswaan', partnerCategory: 'Internal' },
  { id: 24, date: getRelativeDate(28), startTime: '09:00', endTime: '12:00', title: 'Rapat Koordinasi Evaluasi Tahunan', description: 'Pleno laporan kinerja akhir tahun', loc: 'Ruang Senat (Lt.5)', status: 'Akan Datang', pic: 'Rektorat', partnerCategory: 'Internal' }
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

export const defaultSlides = [
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
        if (parsed.length < 24) {
          return defaultSchedules;
        }
        return parsed.map((item, idx) => {
          let itemDate = item.date;
          if (itemDate === '2026-09-22' || itemDate === '2026-09-23') {
            const offsets = [0, 0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 6, 7, 7, 8, 8, 9, 10, 11, 14, 18, 21, 25, 28];
            itemDate = getRelativeDate(offsets[idx % offsets.length]);
          }
          return {
            ...item,
            date: itemDate,
            pic: item.pic || '-',
            partnerCategory: item.partnerCategory || 'Internal'
          };
        });
      }

      if (key === 'slides' && Array.isArray(parsed)) {
        if (!parsed.length) return defaultValue;
        return parsed.map((item, idx) => {
          const rawBg = item.bg || item.bgColor || '';
          const isWhiteOrEmpty = !rawBg || rawBg.trim() === '' || rawBg.toLowerCase() === '#fff' || rawBg.toLowerCase() === '#ffffff' || rawBg.toLowerCase() === 'white';
          const fallbackGradients = [
            'linear-gradient(135deg, #1c7947 0%, #2a9d5c 100%)',
            'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
          ];
          const safeBg = isWhiteOrEmpty ? fallbackGradients[idx % fallbackGradients.length] : rawBg;
          return {
            ...item,
            id: item.id || Date.now() + idx,
            bg: safeBg,
            bgColor: safeBg,
            desc: item.desc !== undefined ? item.desc : (item.description || ''),
            description: item.description !== undefined ? item.description : (item.desc || ''),
            qr: item.qr !== undefined ? item.qr : (item.qrUrl || ''),
            qrUrl: item.qrUrl !== undefined ? item.qrUrl : (item.qr || ''),
            mediaType: item.mediaType || 'none',
            mediaUrl: item.mediaUrl || ''
          };
        });
      }

      if (key === 'templateColors' && parsed && typeof parsed === 'object') {
        const updated = { ...defaultTemplateColors, ...parsed };
        if (updated.tu === '#f59e0b') updated.tu = '#1e40af';
        if (updated.admin === '#0f172a') updated.admin = '#1e40af';
        return updated;
      }

      if (key === 'primaryColor' && (parsed === '#3b82f6' || parsed === '#f59e0b')) {
        return '#1e40af';
      }

      return parsed;
    } catch (e) {
      return defaultValue;
    }
  };

  const getInitialFaculty = () => {
    const saved = loadState('facultyName', null);
    if (!saved || saved === 'Universitas Riau' || saved === 'UPA PERPUSTAKAAN UNIVERSITAS RIAU') {
      return defaultFacultyNameOverride && defaultFacultyNameOverride !== 'Universitas Riau'
        ? defaultFacultyNameOverride
        : 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)';
    }
    return saved;
  };

  const [facultyName, setFacultyName] = useState(getInitialFaculty);
  const [subUnitName, setSubUnitName] = useState(() => loadState('subUnitName', 'UPA Perpustakaan'));
  const [accreditation, setAccreditation] = useState(() => loadState('accreditation', 'Akreditasi Unggul'));
  const [campusLocation, setCampusLocation] = useState(() => loadState('campusLocation', 'Kampus Bina Widya'));
  const [operationalHours, setOperationalHours] = useState(() => loadState('operationalHours', '08:00 - 16:00 WIB'));
  const [tagline, setTagline] = useState(() => loadState('tagline', defaultTagline));
  const [primaryColor, setPrimaryColor] = useState(() => loadState('primaryColor', defaultPrimaryColor));
  const [templateColors, setTemplateColors] = useState(() => loadState('templateColors', defaultTemplateColors));
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
  const [scheduleScrollType, setScheduleScrollType] = useState(() => loadState('scheduleScrollType', 'step'));

  useEffect(() => localStorage.setItem(getKey('facultyName'), JSON.stringify(facultyName)), [facultyName, prefix]);
  useEffect(() => localStorage.setItem(getKey('subUnitName'), JSON.stringify(subUnitName)), [subUnitName, prefix]);
  useEffect(() => localStorage.setItem(getKey('accreditation'), JSON.stringify(accreditation)), [accreditation, prefix]);
  useEffect(() => localStorage.setItem(getKey('campusLocation'), JSON.stringify(campusLocation)), [campusLocation, prefix]);
  useEffect(() => localStorage.setItem(getKey('operationalHours'), JSON.stringify(operationalHours)), [operationalHours, prefix]);
  useEffect(() => localStorage.setItem(getKey('tagline'), JSON.stringify(tagline)), [tagline, prefix]);
  useEffect(() => localStorage.setItem(getKey('primaryColor'), JSON.stringify(primaryColor)), [primaryColor, prefix]);
  useEffect(() => localStorage.setItem(getKey('templateColors'), JSON.stringify(templateColors)), [templateColors, prefix]);
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
  useEffect(() => localStorage.setItem(getKey('scheduleScrollType'), JSON.stringify(scheduleScrollType)), [scheduleScrollType, prefix]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === getKey('facultyName') && e.newValue) setFacultyName(JSON.parse(e.newValue));
      if (e.key === getKey('subUnitName') && e.newValue) setSubUnitName(JSON.parse(e.newValue));
      if (e.key === getKey('accreditation') && e.newValue) setAccreditation(JSON.parse(e.newValue));
      if (e.key === getKey('campusLocation') && e.newValue) setCampusLocation(JSON.parse(e.newValue));
      if (e.key === getKey('operationalHours') && e.newValue) setOperationalHours(JSON.parse(e.newValue));
      if (e.key === getKey('tagline') && e.newValue) setTagline(JSON.parse(e.newValue));
      if (e.key === getKey('primaryColor') && e.newValue) setPrimaryColor(JSON.parse(e.newValue));
      if (e.key === getKey('templateColors') && e.newValue) setTemplateColors(JSON.parse(e.newValue));
      if (e.key === getKey('tvLayout') && e.newValue) setTvLayout(JSON.parse(e.newValue));
      if (e.key === getKey('language') && e.newValue) setLanguage(JSON.parse(e.newValue));
      if (e.key === getKey('timezone') && e.newValue) setTimezone(JSON.parse(e.newValue));
      if (e.key === getKey('timeOn') && e.newValue) setTimeOn(JSON.parse(e.newValue));
      if (e.key === getKey('timeOff') && e.newValue) setTimeOff(JSON.parse(e.newValue));
      if (e.key === getKey('autoRefresh') && e.newValue !== null) setAutoRefresh(JSON.parse(e.newValue));
      if (e.key === getKey('schedules') && e.newValue) setSchedules(JSON.parse(e.newValue));
      if (e.key === getKey('announcements') && e.newValue) setAnnouncements(JSON.parse(e.newValue));
      if (e.key === getKey('slides') && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed.map((item, idx) => {
              const rawBg = item.bg || item.bgColor || '';
              const isWhiteOrEmpty = !rawBg || rawBg.trim() === '' || rawBg.toLowerCase() === '#fff' || rawBg.toLowerCase() === '#ffffff' || rawBg.toLowerCase() === 'white';
              const fallbackGradients = [
                'linear-gradient(135deg, #1c7947 0%, #2a9d5c 100%)',
                'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
              ];
              const safeBg = isWhiteOrEmpty ? fallbackGradients[idx % fallbackGradients.length] : rawBg;
              return {
                ...item,
                id: item.id || Date.now() + idx,
                bg: safeBg,
                bgColor: safeBg,
                desc: item.desc !== undefined ? item.desc : (item.description || ''),
                description: item.description !== undefined ? item.description : (item.desc || ''),
                qr: item.qr !== undefined ? item.qr : (item.qrUrl || ''),
                qrUrl: item.qrUrl !== undefined ? item.qrUrl : (item.qr || ''),
                mediaType: item.mediaType || 'none',
                mediaUrl: item.mediaUrl || ''
              };
            }));
          } else {
            setSlides(defaultSlides);
          }
        } catch (err) {
          console.error("Error parsing storage slides", err);
        }
      }
      if (e.key === getKey('isAuthenticated') && e.newValue !== null) setIsAuthenticated(JSON.parse(e.newValue));
      if (e.key === getKey('slideDuration') && e.newValue) setSlideDuration(JSON.parse(e.newValue));
      if (e.key === getKey('marqueeSpeed') && e.newValue) setMarqueeSpeed(JSON.parse(e.newValue));
      if (e.key === getKey('scheduleSpeed') && e.newValue) setScheduleSpeed(JSON.parse(e.newValue));
      if (e.key === getKey('scheduleScrollType') && e.newValue) setScheduleScrollType(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [prefix]);

  const basePath = prefix === 'main' ? '' : `/${prefix}`;

  return (
    <DashboardContext.Provider value={{
      basePath, prefix,
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
      schedules, setSchedules,
      announcements, setAnnouncements,
      slides, setSlides,
      isAuthenticated, setIsAuthenticated,
      slideDuration, setSlideDuration,
      marqueeSpeed, setMarqueeSpeed,
      scheduleSpeed, setScheduleSpeed,
      scheduleScrollType, setScheduleScrollType
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
