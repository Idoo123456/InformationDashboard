import { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Slider from '../components/Slider';
import Footer from '../components/Footer';

function TVDisplay() {
  const { primaryColor, tvLayout, timeOn, timeOff } = useDashboard();
  const [isStandby, setIsStandby] = useState(false);

  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-blue', primaryColor);
      document.documentElement.style.setProperty('--admin-primary', primaryColor);
    }
  }, [primaryColor]);

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

  let contentLayout = (
    <>
      <Sidebar />
      <Slider />
    </>
  );

  if (tvLayout === 'full-media') {
    contentLayout = <Slider />;
  } else if (tvLayout === 'agenda-focus') {
    contentLayout = (
      <>
        <Slider />
        <Sidebar />
      </>
    );
  } else if (tvLayout === 'tu') {
    // Tema TU hanya menampilkan Agenda/Kegiatan saja (Sidebar = Komponen Agenda)
    contentLayout = <Sidebar />;
  } else if (tvLayout === 'admin') {
    contentLayout = (
      <>
        <Sidebar />
        <Slider />
      </>
    );
  }

  return (
    <div className={`dashboard-container layout-${tvLayout}`}>
      <Header />
      <main className="main-content">
        {contentLayout}
      </main>
      <Footer />
    </div>
  );
}

export default TVDisplay;
