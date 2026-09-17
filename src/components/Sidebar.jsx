import { CalendarDays, MapPin, CloudSun, Sun, CloudRain, CloudLightning, CloudSnow, Cloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

const Sidebar = () => {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const { schedules, scheduleSpeed } = useDashboard();

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content || schedules.length <= 4) return;
    
    let animationFrameId;
    let scrollPos = 0;
    const speed = 0.5 * (scheduleSpeed || 1); // kecepatan scroll dinamis
    
    const scroll = () => {
      if (content.children.length >= 2) {
        const firstList = content.children[0];
        const secondList = content.children[1];
        
        // Hitung jarak persis untuk satu siklus loop
        const snapDistance = secondList.offsetTop - firstList.offsetTop;
        
        scrollPos += speed;
        if (scrollPos >= snapDistance) {
          scrollPos -= snapDistance;
        }
        
        el.scrollTop = scrollPos;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(scroll);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [schedules, scheduleSpeed]);

  const renderScheduleItems = () => (
    schedules.map((item, index) => (
      <div 
        key={item.id} 
        className="schedule-item"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="schedule-time">
          <span className="time">{item.time}</span>
          <span className="day">{item.day}</span>
        </div>
        <div className="schedule-details">
          <h5>{item.title}</h5>
          <span className="loc">
            <MapPin size={12} className="text-muted" style={{ marginRight: '4px' }}/> 
            {item.loc}
          </span>
        </div>
      </div>
    ))
  );

  const [weather, setWeather] = useState({
    temp: '--',
    desc: 'Memuat...',
    loc: 'Mencari lokasi...',
    code: 0
  });

  useEffect(() => {
    const fetchWeatherData = async (lat, lon, locationName) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        const current = data.current_weather;
        
        let desc = 'Cerah';
        const code = current.weathercode;
        if ([1, 2, 3].includes(code)) desc = 'Berawan';
        else if ([45, 48].includes(code)) desc = 'Berkabut';
        else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) desc = 'Hujan';
        else if ([71, 73, 75, 77, 85, 86].includes(code)) desc = 'Salju';
        else if ([95, 96, 99].includes(code)) desc = 'Badai Petir';

        setWeather({
          temp: Math.round(current.temperature),
          desc: desc,
          loc: locationName,
          code: code
        });
      } catch (error) {
        console.error("Gagal mengambil cuaca:", error);
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

  return (
    <aside className="sidebar">
      <div className="schedule-card glass-panel">
        <div className="card-header">
          <CalendarDays className="icon-blue" size={20} />
          <h4>JADWAL KEGIATAN</h4>
        </div>
        <div className="schedule-list" ref={scrollRef}>
          <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {renderScheduleItems()}
            </div>
            {schedules.length > 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {renderScheduleItems()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="weather-card glass-panel">
        <div className="weather-icon">
          <WeatherIcon />
        </div>
        <div className="weather-info">
          <div className="temp">{weather.temp}°C</div>
          <div className="desc">{weather.desc}</div>
          <div className="loc">{weather.loc}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
