import { useState, useEffect } from 'react';
import { ArrowRight, Smartphone, Sparkles, Globe, ImageOff } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import localforage from 'localforage';

// Helper to determine if a color string is visually light (needs dark text)
const isLightBackground = (bg) => {
  if (!bg || typeof bg !== 'string') return false;
  const lower = bg.toLowerCase().trim();
  if (lower === '#fff' || lower === '#ffffff' || lower === 'white') return true;
  if (lower.startsWith('#')) {
    let hex = lower.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.65;
      }
    }
  }
  return false;
};

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { slides: rawSlides, slideDuration, isDbConnected } = useDashboard();
  const slides = Array.isArray(rawSlides) ? rawSlides : [];
  const [blobUrls, setBlobUrls] = useState({});

  const activeIndex = Math.min(Math.max(0, Number.isFinite(currentSlide) ? currentSlide : 0), (slides.length || 1) - 1);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const durationSec = Math.max(3, Number(slideDuration) || 8);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (Number.isFinite(prev) ? (prev + 1) % slides.length : 0));
    }, durationSec * 1000);
    return () => clearInterval(timer);
  }, [slides.length, slideDuration]);

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
    return slide.mediaUrl || '';
  };

  const getQrUrl = (slide) => {
    let qr = slide.qr !== undefined ? slide.qr : (slide.qrUrl || '');
    if (typeof qr === 'string' && qr.includes('api.qrserver.com')) {
      if (qr.includes('size=150x150')) {
        qr = qr.replace('size=150x150', 'size=350x350');
      } else if (qr.includes('size=300x300')) {
        qr = qr.replace('size=300x300', 'size=350x350');
      }
    }
    return qr;
  };

  const getQrDestination = (slide) => {
    const qr = slide.qr !== undefined ? slide.qr : (slide.qrUrl || '');
    if (!qr || typeof qr !== 'string') return null;
    try {
      if (qr.includes('data=')) {
        const match = qr.match(/[?&]data=([^&]+)/);
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1]);
          return decoded.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        }
      }
      if (qr.startsWith('http://') || qr.startsWith('https://')) {
        return qr.replace(/^https?:\/\//i, '').replace(/\/$/, '');
      }
    } catch {
      // ignore
    }
    return null;
  };

  if (!slides || slides.length === 0) {
    return (
      <section className="slider-section glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <ImageOff size={42} style={{ color: '#cbd5e1' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#475569' }}>Tidak Ada Slide Aktif</h4>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
              {isDbConnected ? 'Belum ada data banner informasi pada database.' : 'Database offline — Menunggu koneksi MySQL...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="slider-section glass-panel">
      <div className="slider-container">
        {slides.map((slide, index) => {
          const finalUrl = getFinalMediaUrl(slide);
          
          // Background resolution:
          // Fallback if empty, pure white, or missing
          const rawBg = slide.bg || slide.bgColor || '';
          const isWhiteOrEmpty = !rawBg || rawBg.trim() === '' || rawBg.toLowerCase() === '#fff' || rawBg.toLowerCase() === '#ffffff' || rawBg.toLowerCase() === 'white';
          
          const fallbackGradients = [
            'linear-gradient(135deg, #1c7947 0%, #2a9d5c 100%)', // UNRI Green
            'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // UNRI Blue
            'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)', // Purple
            'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)'  // Teal
          ];
          const defaultGrad = fallbackGradients[index % fallbackGradients.length];
          const slideBg = isWhiteOrEmpty ? defaultGrad : rawBg;

          const isLight = isLightBackground(slideBg);
          const textColor = isLight ? '#0f172a' : '#ffffff';
          const textMutedColor = isLight ? '#334155' : 'rgba(255, 255, 255, 0.9)';

          const slideDesc = slide.desc !== undefined ? slide.desc : (slide.description || '');
          const qrSrc = getQrUrl(slide);
          const qrDest = getQrDestination(slide);
          const hasMedia = (slide.mediaType === 'image' || slide.mediaType === 'video') && Boolean(finalUrl);
          const isMediaOnly = Boolean(slide.isMediaOnly && hasMedia);

          return (
            <div 
              key={slide.id ? `slide-${slide.id}-${index}` : `slide-${index}`}
              className={`slide ${index === activeIndex ? 'active' : ''} ${isLight ? 'slide-light' : 'slide-dark'}`}
              style={{ 
                background: slideBg,
                color: textColor,
                ...(slide.mediaType === 'image' && finalUrl ? {
                  backgroundImage: `url(${finalUrl})`,
                  backgroundPosition: 'center',
                  backgroundSize: slide.mediaFit === 'fill' ? '100% 100%' : (slide.mediaFit || 'cover'),
                  backgroundRepeat: 'no-repeat'
                } : {})
              }}
            >
              {/* Subtle ambient lighting & mesh texture for modern depth */}
              <div className="slide-ambient-overlay" aria-hidden="true">
                <div className="slide-ambient-orb orb-1" />
                <div className="slide-ambient-orb orb-2" />
                <div className="slide-ambient-orb orb-3" />
                <div className="slide-ambient-mesh" />
              </div>

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
              {hasMedia && !isMediaOnly && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1 }} />
              )}

              {!isMediaOnly && (
                <div className="slide-content" style={{ position: 'relative', zIndex: 2 }}>
                  {slide.tag && (
                    <div className="slide-top-meta">
                      <div 
                        className="slide-tag" 
                        style={slide.tagStyle || { 
                          background: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255,255,255,0.2)', 
                          color: textColor,
                          borderColor: isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255,255,255,0.3)'
                        }}
                      >
                        <span className="slide-tag-dot" />
                        <Sparkles size={13} style={{ marginRight: '6px' }} />
                        {slide.tag}
                      </div>
                    </div>
                  )}

                  {slide.title && (
                    <h2 
                      className="slide-title" 
                      style={{ color: textColor }}
                      dangerouslySetInnerHTML={{ __html: typeof slide.title === 'string' ? slide.title : String(slide.title) }} 
                    />
                  )}
                  {slideDesc && (
                    <p className="slide-desc" style={{ color: textMutedColor }}>
                      {slideDesc}
                    </p>
                  )}
                  {slide.btnText && (
                    <div className="slide-btn-wrapper">
                      <button 
                        className="btn-primary" 
                        style={{ 
                          ...(slide.btnStyle || { 
                            background: isLight ? '#1e40af' : 'white', 
                            color: isLight ? 'white' : '#1e40af' 
                          }), 
                          pointerEvents: 'none' 
                        }}
                      >
                        <span>{slide.btnText}</span> <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {!isMediaOnly && qrSrc && (
                <div 
                  className="slide-qr-card" 
                  style={{ 
                    position: 'relative', 
                    zIndex: 2,
                    border: isLight ? '1px solid rgba(15, 23, 42, 0.12)' : '1px solid rgba(255, 255, 255, 0.65)'
                  }}
                >
                  <div className="qr-badge-header">
                    <span className="qr-radar-dot" />
                    <Smartphone size={13} className="qr-badge-icon" />
                    <span>PINDAI DENGAN KAMERA HP</span>
                  </div>

                  <div className="qr-image-wrapper">
                    <span className="qr-corner qr-corner-tl" />
                    <span className="qr-corner qr-corner-tr" />
                    <span className="qr-corner qr-corner-bl" />
                    <span className="qr-corner qr-corner-br" />
                    <div className="qr-scan-beam" />
                    <img 
                      src={qrSrc} 
                      alt="QR Code" 
                      className="qr-code-img"
                      style={{ 
                        width: slide.qrSize ? `${slide.qrSize}px` : undefined, 
                        height: slide.qrSize ? `${slide.qrSize}px` : undefined, 
                        objectFit: slide.qrFit || 'contain' 
                      }} 
                    />
                  </div>

                  <div className="qr-footer-info">
                    <span className="qr-main-label">{slide.qrLabel || 'Scan QR Code'}</span>
                    <span className="qr-sub-label">Arahkan kamera smartphone Anda</span>
                    {qrDest && (
                      <div className="qr-destination-pill" title={`Tautan langsung: ${qrDest}`}>
                        <Globe size={11} className="qr-dest-icon" />
                        <span>{qrDest}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* INDICATORS / PROGRESS */}
      {slides.length > 1 && (
        <div className="slider-dots slider-indicators">
          {slides.map((_, index) => (
            <button 
              type="button"
              key={index} 
              className={`dot indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              title={`Slide ${index + 1}`}
              aria-label={`Pindah ke Slide ${index + 1}`}
            >
              {index === activeIndex && (
                <span 
                  key={`progress-${activeIndex}`}
                  className="indicator-progress" 
                  style={{ animationDuration: `${Math.max(3, Number(slideDuration) || 8)}s` }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default Slider;
