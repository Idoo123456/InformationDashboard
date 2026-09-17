import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { slides, slideDuration } = useDashboard();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, (slideDuration || 8) * 1000);
    return () => clearInterval(timer);
  }, [slides, slideDuration]);

  return (
    <section className="slider-section glass-panel">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ background: slide.bg }}
          >
            <div className="slide-content">
              <div className="slide-tag" style={slide.tagStyle}>{slide.tag}</div>
              <h2 className="slide-title" dangerouslySetInnerHTML={{ __html: slide.title }} />
              <p className="slide-desc">{slide.desc}</p>
              <button className="btn-primary" style={slide.btnStyle}>
                {slide.btnText} <ArrowRight size={18} />
              </button>
            </div>
            <div className="slide-qr">
              <img src={slide.qr} alt="QR Code" />
              <span>{slide.qrLabel}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* INDICATORS */}
      <div className="slider-indicators">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => {
              if(index === currentSlide) return;
              setIsAnimating(true);
              setTimeout(() => {
                setCurrentSlide(index);
                setIsAnimating(false);
              }, 500);
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Slider;
