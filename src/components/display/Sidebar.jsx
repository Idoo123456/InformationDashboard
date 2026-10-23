import { 
  CalendarDays, MapPin, CloudSun, Sun, CloudRain, CloudLightning, 
  CloudSnow, Cloud, Clock, Wind, Thermometer, Droplets, Radio, 
  User, Briefcase, Activity, ShieldAlert, Sparkles, AlertCircle, Compass 
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';

const Sidebar = () => {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const isPausedRef = useRef(false);
  const { schedules, scheduleSpeed, scheduleScrollType, isDbConnected } = useDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Perbarui waktu setiap 1 detik untuk jam digital presisi
    return () => clearInterval(timer);
  }, []);

  const activeSchedules = schedules.filter(item => {
    try {
      const scheduleDateStr = item.date || new Date().toISOString().split('T')[0];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scheduleDate = new Date(`${scheduleDateStr}T00:00:00`);
      
      // Tampilkan semua jadwal hari ini dan yang akan datang
      return scheduleDate >= today;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isMounted = true;
    let timerId = null;
    let animFrameId = null;

    // Reset posisi saat pergantian mode atau data
    el.scrollTop = 0;

    const runScroll = () => {
      if (!isMounted || !contentRef.current) return;
      const firstList = contentRef.current.children[0];

      // Jika jadwal tidak cukup banyak, tidak perlu scroll
      if (!firstList || activeSchedules.length <= 1) return;

      const isOverflowing = firstList.scrollHeight > el.clientHeight + 10;
      if (!isOverflowing) return;

      const getSnapDistance = () => {
        if (!contentRef.current) return 0;
        const first = contentRef.current.children[0];
        const clone = contentRef.current.children[1];
        if (clone && first) {
          const dist = clone.offsetTop - first.offsetTop;
          if (dist > 0) return dist;
        }
        return first ? first.offsetHeight + 12 : 0;
      };

      if (scheduleScrollType === 'continuous') {
        // === MODE 1: CONTINUOUS SMOOTH MARQUEE ===
        let lastTimestamp = performance.now();
        let scrollPos = el.scrollTop || 0;

        const loop = (currentTimestamp) => {
          if (!isMounted) return;
          const deltaSec = Math.min((currentTimestamp - lastTimestamp) / 1000, 0.1);
          lastTimestamp = currentTimestamp;

          const snapDist = getSnapDistance();
          if (snapDist > 0 && !isPausedRef.current) {
            // Kecepatan: 30px/detik pada scheduleSpeed = 1
            const speedMultiplier = Math.max(0.1, Number(scheduleSpeed) || 1);
            const speedPixelsPerSec = 30 * speedMultiplier;
            scrollPos += speedPixelsPerSec * deltaSec;

            if (scrollPos >= snapDist) {
              scrollPos -= snapDist;
            }
            el.scrollTop = scrollPos;
          } else if (isPausedRef.current) {
            // Sinkronisasi jika discroll manual oleh pengguna
            scrollPos = el.scrollTop;
          }

          animFrameId = requestAnimationFrame(loop);
        };

        animFrameId = requestAnimationFrame(loop);
      } else {
        // === MODE 2: STEP-BY-STEP (Pause per Agenda / Baris) ===
        const getRowOffsets = () => {
          if (!firstList || !firstList.children.length) return [0];
          const baseOffset = firstList.children[0]?.offsetTop || 0;
          const offsets = [];

          for (let i = 0; i < firstList.children.length; i++) {
            const child = firstList.children[i];
            const rawOffset = Math.max(0, child.offsetTop - baseOffset);
            const rounded = Math.round(rawOffset);
            // Kelompokkan kartu yang berada di baris horizontal sama (misal 2 kolom di tema agenda-focus)
            if (!offsets.some(o => Math.abs(o - rounded) <= 6)) {
              offsets.push(rounded);
            }
          }
          return offsets.length > 0 ? offsets : [0];
        };

        let currentRowIndex = 0;
        const speedMultiplier = Math.max(0.2, Number(scheduleSpeed) || 1);
        const pauseDuration = Math.max(2000, Math.round(4500 / speedMultiplier));

        const step = () => {
          if (!isMounted || !el || !contentRef.current) return;

          if (isPausedRef.current) {
            // Sedang di-hover atau disentuh pengguna, cek lagi sebentar
            timerId = setTimeout(step, 600);
            return;
          }

          const offsets = getRowOffsets();
          const snapDist = getSnapDistance();
          if (offsets.length <= 1 || snapDist <= 0) return;

          currentRowIndex++;

          if (currentRowIndex < offsets.length) {
            // Geser mulus ke agenda berikutnya
            const target = offsets[currentRowIndex];
            el.scrollTo({ top: target, behavior: 'smooth' });
            timerId = setTimeout(step, pauseDuration);
          } else {
            // Telah sampai di akhir list utama!
            // Looping maju mulus ke baris pertama dari list clone (snapDist)
            el.scrollTo({ top: snapDist, behavior: 'smooth' });

            // Begitu animasi smooth selesai (~700ms), snap instan ke 0 tanpa visual jump
            timerId = setTimeout(() => {
              if (!isMounted || !el) return;
              el.scrollTo({ top: 0, behavior: 'instant' });
              currentRowIndex = 0;
              // Berikan jeda membaca pada agenda pertama sebelum lanjut ke agenda berikutnya
              timerId = setTimeout(step, pauseDuration);
            }, 700);
          }
        };

        timerId = setTimeout(step, pauseDuration);
      }
    };

    // Delay kecil untuk memastikan layout DOM selesai dihitung browser
    const initTimer = setTimeout(runScroll, 200);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      if (timerId) clearTimeout(timerId);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [activeSchedules.length, scheduleSpeed, scheduleScrollType]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Berlangsung': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'Selesai': return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
      case 'Dibatalkan': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
      default: return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Hari Ini';
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    try {
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
      return dateString;
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


  const renderScheduleItems = (prefix = 'primary') => {
    if (activeSchedules.length === 0) {
      if (prefix === 'clone') return null;
      return (
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.4)', borderRadius: '1rem', border: '1px dashed #cbd5e1', margin: '0.5rem 0' }}>
          <CalendarDays size={32} style={{ color: '#cbd5e1' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#475569' }}>Tidak Ada Agenda Kegiatan</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              {isDbConnected ? 'Belum ada agenda terdaftar pada database.' : 'Database offline — Menunggu koneksi MySQL...'}
            </div>
          </div>
        </div>
      );
    }
    return activeSchedules.map((item, index) => {
      const computedStatus = getDynamicStatus(item);
      const statusStyle = getStatusColor(computedStatus);
      return (
        <div 
          key={`${prefix}-${item.id}`} 
          className="schedule-item-modern"
          style={{ 
            animationDelay: `${index * 0.08}s`,
            '--item-accent': statusStyle.text
          }}
        >
          <div className="schedule-item-modern-header">
            <span className="schedule-status" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
              <span className="status-dot" style={{ backgroundColor: statusStyle.text }}></span>
              {computedStatus}
            </span>
            <span className="schedule-date">
              <CalendarDays size={14} style={{ marginRight: '5px', color: 'var(--theme-color, #1e40af)' }} />
              {formatDate(item.date)}
            </span>
          </div>
          <h5 className="schedule-title">{item.title}</h5>
          {item.description && <p className="schedule-desc">{item.description}</p>}
          <div className="schedule-meta-row">
            <span className="meta-item">
              <Clock size={14} className="meta-icon" /> 
              {item.startTime || item.time || '00:00'} - {item.endTime || '00:00'}
            </span>
            <span className="meta-item">
              <MapPin size={14} className="meta-icon" /> 
              {item.loc}
            </span>
          </div>
          <div className="schedule-meta-row" style={{ marginTop: '0.15rem', borderTop: '1px solid rgba(241, 245, 249, 1)', paddingTop: '0.55rem' }}>
            <span className="meta-item" style={{ color: '#475569' }}>
              <User size={14} className="meta-icon" /> 
              {item.pic || '-'}
            </span>
            <span className="meta-item" style={{ color: '#475569' }}>
              <Briefcase size={14} className="meta-icon" /> 
              {item.partnerCategory || 'Internal'}
            </span>
          </div>
        </div>
      );
    });
  };

  const [weather, setWeather] = useState({
    temp: '--',
    feelsLike: '--',
    humidity: '--',
    windSpeed: '--',
    pm25: '--',
    pm10: '--',
    aqi: '--',
    desc: 'Memuat...',
    loc: 'Pekanbaru',
    code: 0,
    isDay: 1,
    timestamp: ''
  });

  useEffect(() => {
    const fetchWeatherData = async (lat, lon, locationName) => {
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day`),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`)
        ]);

        const weatherData = await weatherRes.json();
        const aqiData = await aqiRes.json();
        
        const currentW = weatherData.current;
        const currentA = aqiData.current;
        
        const code = currentW?.weather_code ?? 0;
        const now = new Date();
        const formattedTime = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0') + ' WIB';

        setWeather({
          temp: currentW?.temperature_2m != null ? Math.round(currentW.temperature_2m) : '--',
          feelsLike: currentW?.apparent_temperature != null ? Math.round(currentW.apparent_temperature) : '--',
          humidity: currentW?.relative_humidity_2m != null ? Math.round(currentW.relative_humidity_2m) : '--',
          windSpeed: currentW?.wind_speed_10m != null ? (Math.round(currentW.wind_speed_10m * 10) / 10) : '--',
          pm25: currentA?.pm2_5 != null ? Math.round(currentA.pm2_5) : '--',
          pm10: currentA?.pm10 != null ? Math.round(currentA.pm10) : '--',
          aqi: currentA?.us_aqi != null ? Math.round(currentA.us_aqi) : '--',
          loc: locationName,
          code: code,
          isDay: currentW?.is_day ?? 1,
          timestamp: formattedTime
        });
      } catch (error) {
        console.error("Gagal mengambil cuaca dan AQI:", error);
        setWeather(prev => ({...prev, desc: 'Gagal memuat'}));
      }
    };

    const getFallbackLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          fetchWeatherData(data.latitude, data.longitude, data.city || 'Pekanbaru');
        } else {
          throw new Error('IP API failed');
        }
      } catch (e) {
        fetchWeatherData(0.5333, 101.4500, 'Pekanbaru');
      }
    };

    let isMounted = true;

    const initWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (!isMounted) return;
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`);
              const data = await res.json();
              fetchWeatherData(latitude, longitude, data.city || data.locality || 'Lokasi Anda');
            } catch (e) {
              fetchWeatherData(latitude, longitude, 'Lokasi Anda');
            }
          },
          (error) => {
            console.warn("Geolocation denied/error, using fallback.", error);
            if (isMounted) getFallbackLocation();
          },
          { timeout: 5000 }
        );
      } else {
        getFallbackLocation();
      }
    };

    initWeather();
    const weatherInterval = setInterval(initWeather, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(weatherInterval);
    };
  }, []);

  const getWeatherInfo = (code) => {
    if (code === 0) return { desc: 'Cerah', iconType: 'sun' };
    if ([1, 2].includes(code)) return { desc: 'Cerah Berawan', iconType: 'cloud-sun' };
    if (code === 3) return { desc: 'Berawan', iconType: 'cloud' };
    if ([45, 48].includes(code)) return { desc: 'Berkabut', iconType: 'fog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { desc: 'Gerimis', iconType: 'rain' };
    if ([61, 63].includes(code)) return { desc: 'Hujan Ringan', iconType: 'rain' };
    if (code === 65) return { desc: 'Hujan Lebat', iconType: 'rain' };
    if ([80, 81, 82].includes(code)) return { desc: 'Hujan Lokal', iconType: 'rain' };
    if ([95, 96, 99].includes(code)) return { desc: 'Badai Petir', iconType: 'lightning' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { desc: 'Salju', iconType: 'snow' };
    return { desc: 'Cerah Berawan', iconType: 'cloud-sun' };
  };

  const weatherInfo = getWeatherInfo(weather.code);

  const renderWeatherIcon = (iconType, size = 34) => {
    switch (iconType) {
      case 'sun':
        return <Sun size={size} className="weather-icon-sun" />;
      case 'rain':
        return <CloudRain size={size} className="weather-icon-rain" />;
      case 'lightning':
        return <CloudLightning size={size} className="weather-icon-lightning" />;
      case 'fog':
        return <Cloud size={size} className="weather-icon-fog" />;
      case 'snow':
        return <CloudSnow size={size} className="weather-icon-snow" />;
      case 'cloud':
        return <Cloud size={size} className="weather-icon-cloud" />;
      case 'cloud-sun':
      default:
        return <CloudSun size={size} className="weather-icon-cloudsun" />;
    }
  };

  const getAQIStatus = (aqi) => {
    if (aqi === '--' || aqi == null) {
      return { 
        label: 'Memuat...', 
        category: 'Memeriksa Udara',
        color: '#94a3b8', 
        gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
        bgGlow: 'rgba(148, 163, 184, 0.08)',
        border: 'rgba(148, 163, 184, 0.25)',
        advice: 'Mengambil data real-time pemantauan kualitas udara...',
        icon: 'info'
      };
    }
    const val = Number(aqi);
    if (val <= 50) {
      return { 
        label: 'Baik', 
        category: 'Udara Sangat Sehat',
        color: '#10b981', 
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        bgGlow: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.25)',
        advice: 'Kualitas udara sangat bersih. Sangat aman & segar untuk beraktivitas luar.',
        icon: 'sparkles'
      };
    }
    if (val <= 100) {
      return { 
        label: 'Sedang', 
        category: 'Dapat Diterima',
        color: '#eab308', 
        gradient: 'linear-gradient(135deg, #eab308, #ca8a04)',
        bgGlow: 'rgba(234, 179, 8, 0.08)',
        border: 'rgba(234, 179, 8, 0.25)',
        advice: 'Kualitas udara moderat & aman bagi sebagian besar masyarakat.',
        icon: 'info'
      };
    }
    if (val <= 150) {
      return { 
        label: 'Tidak Sehat Sensitif', 
        category: 'Kelompok Rentan',
        color: '#f97316', 
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
        bgGlow: 'rgba(249, 115, 22, 0.1)',
        border: 'rgba(249, 115, 22, 0.25)',
        advice: 'Kelompok rentan diimbau mengenakan masker saat beraktivitas di luar.',
        icon: 'alert'
      };
    }
    if (val <= 200) {
      return { 
        label: 'Sangat Tidak Sehat', 
        category: 'Peringatan Kesehatan',
        color: '#ef4444', 
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        bgGlow: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.25)',
        advice: 'Gunakan masker di luar ruangan & batasi aktivitas fisik outdoor.',
        icon: 'shield'
      };
    }
    if (val <= 300) {
      return { 
        label: 'Berbahaya', 
        category: 'Darurat Udara',
        color: '#a855f7', 
        gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
        bgGlow: 'rgba(168, 85, 247, 0.12)',
        border: 'rgba(168, 85, 247, 0.3)',
        advice: 'Peringatan darurat kesehatan! Seluruh populasi hindari aktivitas luar.',
        icon: 'shield'
      };
    }
    return { 
      label: 'Ekstrem Bahaya', 
      category: 'Kritis Darurat',
      color: '#881337', 
      gradient: 'linear-gradient(135deg, #881337, #4c0519)',
      bgGlow: 'rgba(136, 19, 55, 0.15)',
      border: 'rgba(136, 19, 55, 0.35)',
      advice: 'Kondisi udara darurat! Tutup jendela rapat & gunakan pembersih udara.',
      icon: 'shield'
    };
  };

  const aqiStatus = getAQIStatus(weather.aqi);
  const aqiVal = typeof weather.aqi === 'number' ? weather.aqi : parseInt(weather.aqi) || 0;
  const aqiPointerPercent = Math.min(Math.max(Math.round((aqiVal / 300) * 100), 2), 98);

  return (
    <aside className="sidebar">
      <div className="schedule-card glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CalendarDays size={20} style={{ color: 'var(--theme-color, #1e40af)' }} />
            <h4 style={{ margin: 0 }}>JADWAL KEGIATAN</h4>
          </div>
          <span style={{ 
            fontSize: '0.78rem', 
            fontWeight: 800, 
            background: 'rgba(var(--theme-color-rgb, 30, 64, 175), 0.08)', 
            color: 'var(--theme-color, #1e40af)', 
            padding: '0.25rem 0.7rem', 
            borderRadius: '999px',
            border: '1px solid rgba(var(--theme-color-rgb, 30, 64, 175), 0.18)',
            letterSpacing: '0.2px'
          }}>
            {activeSchedules.length} Agenda
          </span>
        </div>
        <div 
          className="schedule-list" 
          ref={scrollRef}
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
          onTouchStart={() => { isPausedRef.current = true; }}
          onTouchEnd={() => { isPausedRef.current = false; }}
        >
          <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {renderScheduleItems('primary')}
            </div>
            {activeSchedules.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }} aria-hidden="true">
                {renderScheduleItems('clone')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div 
        className="weather-glass-card glass-panel weather-compact"
        style={{
          '--aqi-glow': aqiStatus.bgGlow,
          '--aqi-gradient': aqiStatus.gradient,
          borderColor: aqiStatus.border
        }}
      >
        <div className="weather-glass-card-glow" />

        {/* 1. Header Row */}
        <div className="weather-card-header">
          <div className="weather-header-left">
            <div className="weather-location-chip">
              <MapPin size={12} className="weather-pin-icon" />
              <span>{weather.loc}</span>
            </div>
            <div className="weather-live-indicator">
              <span className="pulse-dot"></span>
              <span className="live-text">LIVE</span>
            </div>
          </div>
          <div className="weather-header-right">
            <Clock size={11} className="weather-clock-icon" />
            <span>
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
            </span>
          </div>
        </div>

        {/* 2. Hero Section: Dual Showcase Compact */}
        <div className="weather-hero-row">
          {/* AQI Panel with Embedded Mini Spectrum */}
          <div className="aqi-hero-card" style={{ background: aqiStatus.bgGlow, borderColor: aqiStatus.border }}>
            <div className="aqi-hero-left">
              <span className="aqi-badge-score" style={{ color: aqiStatus.color }}>
                {weather.aqi}
              </span>
              <span className="aqi-badge-sub">AQI US</span>
            </div>
            <div className="aqi-hero-info">
              <span className="aqi-status-pill" style={{ background: aqiStatus.gradient }}>
                {aqiStatus.label}
              </span>
              <div className="aqi-mini-spectrum">
                <div className="aqi-spectrum-track">
                  <div 
                    className="aqi-spectrum-pointer" 
                    style={{ left: `${aqiPointerPercent}%`, backgroundColor: aqiStatus.color }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cuaca & Suhu Panel */}
          <div className="weather-hero-card">
            <div className="weather-hero-left">
              {renderWeatherIcon(weatherInfo.iconType, 26)}
            </div>
            <div className="weather-hero-info">
              <div className="weather-temp-main">
                {weather.temp}°<span className="weather-temp-unit">C</span>
              </div>
              <span className="weather-desc-pill">{weatherInfo.desc}</span>
              <span className="weather-feels-like">
                Terasa {weather.feelsLike !== '--' ? `${weather.feelsLike}°C` : `${weather.temp}°C`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Compact High-Density Metrics & Advisory Strip */}
        <div className="weather-compact-bottom-row">
          <div className="weather-mini-pills">
            <span className="compact-metric" title="Partikel Halus PM2.5">
              <Wind size={11} className="metric-icon-pm25" /> PM2.5 <strong>{weather.pm25}</strong>
            </span>
            <span className="compact-metric" title="Partikel Debu PM10">
              <Activity size={11} className="metric-icon-pm10" /> PM10 <strong>{weather.pm10}</strong>
            </span>
            <span className="compact-metric" title="Kelembapan Relatif">
              <Droplets size={11} className="metric-icon-drop" /> <strong>{weather.humidity}%</strong>
            </span>
            <span className="compact-metric" title="Kecepatan Angin">
              <Compass size={11} className="metric-icon-wind" /> <strong>{weather.windSpeed} km/j</strong>
            </span>
          </div>

          <div className="compact-advisory-pill" style={{ borderColor: aqiStatus.border, background: aqiStatus.bgGlow }}>
            <span className="advisory-icon" style={{ color: aqiStatus.color }}>
              {aqiStatus.icon === 'sparkles' && <Sparkles size={11} />}
              {aqiStatus.icon === 'alert' && <AlertCircle size={11} />}
              {aqiStatus.icon === 'shield' && <ShieldAlert size={11} />}
              {aqiStatus.icon === 'info' && <AlertCircle size={11} />}
            </span>
            <span className="compact-advisory-text">
              <strong>Saran:</strong> {aqiStatus.advice}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
