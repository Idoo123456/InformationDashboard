import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import Header from '../components/display/Header';
import Sidebar from '../components/display/Sidebar';
import Slider from '../components/display/Slider';
import Footer from '../components/display/Footer';
import TUSlider from '../components/display/TUSlider';
import { applyThemeColors } from '../utils/themeUtils';

function TVDisplay() {
  const { primaryColor, templateColors, tvLayout, timeOn, timeOff, prefix } = useDashboard();
  const { tvId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parameter identifikasi TV: bisa lewat path (/tv/:tvId) atau query (?device=... / ?tv=...)
  const deviceParam = searchParams.get('device') || searchParams.get('tv') || tvId;
  const screenId = searchParams.get('screen'); // Khusus 3 TV Pusat lama jika dipanggil langsung

  const [tvDeviceConfig, setTvDeviceConfig] = useState(null);
  const [tvScreenConfig, setTvScreenConfig] = useState(null);

  // 1. Ambil data konfigurasi Perangkat TV Dinamis jika deviceParam ada
  useEffect(() => {
    if (!deviceParam) return;

    const fetchDeviceConfig = () => {
      fetch(`/api/tv-devices/${deviceParam}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setTvDeviceConfig(data);
            const targetFaculty = data.faculty_prefix || 'main';
            const currentPrefix = prefix || 'main';
            if (targetFaculty !== currentPrefix) {
              const targetPath = targetFaculty === 'main'
                ? `/tv/${data.code || data.id}`
                : `/${targetFaculty}/tv/${data.code || data.id}`;
              navigate(targetPath, { replace: true });
            }
          }
        })
        .catch(() => {});
    };

    fetchDeviceConfig();
    const interval = setInterval(fetchDeviceConfig, 4000); // Sinkronisasi otomatis setiap 4 detik
    return () => clearInterval(interval);
  }, [deviceParam, prefix, navigate]);

  // 2. Ambil data TV Pusat lama jika hanya screenId yang dipanggil (?screen=1/2/3)
  useEffect(() => {
    if (!screenId || deviceParam) return;

    const fetchScreenConfig = () => {
      fetch(`/api/tv-screens/${screenId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setTvScreenConfig(data);
            const targetFaculty = data.faculty_prefix || 'main';
            const currentPrefix = prefix || 'main';
            if (targetFaculty !== currentPrefix) {
              const targetPath = targetFaculty === 'main'
                ? `/tv?screen=${screenId}`
                : `/${targetFaculty}/tv?screen=${screenId}`;
              navigate(targetPath, { replace: true });
            }
          }
        })
        .catch(() => {});
    };

    fetchScreenConfig();
    const interval = setInterval(fetchScreenConfig, 4000);
    return () => clearInterval(interval);
  }, [screenId, deviceParam, prefix, navigate]);

  // Konfigurasi aktif (prioritas: Perangkat TV Dinamis -> TV Layar Lama -> Dashboard Context)
  const activeConfig = tvDeviceConfig || tvScreenConfig;
  const activeLayout = (activeConfig && activeConfig.layout) || searchParams.get('layout') || tvLayout;
  const [isStandby, setIsStandby] = useState(false);

  // Layout-specific color theme with fallback
  const layoutColor = (activeConfig && activeConfig.theme_color) 
    || templateColors?.[activeLayout] 
    || primaryColor 
    || '#1e40af';

  useEffect(() => {
    applyThemeColors(layoutColor);
  }, [layoutColor]);

  useEffect(() => {
    const checkStandby = () => {
      if (!timeOn || !timeOff) {
        setIsStandby(false);
        return;
      }
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [onH, onM] = timeOn.split(':').map(Number);
      const [offH, offM] = timeOff.split(':').map(Number);
      
      const onMinutes = onH * 60 + onM;
      const offMinutes = offH * 60 + offM;

      if (onMinutes < offMinutes) {
        setIsStandby(currentMinutes < onMinutes || currentMinutes >= offMinutes);
      } else {
        setIsStandby(currentMinutes >= offMinutes && currentMinutes < onMinutes);
      }
    };
    
    checkStandby();
    const interval = setInterval(checkStandby, 60000); // Cek tiap 1 menit
    return () => clearInterval(interval);
  }, [timeOn, timeOff]);

  const isScreenOff = isStandby || (activeConfig && Number(activeConfig.is_active) === 0);

  if (isScreenOff) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#0a0f1d', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
        <h1 style={{ color: '#475569', fontSize: '2.5rem', fontFamily: 'sans-serif', margin: 0 }}>Mode Tidur (Standby)</h1>
        <p style={{ marginTop: '0.75rem', fontSize: '1.1rem', color: '#334155' }}>
          {activeConfig?.name ? `${activeConfig.name} dinonaktifkan` : 'Layar ini sedang dalam mode hemat daya'}
        </p>
      </div>
    );
  }

  let contentLayout;

  if (activeLayout === 'full-media') {
    // 1. FULL MEDIA: Slide Layar Penuh (100% tanpa Sidebar)
    contentLayout = <Slider currentTv={tvDeviceConfig} />;
  } else if (activeLayout === 'agenda-focus') {
    // 2. FOKUS AGENDA: Agenda Lebar di Kiri (Hero), Slide Kompak di Kanan
    contentLayout = (
      <>
        <Sidebar />
        <Slider currentTv={tvDeviceConfig} />
      </>
    );
  } else if (activeLayout === 'tu') {
    // 3. TEMA TU: 2 Slide Khusus Tata Usaha (Pekan Ini & Yang Akan Datang)
    contentLayout = <TUSlider />;
  } else if (activeLayout === 'admin') {
    // 4. TEMA ADMIN: Sidebar Lebar Eksekutif di Kiri, Slide di Kanan
    contentLayout = (
      <>
        <Sidebar />
        <Slider currentTv={tvDeviceConfig} />
      </>
    );
  } else {
    // 5. STANDARD (Default): Kegiatan di Kiri, Slide di Kanan
    contentLayout = (
      <>
        <Sidebar />
        <Slider currentTv={tvDeviceConfig} />
      </>
    );
  }

  return (
    <div className={`dashboard-container layout-${activeLayout}`}>
      <Header currentTv={tvDeviceConfig} />
      <main className="main-content">
        {contentLayout}
      </main>
      <Footer customAnnouncement={activeConfig?.custom_announcement} />
    </div>
  );
}

export default TVDisplay;
