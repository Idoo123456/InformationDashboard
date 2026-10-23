import { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  ShieldCheck,
  CheckCircle2,
  Radio,
  Coffee,
  Hourglass,
  Layers,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const ITEMS_PER_PAGE = 6; // Grid 3x2 proporsional layar penuh TV

const TUSlider = () => {
  const { schedules, slideDuration, facultyName, isDbConnected } = useDashboard();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideTimerKey, setSlideTimerKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather state
  const [weather, setWeather] = useState({
    temp: '--',
    humidity: '--',
    aqi: '--',
    desc: 'Memuat...',
    loc: 'Pekanbaru'
  });

  // Keep current time updated every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate current week bounds (Senin s/d Minggu)
  const weekBounds = useMemo(() => {
    const now = new Date(currentTime);
    const day = now.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const nextMonday = new Date(sunday);
    nextMonday.setDate(sunday.getDate() + 1);
    nextMonday.setHours(0, 0, 0, 0);

    const formatYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayStr}`;
    };

    const formatHumanShort = (d) => {
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const formatHumanFull = (d) => {
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return {
      monday,
      sunday,
      nextMonday,
      startStr: formatYMD(monday),
      endStr: formatYMD(sunday),
      nextMondayStr: formatYMD(nextMonday),
      weekRangeText: `${formatHumanShort(monday)} – ${formatHumanShort(sunday)} ${sunday.getFullYear()}`,
      nextMondayText: formatHumanFull(nextMonday)
    };
  }, [currentTime]);

  // Real-time TU Office Desk status calculation
  const officeStatus = useMemo(() => {
    const day = currentTime.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();

    if (day === 0 || day === 6) {
      return {
        status: 'Libur',
        label: 'Loket Libur Akhir Pekan',
        hoursText: 'Sabtu - Minggu',
        color: '#64748b',
        bg: 'rgba(241, 245, 249, 0.95)',
        border: '#cbd5e1',
        iconType: 'closed'
      };
    }

    const isFriday = day === 5;
    const breakStart = isFriday ? 11 * 60 + 30 : 12 * 60;
    const breakEnd = isFriday ? 13 * 60 + 30 : 13 * 60;
    const closingTime = isFriday ? 16 * 60 + 30 : 16 * 60;
    const openingTime = 8 * 60;

    if (currentMin >= openingTime && currentMin < breakStart) {
      return {
        status: 'Buka',
        label: 'Loket Pelayanan Buka',
        hoursText: isFriday ? '08:00 - 16:30 WIB' : '08:00 - 16:00 WIB',
        color: '#059669',
        bg: 'rgba(236, 253, 245, 0.95)',
        border: '#86efac',
        iconType: 'open'
      };
    } else if (currentMin >= breakStart && currentMin < breakEnd) {
      return {
        status: 'Istirahat',
        label: 'Jam Istirahat Pelayanan',
        hoursText: isFriday ? '11:30 - 13:30 WIB' : '12:00 - 13:00 WIB',
        color: '#d97706',
        bg: 'rgba(254, 243, 199, 0.95)',
        border: '#fde68a',
        iconType: 'coffee'
      };
    } else if (currentMin >= breakEnd && currentMin < closingTime) {
      return {
        status: 'Buka',
        label: 'Loket Pelayanan Buka',
        hoursText: isFriday ? '08:00 - 16:30 WIB' : '08:00 - 16:00 WIB',
        color: '#059669',
        bg: 'rgba(236, 253, 245, 0.95)',
        border: '#86efac',
        iconType: 'open'
      };
    } else {
      return {
        status: 'Tutup',
        label: 'Layanan Hari Ini Selesai',
        hoursText: 'Buka Besok 08:00 WIB',
        color: '#475569',
        bg: 'rgba(241, 245, 249, 0.95)',
        border: '#cbd5e1',
        iconType: 'closed'
      };
    }
  }, [currentTime]);

  // Filter Slide 1: Kegiatan Minggu Ini
  const thisWeekSchedules = useMemo(() => {
    return (schedules || [])
      .filter(item => {
        if (!item.date) return false;
        return item.date >= weekBounds.startStr && item.date <= weekBounds.endStr;
      })
      .sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        if (cmp !== 0) return cmp;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }, [schedules, weekBounds]);

  // Filter Slide 2: Kegiatan Yang Akan Datang
  const upcomingSchedules = useMemo(() => {
    return (schedules || [])
      .filter(item => {
        if (!item.date) return false;
        return item.date > weekBounds.endStr;
      })
      .sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        if (cmp !== 0) return cmp;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }, [schedules, weekBounds]);

  // Helper chunk array into pages of ITEMS_PER_PAGE (6)
  const chunkPages = (list) => {
    if (!list || list.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < list.length; i += ITEMS_PER_PAGE) {
      pages.push(list.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages;
  };

  const thisWeekPages = useMemo(() => chunkPages(thisWeekSchedules), [thisWeekSchedules]);
  const upcomingPages = useMemo(() => chunkPages(upcomingSchedules), [upcomingSchedules]);

  // Flat list of all slides (combining pages of thisWeek and upcoming)
  const allSlides = useMemo(() => {
    const list = [];
    thisWeekPages.forEach((items, pIdx) => {
      list.push({
        id: `tw-${pIdx}`,
        categoryKey: 'thisWeek',
        categoryIndex: 0,
        categoryTitle: 'Jadwal Kegiatan Minggu Ini',
        subtitle: `Periode: ${weekBounds.weekRangeText}`,
        pageIndex: pIdx,
        totalPages: thisWeekPages.length,
        items,
        totalCategoryItems: thisWeekSchedules.length
      });
    });
    upcomingPages.forEach((items, pIdx) => {
      list.push({
        id: `up-${pIdx}`,
        categoryKey: 'upcoming',
        categoryIndex: 1,
        categoryTitle: 'Jadwal Kegiatan Yang Akan Datang',
        subtitle: `Mulai: ${weekBounds.nextMondayText}`,
        pageIndex: pIdx,
        totalPages: upcomingPages.length,
        items,
        totalCategoryItems: upcomingSchedules.length
      });
    });
    return list;
  }, [thisWeekPages, upcomingPages, thisWeekSchedules.length, upcomingSchedules.length, weekBounds]);

  const totalSlides = allSlides.length || 1;
  const currentSlideIndex = Math.min(activeSlideIndex, totalSlides - 1);
  const currentSlide = allSlides[currentSlideIndex] || allSlides[0];

  // Auto-slide Timer
  const durationSec = slideDuration || 8;
  const durationMs = durationSec * 1000;
  const [secondsLeft, setSecondsLeft] = useState(durationSec);

  useEffect(() => {
    setSecondsLeft(durationSec);
    const secInterval = setInterval(() => {
      setSecondsLeft(prev => (prev > 1 ? prev - 1 : durationSec));
    }, 1000);
    return () => clearInterval(secInterval);
  }, [currentSlideIndex, durationSec, slideTimerKey]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIndex(curr => (curr + 1) % totalSlides);
    }, durationMs);

    return () => clearInterval(timer);
  }, [durationMs, slideTimerKey, totalSlides]);

  const handleSelectTab = (categoryIndex) => {
    if (categoryIndex === 0) {
      if (currentSlide.categoryKey === 'thisWeek' && thisWeekPages.length > 1) {
        setActiveSlideIndex(curr => (curr + 1) % thisWeekPages.length);
      } else {
        setActiveSlideIndex(0);
      }
    } else {
      const upcomingStartIndex = thisWeekPages.length;
      if (currentSlide.categoryKey === 'upcoming' && upcomingPages.length > 1) {
        const nextSubPage = (currentSlide.pageIndex + 1) % upcomingPages.length;
        setActiveSlideIndex(upcomingStartIndex + nextSubPage);
      } else {
        setActiveSlideIndex(upcomingStartIndex);
      }
    }
    setSlideTimerKey(k => k + 1);
  };

  // Weather Fetching
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch('https://api.open-meteo.com/v1/forecast?latitude=0.5333&longitude=101.4500&current=temperature_2m,relative_humidity_2m,weather_code'),
          fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=0.5333&longitude=101.4500&current=us_aqi')
        ]);
        if (!isMounted) return;
        const wData = await weatherRes.json();
        const aData = await aqiRes.json();
        const curW = wData.current;
        const curA = aData.current;

        setWeather({
          temp: curW ? Math.round(curW.temperature_2m) : '--',
          humidity: curW ? Math.round(curW.relative_humidity_2m) : '--',
          aqi: curA ? Math.round(curA.us_aqi) : '--',
          desc: 'Cerah',
          loc: 'Pekanbaru'
        });
      } catch (e) {
        // Fallback quiet
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getAQIColor = (aqi) => {
    if (aqi === '--' || aqi == null) return '#94a3b8';
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#84cc16';
    if (aqi <= 150) return '#f59e0b';
    return '#ef4444';
  };

  const getAQILabel = (aqi) => {
    if (aqi === '--' || aqi == null) return '';
    if (aqi <= 50) return 'Baik';
    if (aqi <= 100) return 'Sedang';
    if (aqi <= 150) return 'Sensitif';
    return 'Kurang Sehat';
  };

  const parseDateParts = (dateStr) => {
    if (!dateStr) return { dayNum: '--', monthShort: '---', dayName: '---', year: '----' };
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const daysFull = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
      return {
        dayNum: String(d).padStart(2, '0'),
        monthShort: months[dateObj.getMonth()],
        dayName: daysFull[dateObj.getDay()],
        year: y
      };
    } catch (e) {
      return { dayNum: dateStr, monthShort: '', dayName: '', year: '' };
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
      if (totalMinutes <= 0) return '';
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hours > 0 && mins > 0) return `${hours}j ${mins}m`;
      if (hours > 0) return `${hours} Jam`;
      return `${mins} Menit`;
    } catch (e) {
      return '';
    }
  };

  const getRelativeDayTag = (dateStr) => {
    if (!dateStr) return null;
    try {
      const today = new Date(currentTime);
      today.setHours(0, 0, 0, 0);
      const [y, m, d] = dateStr.split('-').map(Number);
      const target = new Date(y, m - 1, d);
      target.setHours(0, 0, 0, 0);

      const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return { label: 'HARI INI', type: 'today' };
      if (diffDays === 1) return { label: 'BESOK', type: 'tomorrow' };
      if (diffDays === 2) return { label: 'LUSA', type: 'soon' };
      if (diffDays > 2 && diffDays <= 7) return { label: `+${diffDays} HARI`, type: 'week' };
      return null;
    } catch (e) {
      return null;
    }
  };

  const getDynamicStatus = (item) => {
    if (item.status === 'Dibatalkan') return 'Dibatalkan';
    if (item.status === 'Selesai') return 'Selesai';

    try {
      let scheduleDateStr = item.date || new Date().toISOString().split('T')[0];
      if (typeof scheduleDateStr === 'string' && scheduleDateStr.includes('T')) {
        scheduleDateStr = scheduleDateStr.split('T')[0];
      }
      const startStr = item.startTime || item.time || '00:00';
      const endStr = item.endTime || '23:59';

      const startDateTime = new Date(`${scheduleDateStr}T${startStr}:00`);
      const endDateTime = new Date(`${scheduleDateStr}T${endStr}:00`);

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

  const getStatusTheme = (status) => {
    switch (status) {
      case 'Berlangsung':
        return { 
          pillBg: '#ecfdf5',
          pillColor: '#047857',
          pillBorder: '#a7f3d0',
          accentGradient: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)',
          cardBg: 'linear-gradient(180deg, rgba(236, 253, 245, 0.45) 0%, #ffffff 40%)',
          cardBorder: '#86efac',
          cardShadow: '0 12px 28px -4px rgba(16, 185, 129, 0.22), 0 0 0 1px #86efac',
          dateMonthBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          dateMonthColor: '#ffffff',
          isLive: true,
          label: 'BERLANGSUNG'
        };
      case 'Selesai':
        return { 
          pillBg: '#f8fafc',
          pillColor: '#64748b',
          pillBorder: '#e2e8f0',
          accentGradient: 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
          cardBg: '#ffffff',
          cardBorder: '#e2e8f0',
          cardShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.04)',
          dateMonthBg: '#94a3b8',
          dateMonthColor: '#ffffff',
          isLive: false,
          label: 'SELESAI'
        };
      case 'Dibatalkan':
        return { 
          pillBg: '#fef2f2',
          pillColor: '#b91c1c',
          pillBorder: '#fecaca',
          accentGradient: 'linear-gradient(90deg, #dc2626, #ef4444)',
          cardBg: '#ffffff',
          cardBorder: '#fecaca',
          cardShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.04)',
          dateMonthBg: '#ef4444',
          dateMonthColor: '#ffffff',
          isLive: false,
          label: 'DIBATALKAN'
        };
      case 'Akan Datang':
      default:
        return { 
          pillBg: '#eff6ff',
          pillColor: '#1d4ed8',
          pillBorder: '#bfdbfe',
          accentGradient: 'linear-gradient(90deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
          cardBg: '#ffffff',
          cardBorder: '#e2e8f0',
          cardShadow: '0 6px 20px -2px rgba(30, 64, 175, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
          dateMonthBg: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          dateMonthColor: '#ffffff',
          isLive: false,
          label: 'AKAN DATANG'
        };
    }
  };

  const renderScheduleCards = (list, startIndex = 0) => {
    return list.map((item, index) => {
      const dynamicStatus = getDynamicStatus(item);
      const statusTheme = getStatusTheme(dynamicStatus);
      const relativeTag = getRelativeDayTag(item.date);
      const dateParts = parseDateParts(item.date);
      const durationText = calculateDuration(item.startTime || item.time, item.endTime);
      const isLive = dynamicStatus === 'Berlangsung';
      const isFinished = dynamicStatus === 'Selesai';

      return (
        <div 
          key={item.id || (startIndex + index)} 
          className={`tu-card ${isLive ? 'tu-card-live' : ''} ${isFinished ? 'tu-card-finished' : ''}`}
          style={{ 
            animationDelay: `${index * 0.03}s`,
            background: statusTheme.cardBg,
            borderColor: statusTheme.cardBorder,
            boxShadow: statusTheme.cardShadow
          }}
        >
          {/* TOP ACCENT LINE */}
          <div 
            className="tu-card-top-accent"
            style={{ background: statusTheme.accentGradient }}
          />

          {/* SECTION 1: HEADER STRIP (DATE + STATUS + TIME) */}
          <div className="tu-card-top-bar">
            {/* Integrated Calendar Badge */}
            <div className={`tu-date-badge ${isLive ? 'badge-live' : ''}`}>
              <span className="tu-date-badge-date" style={{ background: statusTheme.dateMonthBg }}>
                {dateParts.dayNum} {dateParts.monthShort}
              </span>
              <span className="tu-date-badge-day">
                {dateParts.dayName}
              </span>
            </div>

            {/* Status & Relative Badges */}
            <div className="tu-card-pills-row">
              <span 
                className={`tu-card-status-pill ${isLive ? 'pill-live' : ''}`}
                style={{ 
                  backgroundColor: statusTheme.pillBg,
                  color: statusTheme.pillColor,
                  borderColor: statusTheme.pillBorder
                }}
              >
                {isLive ? (
                  <span className="tu-card-live-dot-wrap">
                    <span className="tu-card-pulsing-dot" />
                    <span className="tu-card-pulsing-ring" />
                  </span>
                ) : isFinished ? (
                  <CheckCircle2 size={12} className="tu-card-done-icon" />
                ) : null}
                {statusTheme.label}
              </span>

              {relativeTag && (
                <span className={`tu-card-rel-pill tu-rel-${relativeTag.type}`}>
                  {relativeTag.label}
                </span>
              )}
            </div>

            {/* Execution Time Pill (Always on the right) */}
            <div className="tu-card-time-pill" title="Waktu Pelaksanaan">
              <Clock size={13} className="tu-time-icon" />
              <span className="tu-time-text">
                {item.startTime || item.time || '00:00'} - {item.endTime || '00:00'} WIB
              </span>
              {durationText && (
                <span className="tu-duration-chip">
                  {durationText}
                </span>
              )}
            </div>
          </div>

          {/* SECTION 2: HERO TITLE & DESCRIPTION */}
          <div className="tu-card-body-hero">
            <h3 className="tu-card-title" title={item.title}>
              {item.title}
            </h3>
            <p className="tu-card-desc">
              {item.description || 'Koordinasi fasilitasi administrasi dan pelaksanaan agenda kegiatan resmi fakultas.'}
            </p>
          </div>

          {/* SECTION 3: SPECS DECK (4 SOLID PANELS) */}
          <div className="tu-card-specs-deck">
            {/* Ruangan */}
            <div className="tu-deck-cell" title="Lokasi Ruangan">
              <div className="tu-cell-icon cell-loc">
                <MapPin size={14} />
              </div>
              <div className="tu-cell-text">
                <span className="tu-cell-label">LOKASI / TEMPAT</span>
                <span className="tu-cell-value">{item.loc || 'Ruang Rapat Utama'}</span>
              </div>
            </div>

            {/* PIC */}
            <div className="tu-deck-cell" title="Penanggung Jawab">
              <div className="tu-cell-icon cell-pic">
                <User size={14} />
              </div>
              <div className="tu-cell-text">
                <span className="tu-cell-label">PENANGGUNG JAWAB</span>
                <span className="tu-cell-value">{item.pic || 'Tata Usaha / Fakultas'}</span>
              </div>
            </div>

            {/* Kategori Mitra */}
            <div className="tu-deck-cell" title="Kategori Mitra">
              <div className="tu-cell-icon cell-cat">
                <Briefcase size={14} />
              </div>
              <div className="tu-cell-text">
                <span className="tu-cell-label">KATEGORI MITRA</span>
                <span className="tu-cell-value">{item.partnerCategory || 'Internal Kampus'}</span>
              </div>
            </div>

            {/* Durasi & Tahun */}
            <div className="tu-deck-cell" title="Estimasi & Kalender">
              <div className="tu-cell-icon cell-time">
                <Hourglass size={14} />
              </div>
              <div className="tu-cell-text">
                <span className="tu-cell-label">ESTIMASI DURASI</span>
                <span className="tu-cell-value">{durationText ? `${durationText} Pelaksanaan` : 'Jadwal Reguler'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: CARD FOOTER */}
          <div className="tu-card-footer">
            <div className="tu-card-verification">
              <ShieldCheck size={15} className="tu-verify-icon" />
              <span>Agenda Resmi Terverifikasi • {facultyName || 'Universitas Riau'}</span>
            </div>
            <span className={`tu-partner-tag ${item.partnerCategory?.toLowerCase() === 'eksternal' ? 'partner-external' : 'partner-internal'}`}>
              {item.partnerCategory || 'INTERNAL'}
            </span>
          </div>
        </div>
      );
    });
  };

  const isCurrentThisWeek = currentSlide.categoryKey === 'thisWeek';
  const isCurrentUpcoming = currentSlide.categoryKey === 'upcoming';

  return (
    <div className="tu-slider-wrapper">
      {/* ========================================================
          UNIFIED MASTER HEADER (Satu Bar Komprehensif & Padat)
          ======================================================== */}
      <div className="tu-master-bar glass-panel">
        {/* SISI KIRI: JUDUL SLIDE UTAMA & INFO PERIODE */}
        <div className="tu-master-left">
          <div className="tu-master-icon-wrap">
            {isCurrentThisWeek ? <CalendarDays size={22} /> : <Sparkles size={22} />}
          </div>
          <div className="tu-master-title-box">
            <div className="tu-master-title-row">
              <h2 className="tu-master-title">{currentSlide.categoryTitle}</h2>
              <span className="tu-master-count-badge">
                <Calendar size={12} />
                <strong>{currentSlide.totalCategoryItems}</strong> Agenda
              </span>
            </div>
            <p className="tu-master-subtitle">
              <span className="tu-master-period-pill">
                <strong>{currentSlide.subtitle}</strong>
              </span>
              <span className="tu-master-dot">•</span>
              <span className="tu-master-rot-info">
                Rotasi Slide {currentSlide.categoryIndex + 1}/2
                {currentSlide.totalPages > 1 && ` (Halaman ${currentSlide.pageIndex + 1} dari ${currentSlide.totalPages})`}
              </span>
            </p>
          </div>
        </div>

        {/* SISI TENGAH: SLIDE CONTROLLER TABS */}
        <div className="tu-master-center">
          <div className="tu-segmented-tabs">
            {/* TAB 1: Minggu Ini */}
            <button 
              type="button"
              className={`tu-tab-btn ${isCurrentThisWeek ? 'tab-active' : ''}`}
              onClick={() => handleSelectTab(0)}
            >
              <CalendarDays size={16} className="tu-tab-icon" />
              <div className="tu-tab-info">
                <span className="tu-tab-title">Minggu Ini</span>
                <span className="tu-tab-counter">{thisWeekSchedules.length} Agenda</span>
              </div>
              {thisWeekPages.length > 1 && (
                <div className="tu-tab-dots">
                  {thisWeekPages.map((_, pIdx) => (
                    <span 
                      key={pIdx} 
                      className={`tu-tab-dot ${isCurrentThisWeek && currentSlide.pageIndex === pIdx ? 'dot-active' : ''}`} 
                    />
                  ))}
                </div>
              )}
              {isCurrentThisWeek && (
                <div 
                  key={`progress-tw-${currentSlideIndex}-${slideTimerKey}`}
                  className="tu-tab-progress-line"
                  style={{ animationDuration: `${durationMs}ms` }}
                />
              )}
            </button>

            {/* TAB 2: Yang Akan Datang */}
            <button 
              type="button"
              className={`tu-tab-btn ${isCurrentUpcoming ? 'tab-active' : ''}`}
              onClick={() => handleSelectTab(1)}
            >
              <ArrowRight size={16} className="tu-tab-icon" />
              <div className="tu-tab-info">
                <span className="tu-tab-title">Mendatang</span>
                <span className="tu-tab-counter">{upcomingSchedules.length} Agenda</span>
              </div>
              {upcomingPages.length > 1 && (
                <div className="tu-tab-dots">
                  {upcomingPages.map((_, pIdx) => (
                    <span 
                      key={pIdx} 
                      className={`tu-tab-dot ${isCurrentUpcoming && currentSlide.pageIndex === pIdx ? 'dot-active' : ''}`} 
                    />
                  ))}
                </div>
              )}
              {isCurrentUpcoming && (
                <div 
                  key={`progress-up-${currentSlideIndex}-${slideTimerKey}`}
                  className="tu-tab-progress-line"
                  style={{ animationDuration: `${durationMs}ms` }}
                />
              )}
            </button>
          </div>
        </div>

        {/* SISI KANAN: STATUS LOKET, TIMER & CUACA */}
        <div className="tu-master-right">
          {/* Status Loket TU */}
          <div 
            className="tu-desk-status-pill"
            style={{ 
              background: officeStatus.bg, 
              borderColor: officeStatus.border, 
              color: officeStatus.color 
            }}
          >
            {officeStatus.iconType === 'open' ? (
              <span className="tu-pulse-ring-wrap">
                <span className="tu-pulse-dot" style={{ backgroundColor: officeStatus.color }} />
                <span className="tu-pulse-ring" style={{ borderColor: officeStatus.color }} />
              </span>
            ) : officeStatus.iconType === 'coffee' ? (
              <Coffee size={14} style={{ color: officeStatus.color }} />
            ) : (
              <span className="tu-pulse-dot" style={{ backgroundColor: officeStatus.color }} />
            )}
            <div className="tu-desk-texts">
              <strong className="tu-desk-label">{officeStatus.label}</strong>
              <span className="tu-desk-sub">({officeStatus.hoursText})</span>
            </div>
          </div>

          {/* Quick Service Chips */}
          <div className="tu-header-services">
            <span className="tu-h-chip chip-acad" title="Pelayanan KRS, Transkrip & Akademik">
              <GraduationCap size={12} /> Akademik
            </span>
            <span className="tu-h-chip chip-sarpras" title="Sarpras & Ruangan">
              <Building2 size={12} /> Sarpras
            </span>
            <span className="tu-h-chip chip-umum" title="Umum & Tata Usaha">
              <Briefcase size={12} /> Umum
            </span>
          </div>

          {/* Auto Timer Countdown */}
          <div className="tu-countdown-pill" title="Penayangan Otomatis Signage">
            <Radio size={13} className="tu-broadcast-dot" />
            <span>Otomatis</span>
            <span className="tu-sec-box">{secondsLeft}s</span>
          </div>

          {/* Weather Widget */}
          <div className="tu-weather-pill" title="Prakiraan Cuaca Pekanbaru">
            <span>📍 {weather.loc}</span>
            <span>•</span>
            <span>☀️ {weather.temp}°C</span>
            <span>•</span>
            <span className="tu-aqi-chip" style={{ backgroundColor: getAQIColor(weather.aqi) }}>
              AQI {weather.aqi} {getAQILabel(weather.aqi) && `• ${getAQILabel(weather.aqi)}`}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          SLIDES VIEWPORT (GRID 3x2 BERISI PENUH & KOKOH)
          ======================================================== */}
      <div className="tu-slides-viewport glass-panel">
        {/* Full-width live top line */}
        <div className="tu-viewport-laser-line">
          <div 
            key={`tu-laser-${currentSlideIndex}-${slideTimerKey}`}
            className="tu-viewport-laser-fill"
            style={{ animationDuration: `${durationMs}ms` }}
          />
        </div>

        <div 
          className="tu-slider-track"
          style={{ 
            width: `${totalSlides * 100}%`,
            transform: `translateX(-${(currentSlideIndex * 100) / totalSlides}%)` 
          }}
        >
          {allSlides.map((slide, slideIdx) => {
            const isThisWeek = slide.categoryKey === 'thisWeek';
            return (
              <div 
                key={slide.id || slideIdx} 
                className="tu-slide-pane"
                style={{ width: `${100 / totalSlides}%` }}
              >
                <div className="tu-cards-container">
                  {slide.items.length === 0 ? (
                    <div className="tu-empty-state">
                      <div className="tu-empty-icon-wrap">
                        {isThisWeek ? <CalendarDays size={48} /> : <Sparkles size={48} />}
                      </div>
                      <h3 className="tu-empty-title">
                        {isThisWeek ? 'Tidak Ada Kegiatan Terjadwal Minggu Ini' : 'Belum Ada Kegiatan Mendatang'}
                      </h3>
                      <p className="tu-empty-desc">
                        {isDbConnected ? (
                          isThisWeek 
                            ? `Tidak ada agenda kegiatan untuk periode ${weekBounds.weekRangeText}.`
                            : 'Belum ada agenda kegiatan yang dijadwalkan setelah minggu ini.'
                        ) : (
                          'Database offline — Menunggu koneksi MySQL untuk memuat data agenda kegiatan.'
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="tu-cards-grid">
                      {renderScheduleCards(slide.items, slide.pageIndex * ITEMS_PER_PAGE)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TUSlider;
