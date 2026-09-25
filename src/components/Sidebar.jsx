import { CalendarDays, MapPin, CloudSun, Sun, CloudRain, CloudLightning, CloudSnow, Cloud, Clock, Wind, Thermometer, Droplets, Radio, User, Briefcase } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

const Sidebar = () => {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const { schedules, scheduleSpeed } = useDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Perbarui waktu setiap 1 menit untuk cek status
    return () => clearInterval(timer);
  }, []);

  const activeSchedules = schedules.filter(item => {
    try {
      const scheduleDateStr = item.date || new Date().toISOString().split('T')[0];
      const endStr = item.endTime || '23:59';
      const endDateTime = new Date(`${scheduleDateStr}T${endStr}:00`);
      
      // Tambah 10 menit setelah waktu selesai
      const hideTime = new Date(endDateTime.getTime() + 10 * 60000); 
      
      return currentTime <= hideTime;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || activeSchedules.length <= 2) return;
    
    let animationFrameId;
    let scrollPos = 0;
    const speed = 0.5 * (scheduleSpeed || 1);
    
    const scroll = () => {
      const content = contentRef.current;
      if (content && content.children.length >= 2) {
        const firstList = content.children[0];
        const secondList = content.children[1];
        
        // Jarak dari list pertama ke list kedua
        const snapDistance = secondList.offsetTop - firstList.offsetTop;
        
        if (snapDistance > 0) {
          scrollPos += speed;
          if (scrollPos >= snapDistance) {
            scrollPos -= snapDistance;
          }
          el.scrollTop = scrollPos;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    // Mulai animasi tanpa penundaan
    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [schedules, scheduleSpeed, currentTime]);

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


  const renderScheduleItems = () => (
    activeSchedules.map((item, index) => {
      const computedStatus = getDynamicStatus(item);
      const statusStyle = getStatusColor(computedStatus);
      return (
        <div 
          key={item.id} 
          className="schedule-item-modern"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="schedule-item-modern-header">
            <span className="schedule-status" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
              <span className="status-dot" style={{ backgroundColor: statusStyle.text }}></span>
              {computedStatus}
            </span>
            <span className="schedule-date">
              <CalendarDays size={12} style={{ marginRight: '4px' }} />
              {formatDate(item.date)}
            </span>
          </div>
          <h5 className="schedule-title">{item.title}</h5>
          {item.description && <p className="schedule-desc">{item.description}</p>}
          <div className="schedule-meta-row">
            <span className="meta-item">
              <Clock size={12} className="meta-icon" /> 
              {item.startTime || item.time || '00:00'} - {item.endTime || '00:00'}
            </span>
            <span className="meta-item">
              <MapPin size={12} className="meta-icon" /> 
              {item.loc}
            </span>
          </div>
          <div className="schedule-meta-row" style={{ marginTop: '0.25rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
            <span className="meta-item" style={{ color: '#475569' }}>
              <User size={12} className="meta-icon" /> 
              {item.pic || '-'}
            </span>
            <span className="meta-item" style={{ color: '#475569' }}>
              <Briefcase size={12} className="meta-icon" /> 
              {item.partnerCategory || 'Internal'}
            </span>
          </div>
        </div>
      );
    })
  );

  const [weather, setWeather] = useState({
    temp: '--',
    humidity: '--',
    pm25: '--',
    aqi: '--',
    desc: 'Memuat...',
    loc: 'Mencari lokasi...',
    code: 0,
    timestamp: ''
  });

  useEffect(() => {
    const fetchWeatherData = async (lat, lon, locationName) => {
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`)
        ]);

        const weatherData = await weatherRes.json();
        const aqiData = await aqiRes.json();
        
        const currentW = weatherData.current;
        const currentA = aqiData.current;
        
        let desc = 'Cerah';
        const code = currentW?.weather_code || 0;
        if ([1, 2, 3].includes(code)) desc = 'Berawan';
        else if ([45, 48].includes(code)) desc = 'Berkabut';
        else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) desc = 'Hujan';
        else if ([71, 73, 75, 77, 85, 86].includes(code)) desc = 'Salju';
        else if ([95, 96, 99].includes(code)) desc = 'Badai Petir';

        const now = new Date();
        const formattedTime = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0') + ' WIB';

        setWeather({
          temp: currentW ? Math.round(currentW.temperature_2m) : '--',
          humidity: currentW ? Math.round(currentW.relative_humidity_2m) : '--',
          pm25: currentA ? Math.round(currentA.pm2_5) : '--',
          aqi: currentA ? Math.round(currentA.us_aqi) : '--',
          desc: desc,
          loc: locationName,
          code: code,
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

  const WeatherIcon = () => {
    const code = weather.code;
    if ([1, 2, 3].includes(code)) return <CloudSun size={56} className="icon-gold" />;
    if ([45, 48].includes(code)) return <Cloud size={56} style={{ color: '#94a3b8' }} />;
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain size={56} className="icon-blue" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning size={56} style={{ color: '#64748b' }} />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow size={56} style={{ color: '#bae6fd' }} />;
    return <Sun size={56} className="icon-gold" />;
  };

  const getAQIStatus = (aqi) => {
    if (aqi === '--' || aqi == null) return { label: 'Memuat...', color: '#cbd5e1', desc: 'Mengambil data kualitas udara...' };
    if (aqi <= 50) return { label: 'Baik', color: '#a8ca58', desc: 'Kualitas udara sangat baik dan tidak memberikan risiko kesehatan.' };
    if (aqi <= 100) return { label: 'Sedang', color: '#a3c853', desc: 'Kualitas udara dapat diterima bagi sebagian besar masyarakat.' };
    if (aqi <= 150) return { label: 'Tidak Sehat', color: '#f3c33c', desc: 'Kelompok sensitif mungkin mengalami efek kesehatan.' };
    if (aqi <= 200) return { label: 'Sangat Tidak Sehat', color: '#e04f48', desc: 'Setiap orang mungkin mulai merasakan efek kesehatan.' };
    return { label: 'Berbahaya', color: '#b05c90', desc: 'Peringatan kesehatan darurat bagi seluruh populasi.' };
  };

  const aqiStatus = getAQIStatus(weather.aqi);

  return (
    <aside className="sidebar">
      <div className="schedule-card glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <CalendarDays className="icon-blue" size={20} />
          <h4>JADWAL KEGIATAN</h4>
        </div>
        <div className="schedule-list" ref={scrollRef}>
          <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {renderScheduleItems()}
            </div>
            {activeSchedules.length > 2 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-hidden="true">
                  {renderScheduleItems()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-hidden="true">
                  {renderScheduleItems()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-hidden="true">
                  {renderScheduleItems()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.95)', color: '#334155', borderRadius: '1rem', marginTop: '1rem', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>Kualitas Udara {weather.loc}</h4>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ background: aqiStatus.color, borderRadius: '0.75rem', width: '65px', height: '65px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: '1', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{weather.aqi}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '2px', letterSpacing: '0.5px' }}>AQI US</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ background: aqiStatus.color, color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', display: 'inline-block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {aqiStatus.label}
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.9rem', fontWeight: '700', color: '#475569', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Wind size={16} style={{color: '#94a3b8'}}/> PM2.5 <span style={{ fontWeight: 'normal', color: '#64748b' }}>{weather.pm25}</span></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Thermometer size={16} style={{color: '#ef4444'}}/> {weather.temp} °C</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={16} style={{color: '#0ea5e9'}}/> {weather.humidity} %</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12}/> {weather.timestamp || 'Memuat...'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Radio size={12}/> Sumber: IQAir</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
