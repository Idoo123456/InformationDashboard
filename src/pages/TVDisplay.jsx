import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Slider from '../components/Slider';
import Footer from '../components/Footer';

function TVDisplay() {
  return (
    <div className="dashboard-container">
      <Header />
      <main className="main-content">
        <Sidebar />
        <Slider />
      </main>
      <Footer />
    </div>
  );
}

export default TVDisplay;
