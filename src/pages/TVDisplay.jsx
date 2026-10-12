import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Slider from '../components/Slider';
import Footer from '../components/Footer';
import TUSlider from '../components/TUSlider';
import { applyThemeColors } from '../utils/themeUtils';

function TVDisplay() {
  const { primaryColor, templateColors, tvLayout, timeOn, timeOff } = useDashboard();
  const [searchParams] = useSearchParams();
  const activeLayout = searchParams.get('layout') || tvLayout;
  const [isStandby, setIsStandby] = useState(false);

  // Layout-specific color theme with fallback to primaryColor
  const layoutColor = templateColors?.[activeLayout] || primaryColor || '#3b82f6';

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
    const interval = setInterval(checkStandby, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [timeOn, timeOff]);

  if (isStandby) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: '#222', fontSize: '2rem', fontFamily: 'sans-serif' }}>Mode Tidur (Standby)</h1>
      </div>
    );
  }

  let contentLayout;

  if (activeLayout === 'full-media') {
    // 1. FULL MEDIA: Slide Layar Penuh (100% tanpa Sidebar)
    contentLayout = <Slider />;
  } else if (activeLayout === 'agenda-focus') {
    // 2. FOKUS AGENDA: Agenda Lebar di Kiri (Hero), Slide Kompak di Kanan
    contentLayout = (
      <>
        <Sidebar />
        <Slider />
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
        <Slider />
      </>
    );
  } else {
    // 5. STANDARD (Default): Kegiatan di Kiri, Slide di Kanan
    contentLayout = (
      <>
        <Sidebar />
        <Slider />
      </>
    );
  }

  return (
    <div className={`dashboard-container layout-${activeLayout}`}>
      <Header />
      <main className="main-content">
        {contentLayout}
      </main>
      <Footer />
    </div>
  );
}

export default TVDisplay;
