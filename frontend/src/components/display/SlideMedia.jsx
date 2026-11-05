import { useState, useEffect, useRef } from 'react';
import { resolveMediaInfo } from '../../utils/mediaUtils';
import { AlertCircle, Volume2, VolumeX } from 'lucide-react';

export default function SlideMedia({ slide, isActive = true, blobUrl = '', isPreview = false, mediaUrl, mediaType, mediaFit, title }) {
  const effectiveSlide = slide || { mediaUrl, mediaType, mediaFit, title };
  const finalRawUrl = blobUrl || effectiveSlide?.mediaUrl || mediaUrl || '';
  const resolvedMediaType = effectiveSlide?.mediaType || mediaType || 'image';
  const mediaInfo = resolveMediaInfo(finalRawUrl, resolvedMediaType);
  const [imgSrc, setImgSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  const [retryStage, setRetryStage] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  // Inisialisasi sumber gambar awal
  useEffect(() => {
    setHasError(false);
    setRetryStage(0);
    setIsVideoLoaded(false);

    if (mediaInfo.provider === 'youtube') {
      setImgSrc(mediaInfo.thumbnailUrl);
    } else if (mediaInfo.provider === 'google-drive' && mediaInfo.mediaType === 'image') {
      setImgSrc(mediaInfo.imageUrl);
    } else {
      setImgSrc(mediaInfo.imageUrl || mediaInfo.url || '');
    }
  }, [finalRawUrl, resolvedMediaType, mediaInfo.provider, mediaInfo.mediaType]);

  // Fungsi pengirim perintah postMessage ke iframe YouTube
  const sendYouTubeCommand = (func, args = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (_) {}
    }
  };

  // Kontrol playback YouTube saat slide aktif/tidak aktif
  useEffect(() => {
    if (mediaInfo.provider !== 'youtube') return;

    if (isActive || isPreview) {
      sendYouTubeCommand('mute');
      sendYouTubeCommand('playVideo');
    } else {
      sendYouTubeCommand('pauseVideo');
    }
  }, [isActive, isPreview, isVideoLoaded, mediaInfo.provider]);

  // Manajemen pemutaran video langsung (play saat aktif, pause saat tidak aktif)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive || isPreview) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isActive, isPreview, isMuted]);

  if (!mediaInfo.hasMedia) return null;

  const objectFitCss = slide.mediaFit === 'fill' ? 'fill' : (slide.mediaFit === 'contain' ? 'contain' : 'cover');

  // Fallback onError bertingkat untuk gambar
  const handleImageError = () => {
    if (mediaInfo.provider === 'youtube' && retryStage === 0 && mediaInfo.thumbnailFallback) {
      setRetryStage(1);
      setImgSrc(mediaInfo.thumbnailFallback);
      return;
    }
    if (mediaInfo.provider === 'google-drive' && retryStage === 0 && mediaInfo.imageFallback) {
      setRetryStage(1);
      setImgSrc(mediaInfo.imageFallback);
      return;
    }
    setHasError(true);
  };

  // 1. TAMPILAN YOUTUBE VIDEO (Otomatis diputar tanpa tombol play manual)
  if (mediaInfo.provider === 'youtube') {
    return (
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
          backgroundColor: '#000000'
        }}
      >
        {/* Placeholder thumbnail hanya tampil sesaat selama video pertama kali buffering */}
        {!isVideoLoaded && (
          <img
            src={mediaInfo.thumbnailUrl}
            onError={(e) => {
              if (mediaInfo.thumbnailFallback) e.currentTarget.src = mediaInfo.thumbnailFallback;
            }}
            alt="Memuat Video..."
            referrerPolicy="no-referrer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: objectFitCss,
              zIndex: 1,
              transition: 'opacity 0.3s ease'
            }}
          />
        )}

        {/* Iframe YouTube Pemutar Aktif */}
        <iframe
          ref={iframeRef}
          src={mediaInfo.embedUrl}
          title={typeof slide.title === 'string' ? slide.title : 'YouTube Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => {
            // Berikan jeda sejenak untuk buffering lalu paksa play & sembunyikan thumbnail
            setTimeout(() => {
              sendYouTubeCommand('mute');
              sendYouTubeCommand('playVideo');
              setIsVideoLoaded(true);
            }, 600);
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: slide.mediaFit === 'contain' ? '100%' : '115%',
            height: slide.mediaFit === 'contain' ? '100%' : '115%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            pointerEvents: slide.isMediaOnly ? 'auto' : 'none',
            zIndex: 2
          }}
        />
      </div>
    );
  }

  // 2. TAMPILAN GOOGLE DRIVE VIDEO
  if (mediaInfo.provider === 'google-drive' && mediaInfo.mediaType === 'video') {
    return (
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
          backgroundColor: '#000000'
        }}
      >
        <iframe
          src={mediaInfo.embedUrl}
          title="Google Drive Video"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: slide.isMediaOnly ? 'auto' : 'none',
            zIndex: 2
          }}
        />
      </div>
    );
  }

  // 3. TAMPILAN VIMEO VIDEO
  if (mediaInfo.provider === 'vimeo' && mediaInfo.mediaType === 'video') {
    return (
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
          backgroundColor: '#000000'
        }}
      >
        <iframe
          src={mediaInfo.embedUrl}
          title="Vimeo Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: slide.mediaFit === 'contain' ? '100%' : '110%',
            height: slide.mediaFit === 'contain' ? '100%' : '110%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />
      </div>
    );
  }

  // 4. TAMPILAN VIDEO BERKAS LANGSUNG (MP4, WebM, Blob lokal)
  if (mediaInfo.mediaType === 'video') {
    return (
      <video
        ref={videoRef}
        src={mediaInfo.url}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onLoadedMetadata={(e) => {
          e.target.muted = isMuted;
          if (isActive || isPreview) {
            e.target.play().catch(() => {});
          }
        }}
        onError={() => setHasError(true)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: objectFitCss,
          zIndex: 0,
          backgroundColor: '#000000'
        }}
      />
    );
  }

  // 5. TAMPILAN GAMBAR / FOTO (Direct Image, Google Drive Image)
  if (hasError) {
    if (isPreview) {
      return (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            textAlign: 'center', 
            fontSize: '0.8rem' 
          }}
        >
          <AlertCircle size={24} style={{ marginBottom: '0.25rem' }} />
          <span>Gambar tidak dapat dimuat dari tautan ini.</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Pastikan tautan bersifat publik dan bukan proteksi login.</span>
        </div>
      );
    }
    // Fallback ramah di TV agar layar tidak blank hitam polos
    return (
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.55)',
          color: 'rgba(255, 255, 255, 0.75)',
          textAlign: 'center',
          padding: '2rem',
          zIndex: 1
        }}
      >
        <AlertCircle size={36} style={{ marginBottom: '0.5rem', color: '#f59e0b' }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Gambar Tidak Dapat Dimuat</span>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
          Pastikan file terunggah di server atau tautan gambar bersifat publik.
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={typeof slide.title === 'string' ? slide.title : 'Slide Image'}
      referrerPolicy="no-referrer"
      onError={handleImageError}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: objectFitCss,
        objectPosition: 'center',
        zIndex: 0
      }}
    />
  );
}
