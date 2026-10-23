import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

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

export const FACULTY_LIST = [
  { prefix: 'main', code: 'PUSAT', name: 'Universitas Riau (Kantor Pusat)', path: '/admin', tvPath: '/tv' },
  { prefix: 'fkip', code: 'FKIP', name: 'Fakultas Keguruan dan Ilmu Pendidikan', path: '/fkip/admin', tvPath: '/fkip/tv' },
  { prefix: 'fisip', code: 'FISIP', name: 'Fakultas Ilmu Sosial dan Ilmu Politik', path: '/fisip/admin', tvPath: '/fisip/tv' },
  { prefix: 'feb', code: 'FEB', name: 'Fakultas Ekonomi dan Bisnis', path: '/feb/admin', tvPath: '/feb/tv' },
  { prefix: 'fmipa', code: 'FMIPA', name: 'Fakultas Matematika dan Ilmu Pengetahuan Alam', path: '/fmipa/admin', tvPath: '/fmipa/tv' },
  { prefix: 'ft', code: 'FT', name: 'Fakultas Teknik', path: '/ft/admin', tvPath: '/ft/tv' },
  { prefix: 'fp', code: 'FP', name: 'Fakultas Pertanian', path: '/fp/admin', tvPath: '/fp/tv' },
  { prefix: 'fpk', code: 'FPK', name: 'Fakultas Perikanan dan Kelautan', path: '/fpk/admin', tvPath: '/fpk/tv' },
  { prefix: 'fk', code: 'FK', name: 'Fakultas Kedokteran', path: '/fk/admin', tvPath: '/fk/tv' },
  { prefix: 'hukum', code: 'FH', name: 'Fakultas Hukum', path: '/hukum/admin', tvPath: '/hukum/tv' },
  { prefix: 'fkp', code: 'FKp', name: 'Fakultas Keperawatan', path: '/fkp/admin', tvPath: '/fkp/tv' }
];

export function DashboardProvider({ children, prefix = 'main', defaultFacultyNameOverride = 'Universitas Riau' }) {
  const getKey = (key) => prefix === 'main' ? key : `${prefix}_${key}`;

  // Bersihkan data tiruan / mock lawas dari localStorage agar tidak pernah mengabaikan database
  useEffect(() => {
    try {
      localStorage.removeItem(getKey('schedules'));
      localStorage.removeItem(getKey('announcements'));
      localStorage.removeItem(getKey('slides'));
      localStorage.removeItem('schedules');
      localStorage.removeItem('announcements');
      localStorage.removeItem('slides');
    } catch (e) {}
  }, [prefix]);

  const loadPreference = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(getKey(key));
      if (!saved) return defaultValue;
      return JSON.parse(saved);
    } catch (e) {
      return defaultValue;
    }
  };

  // State Pengaturan (Settings)
  const [facultyName, setFacultyName] = useState(() => defaultFacultyNameOverride || (prefix === 'main' ? 'Universitas Riau (Kantor Pusat)' : 'Universitas Riau'));
  const [subUnitName, setSubUnitName] = useState(() => loadPreference('subUnitName', 'Pusat Informasi & Layanan Terpadu'));
  const [accreditation, setAccreditation] = useState(() => loadPreference('accreditation', 'Akreditasi Unggul'));
  const [campusLocation, setCampusLocation] = useState(() => loadPreference('campusLocation', 'Kampus Bina Widya'));
  const [operationalHours, setOperationalHours] = useState(() => loadPreference('operationalHours', '08:00 - 16:00 WIB'));
  const [tagline, setTagline] = useState(() => loadPreference('tagline', defaultTagline));
  const [primaryColor, setPrimaryColor] = useState(() => loadPreference('primaryColor', defaultPrimaryColor));
  const [templateColors, setTemplateColors] = useState(() => loadPreference('templateColors', defaultTemplateColors));
  const [tvLayout, setTvLayout] = useState(() => loadPreference('tvLayout', defaultTvLayout));
  const [language, setLanguage] = useState(() => loadPreference('language', defaultLanguage));
  const [timezone, setTimezone] = useState(() => loadPreference('timezone', defaultTimezone));
  const [timeOn, setTimeOn] = useState(() => loadPreference('timeOn', defaultTimeOn));
  const [timeOff, setTimeOff] = useState(() => loadPreference('timeOff', defaultTimeOff));
  const [autoRefresh, setAutoRefresh] = useState(() => loadPreference('autoRefresh', defaultAutoRefresh));
  const [slideDuration, setSlideDuration] = useState(() => loadPreference('slideDuration', 8));
  const [marqueeSpeed, setMarqueeSpeed] = useState(() => loadPreference('marqueeSpeed', 20));
  const [scheduleSpeed, setScheduleSpeed] = useState(() => loadPreference('scheduleSpeed', 1));
  const [scheduleScrollType, setScheduleScrollType] = useState(() => loadPreference('scheduleScrollType', 'step'));

  // DATA DINAMIS HANYA DARI DATABASE (TIDAK DARI KODE)
  // Saat database mati / kosong, state ini bernilai [] (kosong)
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [slides, setSlides] = useState([]);

  // Status Koneksi Database
  const [isDbConnected, setIsDbConnected] = useState(false);
  const isLoadedFromDb = useRef(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('isAuthenticated');
      const savedUser = localStorage.getItem('auth_user');
      return Boolean(savedAuth === 'true' || (savedUser && savedUser !== 'null'));
    } catch (e) {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.username === 'admin';

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [currentUser]);

  // Simpan preferensi UI ke localStorage
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
  useEffect(() => localStorage.setItem(getKey('slideDuration'), JSON.stringify(slideDuration)), [slideDuration, prefix]);
  useEffect(() => localStorage.setItem(getKey('marqueeSpeed'), JSON.stringify(marqueeSpeed)), [marqueeSpeed, prefix]);
  useEffect(() => localStorage.setItem(getKey('scheduleSpeed'), JSON.stringify(scheduleSpeed)), [scheduleSpeed, prefix]);
  useEffect(() => localStorage.setItem(getKey('scheduleScrollType'), JSON.stringify(scheduleScrollType)), [scheduleScrollType, prefix]);

  // ========================================================
  // SINKRONISASI MURNI DENGAN DATABASE MYSQL
  // Jika database hidup: muat semua data dari DB
  // Jika database mati: kosongkan semua data dari web
  // ========================================================
  const fetchAllFromDb = useCallback(async () => {
    try {
      const resHealth = await fetch('/api/health');
      if (!resHealth.ok) throw new Error('Backend error / DB offline');
      const health = await resHealth.json();
      if (health.mysql !== 'connected') throw new Error('MySQL disconnected');

      setIsDbConnected(true);

      // 1. Ambil Settings
      try {
        const resSettings = await fetch(`/api/settings/${prefix}`);
        if (resSettings.ok) {
          const data = await resSettings.json();
          if (data) {
            if (data.faculty_name) setFacultyName(data.faculty_name);
            if (data.sub_unit_name) setSubUnitName(data.sub_unit_name);
            if (data.accreditation) setAccreditation(data.accreditation);
            if (data.campus_location) setCampusLocation(data.campus_location);
            if (data.operational_hours) setOperationalHours(data.operational_hours);
            if (data.tagline) setTagline(data.tagline);
            if (data.primary_color) setPrimaryColor(data.primary_color);
            if (data.template_colors) setTemplateColors(data.template_colors);
            if (data.tv_layout) setTvLayout(data.tv_layout);
            if (data.language) setLanguage(data.language);
            if (data.timezone) setTimezone(data.timezone);
            if (data.time_on) setTimeOn(data.time_on);
            if (data.time_off) setTimeOff(data.time_off);
            if (data.auto_refresh !== undefined) setAutoRefresh(Boolean(data.auto_refresh));
            if (data.slide_duration) setSlideDuration(data.slide_duration);
            if (data.marquee_speed) setMarqueeSpeed(data.marquee_speed);
            if (data.schedule_speed) setScheduleSpeed(data.schedule_speed);
            if (data.schedule_scroll_type) setScheduleScrollType(data.schedule_scroll_type);
          }
        }
      } catch (err) {
        console.warn('Gagal ambil settings dari DB:', err);
      }

      // 2. Ambil Jadwal (Schedules)
      try {
        const resSchedules = await fetch(`/api/schedules/${prefix}`);
        if (resSchedules.ok) {
          const data = await resSchedules.json();
          setSchedules(prev => {
            const next = Array.isArray(data) ? data : [];
            return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
          });
        } else {
          setSchedules(prev => prev.length === 0 ? prev : []);
        }
      } catch (err) {
        setSchedules(prev => prev.length === 0 ? prev : []);
      }

      // 3. Ambil Pengumuman (Announcements)
      try {
        const resAnn = await fetch(`/api/announcements/${prefix}`);
        if (resAnn.ok) {
          const data = await resAnn.json();
          setAnnouncements(prev => {
            const next = Array.isArray(data) ? data : [];
            return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
          });
        } else {
          setAnnouncements(prev => prev.length === 0 ? prev : []);
        }
      } catch (err) {
        setAnnouncements(prev => prev.length === 0 ? prev : []);
      }

      // 4. Ambil Slides
      try {
        const resSlides = await fetch(`/api/slides/${prefix}`);
        if (resSlides.ok) {
          const data = await resSlides.json();
          setSlides(prev => {
            const next = Array.isArray(data) ? data : [];
            return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
          });
        } else {
          setSlides(prev => prev.length === 0 ? prev : []);
        }
      } catch (err) {
        setSlides(prev => prev.length === 0 ? prev : []);
      }

      isLoadedFromDb.current = true;
    } catch (err) {
      // DATABASE MATI / KONEKSI GAGAL:
      // Sesuai permintaan, saat database mati maka semua data hilang!
      setIsDbConnected(false);
      isLoadedFromDb.current = false;
      setSchedules([]);
      setAnnouncements([]);
      setSlides([]);
    }
  }, [prefix]);

  // Polling sinkronisasi otomatis setiap 4 detik
  useEffect(() => {
    fetchAllFromDb();
    const interval = setInterval(fetchAllFromDb, 4000);
    return () => clearInterval(interval);
  }, [fetchAllFromDb]);

  // Helper fungsi simpan eksplisit langsung ke Database MySQL
  const saveSchedulesToDb = async (newSchedules) => {
    const res = await fetch(`/api/schedules/${prefix}/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedules: newSchedules })
    });
    if (!res.ok) throw new Error('Gagal menyimpan jadwal ke database MySQL');
    setSchedules(newSchedules);
    return await res.json();
  };

  const saveAnnouncementsToDb = async (newAnnouncements) => {
    const res = await fetch(`/api/announcements/${prefix}/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcements: newAnnouncements })
    });
    if (!res.ok) throw new Error('Gagal menyimpan pengumuman ke database MySQL');
    setAnnouncements(newAnnouncements);
    return await res.json();
  };

  const saveSlidesToDb = async (newSlides) => {
    const res = await fetch(`/api/slides/${prefix}/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides: newSlides })
    });
    if (!res.ok) throw new Error('Gagal menyimpan slide ke database MySQL');
    setSlides(newSlides);
    return await res.json();
  };

  const saveSettingsToDb = async (newSettings) => {
    const res = await fetch(`/api/settings/${prefix}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    if (!res.ok) throw new Error('Gagal menyimpan pengaturan ke database MySQL');
    return await res.json();
  };

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
      currentUser, setCurrentUser, isSuperAdmin, FACULTY_LIST,
      slideDuration, setSlideDuration,
      marqueeSpeed, setMarqueeSpeed,
      scheduleSpeed, setScheduleSpeed,
      scheduleScrollType, setScheduleScrollType,
      isDbConnected, checkDbConnection: fetchAllFromDb,
      refreshFromDb: fetchAllFromDb,
      saveSchedulesToDb,
      saveAnnouncementsToDb,
      saveSlidesToDb,
      saveSettingsToDb
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
