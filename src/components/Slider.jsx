import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import localforage from 'localforage';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { slides, slideDuration } = useDashboard();
  const [blobUrls, setBlobUrls] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, (slideDuration || 8) * 1000);
    return () => clearInterval(timer);
  }, [slides, slideDuration]);

  // Load local blobs if mediaUrl starts with 'localforage:'
  useEffect(() => {
    let activeBlobs = [];
    const loadBlobs = async () => {
      const newBlobUrls = {};
      for (const slide of slides) {
        if (slide.mediaUrl?.startsWith('localforage:')) {
          const key = slide.mediaUrl.split(':')[1];
          try {
            const file = await localforage.getItem(key);
            if (file) {
              const url = URL.createObjectURL(file);
              newBlobUrls[slide.id] = url;
              activeBlobs.push(url);
            }
          } catch (e) {
            console.error("Error loading blob for slide", slide.id, e);
          }
        }
      }
      setBlobUrls(newBlobUrls);
    };
    loadBlobs();
    return () => {
      activeBlobs.forEach(url => URL.revokeObjectURL(url));
    };
  }, [slides]);

  const getFinalMediaUrl = (slide) => {
    if (slide.mediaUrl?.startsWith('localforage:')) {
      return blobUrls[slide.id] || '';
    }
    return slide.mediaUrl;
  };

  return (
    <section className="slider-section glass-panel">
      <div className="slider-container">
        {slides.map((slide, index) => {
          const finalUrl = getFinalMediaUrl(slide);
          return (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ 
              background: slide.bg,
              ...(slide.mediaType === 'image' && finalUrl ? {
                backgroundImage: `url(${finalUrl})`,
                backgroundPosition: 'center',
                backgroundSize: slide.mediaFit === 'fill' ? '100% 100%' : (slide.mediaFit || 'cover'),
                backgroundRepeat: 'no-repeat'
              } : {})
            }}
          >
            {slide.mediaType === 'video' && finalUrl && (
              <video 
                src={finalUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: slide.mediaFit || 'cover',
                  zIndex: 0
                }}
              />
            )}
            
            {/* Dark overlay for readability if it has media and is not media-only */}
            {(slide.mediaType === 'image' || slide.mediaType === 'video') && finalUrl && !slide.isMediaOnly && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1 }} />
            )}

            {!slide.isMediaOnly && (
              <div className="slide-content" style={{ position: 'relative', zIndex: 2 }}>
                {slide.tag && <div className="slide-tag" style={slide.tagStyle}>{slide.tag}</div>}
                {slide.title && <h2 className="slide-title" dangerouslySetInnerHTML={{ __html: slide.title }} />}
                {slide.desc && <p className="slide-desc">{slide.desc}</p>}
                {slide.btnText && (
                  <button className="btn-primary" style={slide.btnStyle}>
                    {slide.btnText} <ArrowRight size={18} />
                  </button>
                )}
              </div>
            )}
            
            {!slide.isMediaOnly && slide.qr && (
              <div className="slide-qr" style={{ position: 'relative', zIndex: 2 }}>
                <img 
                  src={slide.qr} 
                  alt="QR Code" 
                  style={{ 
                    width: slide.qrSize ? `${slide.qrSize}px` : '240px', 
                    height: slide.qrSize ? `${slide.qrSize}px` : '240px', 
                    objectFit: slide.qrFit || 'cover' 
                  }} 
                />
                <span>{slide.qrLabel}</span>
              </div>
            )}
          </div>
        )})}
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
