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
  BadgeCheck 
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const ITEMS_PER_PAGE = 6; // Grid 3x2 (6 kegiatan per halaman agar kartu proporsional & terbaca jelas dari jauh)

const TUSlider = () => {
  const { schedules, slideDuration } = useDashboard();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideTimerKey, setSlideTimerKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather state for mini status bar
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
        label: 'Layanan Libur Akhir Pekan',
        hoursText: 'Sabtu - Minggu',
        color: '#64748b',
        bg: '#f1f5f9',
        border: '#cbd5e1'
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
        label: 'Loket Layanan TU Buka',
        hoursText: isFriday ? '08:00 - 16:30 WIB' : '08:00 - 16:00 WIB',
        color: '#16a34a',
        bg: '#dcfce7',
        border: '#bbf7d0'
      };
    } else if (currentMin >= breakStart && currentMin < breakEnd) {
      return {
        status: 'Istirahat',
        label: 'Jam Istirahat Layanan TU',
        hoursText: isFriday ? '11:30 - 13:30 WIB' : '12:00 - 13:00 WIB',
        color: '#d97706',
        bg: '#fef3c7',
        border: '#fde68a'
      };
    } else if (currentMin >= breakEnd && currentMin < closingTime) {
      return {
        status: 'Buka',
        label: 'Loket Layanan TU Buka',
        hoursText: isFriday ? '08:00 - 16:30 WIB' : '08:00 - 16:00 WIB',
        color: '#16a34a',
        bg: '#dcfce7',
        border: '#bbf7d0'
      };
    } else {
      return {
        status: 'Tutup',
        label: 'Layanan Hari Ini Selesai',
        hoursText: 'Buka 08:00 WIB',
        color: '#475569',
        bg: '#f1f5f9',
        border: '#e2e8f0'
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
        categoryTitle: 'Kegiatan Minggu Ini',
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
        categoryTitle: 'Yang Akan Datang',
        pageIndex: pIdx,
        totalPages: upcomingPages.length,
        items,
        totalCategoryItems: upcomingSchedules.length
      });
    });
    return list;
  }, [thisWeekPages, upcomingPages, thisWeekSchedules.length, upcomingSchedules.length]);

  const totalSlides = allSlides.length || 1;
  const currentSlideIndex = Math.min(activeSlideIndex, totalSlides - 1);
  const currentSlide = allSlides[currentSlideIndex] || allSlides[0];

  // UNCONDITIONAL AUTO-SLIDE TIMER & LIVE COUNTDOWN
  const durationSec = slideDuration || 8;
  const durationMs = durationSec * 1000;
  const [secondsLeft, setSecondsLeft] = useState(durationSec);

  // Live countdown second-by-second for TV signage
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

  const parseDateParts = (dateStr) => {
    if (!dateStr) return { dayNum: '--', monthShort: '---', dayName: '---', year: '----' };
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
      return {
        dayNum: String(d).padStart(2, '0'),
        monthShort: months[dateObj.getMonth()],
        dayName: days[dateObj.getDay()],
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
      if (diffDays === 0) return { label: 'Hari Ini', type: 'today' };
      if (diffDays === 1) return { label: 'Besok', type: 'tomorrow' };
      if (diffDays === 2) return { label: 'Lusa', type: 'soon' };
      if (diffDays > 2 && diffDays <= 7) return { label: `+${diffDays} Hari`, type: 'week' };
      return null;
    } catch (e) {
      return null;
    }
  };

  const getDynamicStatus = (item) => {
    if (item.status === 'Dibatalkan') return 'Dibatalkan';
    if (item.status === 'Selesai') return 'Selesai';

    try {
      const scheduleDateStr = item.date || new Date().toISOString().split('T')[0];
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

  const getSolidStatusStyle = (status) => {
    switch (status) {
      case 'Berlangsung':
        return { 
          bg: '#10b981', 
          glow: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(255,255,255,0) 70%)' 
        };
      case 'Selesai':
        return { 
          bg: '#94a3b8', 
          glow: 'radial-gradient(circle, rgba(148,163,184,0.12) 0%, rgba(255,255,255,0) 70%)' 
        };
      case 'Dibatalkan':
        return { 
          bg: '#ef4444', 
          glow: 'radial-gradient(circle, rgba(239,68,68,0.14) 0%, rgba(255,255,255,0) 70%)' 
        };
      case 'Akan Datang':
      default:
        return { 
          bg: '#3b82f6', 
          glow: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(255,255,255,0) 70%)' 
        };
    }
  };

  const renderScheduleCards = (list, startIndex = 0) => {
    return list.map((item, index) => {
      const dynamicStatus = getDynamicStatus(item);
      const statusStyle = getSolidStatusStyle(dynamicStatus);
      const relativeTag = getRelativeDayTag(item.date);
      const dateParts = parseDateParts(item.date);
      const durationText = calculateDuration(item.startTime || item.time, item.endTime);

      return (
        <div 
          key={item.id || (startIndex + index)} 
          className="tu-card"
          style={{ animationDelay: `${index * 0.02}s` }}
        >
          {/* Decorative Radial Blob */}
          <div 
            className="tu-card-ambient-blob" 
            style={{ background: statusStyle.glow }} 
          />

          {/* TOP SECTION: Mini Calendar Date Block + Header Info */}
          <div className="tu-card-top-section">
            {/* Mini Calendar Date Block */}
            <div className="tu-date-block">
              <div className="tu-date-block-month" style={{ backgroundColor: statusStyle.bg }}>
                {dateParts.monthShort}
              </div>
              <div className="tu-date-block-number">
                {dateParts.dayNum}
              </div>
              <div className="tu-date-block-day">
                {dateParts.dayName}
              </div>
            </div>

            {/* Header Content */}
            <div className="tu-card-header-body">
              <div className="tu-card-status-row">
                <span 
                  className="tu-card-status-pill"
                  style={{ backgroundColor: statusStyle.bg }}
                >
                  {dynamicStatus === 'Berlangsung' && <span className="tu-card-pulsing-dot" />}
                  {dynamicStatus}
                </span>

                {relativeTag && (
                  <span className={`tu-card-rel-pill tu-rel-${relativeTag.type}`}>
                    {relativeTag.label}
                  </span>
                )}
                <span className="tu-card-year-tag">{dateParts.year}</span>
              </div>

              {/* Card Title */}
              <h4 className="tu-card-title" title={item.title}>
                {item.title}
              </h4>

              {/* Card Description - Explains activity, eliminates hollow whitespace */}
              <p className="tu-card-desc">
                {item.description || 'Koordinasi administrasi dan fasilitasi kegiatan terpadu fakultas.'}
              </p>
            </div>
          </div>

          {/* MIDDLE SECTION: Meta Specs Grid (2x2 Structured Box) */}
          <div className="tu-card-specs-grid">
            <div className="tu-spec-item">
              <div className="tu-spec-icon-box">
                <Clock size={13} />
              </div>
              <div className="tu-spec-content">
                <span className="tu-spec-label">Waktu & Durasi</span>
                <span className="tu-spec-value">
                  {item.startTime || item.time || '00:00'} - {item.endTime || '00:00'} WIB {durationText && `(${durationText})`}
                </span>
              </div>
            </div>

            <div className="tu-spec-item">
              <div className="tu-spec-icon-box">
                <MapPin size={13} />
              </div>
              <div className="tu-spec-content">
                <span className="tu-spec-label">Lokasi Ruangan</span>
                <span className="tu-spec-value" title={item.loc}>
                  {item.loc || 'Ruang Rapat'}
                </span>
              </div>
            </div>

            <div className="tu-spec-item">
              <div className="tu-spec-icon-box">
                <User size={13} />
              </div>
              <div className="tu-spec-content">
                <span className="tu-spec-label">Penanggung Jawab</span>
                <span className="tu-spec-value" title={item.pic}>
                  {item.pic || 'Tata Usaha'}
                </span>
              </div>
            </div>

            <div className="tu-spec-item">
              <div className="tu-spec-icon-box">
                <Briefcase size={13} />
              </div>
              <div className="tu-spec-content">
                <span className="tu-spec-label">Kategori Mitra</span>
                <span className="tu-spec-value">
                  {item.partnerCategory || 'Internal'}
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: TU Verification Badge & Partner Tag */}
          <div className="tu-card-footer">
            <div className="tu-card-verification">
              <BadgeCheck size={14} className="tu-verify-icon" />
              <span>Agenda Fasilitasi Terverifikasi TU</span>
            </div>
            <span className="tu-partner-tag">
              {item.partnerCategory || 'Internal'}
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
      {/* TOP NAVIGATION & SERVICE DESK STATUS BAR (AUTOMATED BROADCAST SIGNAGE) */}
      <div className="tu-top-nav glass-panel">
        <div className="tu-segment-container">
          {/* SEGMENT 1: Kegiatan Minggu Ini */}
          <div 
            className={`tu-segment-card ${isCurrentThisWeek ? 'active' : ''}`}
            onClick={() => handleSelectTab(0)}
          >
            <div className="tu-segment-icon-wrap">
              <CalendarDays size={18} />
            </div>
            <div className="tu-segment-text-wrap">
              <div className="tu-segment-label-row">
                <span className="tu-segment-label">SLIDE 1</span>
                {/* Visual Step Pills for Sub-pages */}
                <div className="tu-step-pills">
                  {thisWeekPages.map((_, pIdx) => {
                    const isStepActive = isCurrentThisWeek && currentSlide.pageIndex === pIdx;
                    return (
                      <span 
                        key={pIdx} 
                        className={`tu-step-pill ${isStepActive ? 'step-active' : ''}`}
                      >
                        Hal {pIdx + 1}
                      </span>
                    );
                  })}
                </div>
              </div>
              <span className="tu-segment-title">Kegiatan Minggu Ini</span>
            </div>
            <span className="tu-segment-badge">
              {thisWeekSchedules.length}
            </span>
            {isCurrentThisWeek && (
              <div 
                key={`progress-tw-${currentSlideIndex}-${slideTimerKey}`}
                className="tu-segment-progress-fill" 
                style={{ animationDuration: `${durationMs}ms` }} 
              />
            )}
          </div>

          {/* SEGMENT 2: Kegiatan Yang Akan Datang */}
          <div 
            className={`tu-segment-card ${isCurrentUpcoming ? 'active' : ''}`}
            onClick={() => handleSelectTab(1)}
          >
            <div className="tu-segment-icon-wrap">
              <ArrowRight size={18} />
            </div>
            <div className="tu-segment-text-wrap">
              <div className="tu-segment-label-row">
                <span className="tu-segment-label">SLIDE 2</span>
                {/* Visual Step Pills for Sub-pages */}
                <div className="tu-step-pills">
                  {upcomingPages.map((_, pIdx) => {
                    const isStepActive = isCurrentUpcoming && currentSlide.pageIndex === pIdx;
                    return (
                      <span 
                        key={pIdx} 
                        className={`tu-step-pill ${isStepActive ? 'step-active' : ''}`}
                      >
                        Hal {pIdx + 1}
                      </span>
                    );
                  })}
                </div>
              </div>
              <span className="tu-segment-title">Yang Akan Datang</span>
            </div>
            <span className="tu-segment-badge">
              {upcomingSchedules.length}
            </span>
            {isCurrentUpcoming && (
              <div 
                key={`progress-up-${currentSlideIndex}-${slideTimerKey}`}
                className="tu-segment-progress-fill" 
                style={{ animationDuration: `${durationMs}ms` }} 
              />
            )}
          </div>
        </div>

        {/* CONTROLS & TU DESK REAL-TIME STATUS */}
        <div className="tu-nav-right">
          {/* Real-time TU Office Desk Status Pill */}
          <div 
            className="tu-office-status-pill"
            style={{ 
              background: officeStatus.bg, 
              borderColor: officeStatus.border, 
              color: officeStatus.color 
            }}
          >
            <span className="tu-office-dot" style={{ backgroundColor: officeStatus.color }} />
            <span className="tu-office-text">
              <strong>{officeStatus.label}</strong> ({officeStatus.hoursText})
            </span>
          </div>

          {/* Live Automatic Signage Indicator with Live Second Countdown */}
          <div className="tu-auto-indicator-pill">
            <span className="tu-auto-dot"></span>
            <span>Penayangan Otomatis ({secondsLeft}s)</span>
          </div>

          {/* Mini Weather Pill */}
          <div className="tu-weather-pill">
            <span className="tu-weather-loc">📍 {weather.loc}</span>
            <span className="tu-weather-divider">•</span>
            <span className="tu-weather-temp">☀️ {weather.temp}°C</span>
            <span className="tu-weather-divider">•</span>
            <span className="tu-weather-aqi" style={{ backgroundColor: getAQIColor(weather.aqi) }}>
              AQI {weather.aqi}
            </span>
          </div>
        </div>
      </div>

      {/* SLIDE CONTENT VIEWPORT WITH DYNAMIC MULTI-PAGE SLIDING TRACK & FULL-WIDTH COUNTDOWN BAR */}
      <div className="tu-slides-viewport glass-panel">
        {/* Full-width live progress countdown bar */}
        <div className="tu-live-progress-bar-wrap">
          <div 
            key={`tu-global-progress-${currentSlideIndex}-${slideTimerKey}`}
            className="tu-live-progress-bar-fill"
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
                {/* SUB-HEADER BANNER & QUICK TU SERVICE CHIPS */}
                <div className="tu-slide-banner">
                  <div className="tu-banner-left">
                    <div className="tu-banner-icon-box">
                      {isThisWeek ? <CalendarDays size={24} /> : <Sparkles size={24} />}
                    </div>
                    <div>
                      <h2 className="tu-banner-title">
                        {isThisWeek ? 'Jadwal Kegiatan Minggu Ini' : 'Jadwal Kegiatan Yang Akan Datang'}
                      </h2>
                      <p className="tu-banner-subtitle">
                        {isThisWeek ? (
                          <>
                            <span>Periode: <strong>{weekBounds.weekRangeText}</strong></span>
                            <span className="tu-banner-bullet">•</span>
                            <span>Menampilkan seluruh kegiatan pekan berjalan</span>
                          </>
                        ) : (
                          <>
                            <span>Mulai: <strong>{weekBounds.nextMondayText}</strong> dan seterusnya</span>
                            <span className="tu-banner-bullet">•</span>
                            <span>Agenda kegiatan terjadwal di masa mendatang</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quick Services Chips of Tata Usaha */}
                  <div className="tu-services-row">
                    <div className="tu-service-chip" title="Pelayanan KRS, Transkrip & Surat Keterangan Mahasiswa">
                      <GraduationCap size={13} className="tu-chip-icon" />
                      <span>Layanan Akademik</span>
                    </div>
                    <div className="tu-service-chip" title="Peminjaman Ruang Kelas, Gedung & Laboratorium">
                      <Building2 size={13} className="tu-chip-icon" />
                      <span>Sarpras & Ruangan</span>
                    </div>
                    <div className="tu-service-chip" title="Persuratan Dinas, Legalitas & Kepegawaian Tendik">
                      <Briefcase size={13} className="tu-chip-icon" />
                      <span>Umum & Persuratan</span>
                    </div>
                  </div>

                  <div className="tu-banner-right">
                    <span className="tu-total-badge">
                      <Calendar size={13} />
                      {slide.totalCategoryItems} Agenda
                    </span>
                    <span className="tu-slide-indicator-tag">
                      Slide {slide.categoryIndex + 1} / 2
                      {slide.totalPages > 1 && (
                        <span className="tu-sub-tag"> • Hal {slide.pageIndex + 1}/{slide.totalPages}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* SLIDE CARDS GRID (3x2 PERSEGI PROPORSIONAL & KAYA INFORMASI) */}
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
                        {isThisWeek 
                          ? `Tidak ada agenda kegiatan untuk periode ${weekBounds.weekRangeText}.`
                          : 'Belum ada agenda kegiatan yang dijadwalkan setelah minggu ini. Data akan otomatis muncul setelah ditambahkan oleh Admin.'}
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
