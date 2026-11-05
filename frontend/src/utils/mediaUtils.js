/**
 * Utilitas untuk menangani, memvalidasi, dan mengonversi berbagai jenis URL media
 * (YouTube, Google Drive, Vimeo, Dropbox, Video langsung, dan Foto/Gambar).
 */

// Ekstrak URL jika pengguna tidak sengaja menempelkan kode <iframe ... src="...">
export const sanitizeMediaInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  
  // Deteksi jika pengguna menempelkan tag iframe penuh
  const iframeMatch = trimmed.match(/<iframe.*?src=["'](.*?)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }

  // Hapus tanda kutip di awal/akhir jika ada
  return trimmed.replace(/^["']|["']$/g, '').trim();
};

// Ekstrak ID YouTube dari berbagai macam format URL
export const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = sanitizeMediaInput(url);

  // Regex komprehensif untuk mendeteksi watch, embed, shorts, live, youtu.be, m.youtube, dll.
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = cleanUrl.match(regExp);
  return match && match[1] ? match[1] : null;
};

// Ekstrak ID Google Drive dari URL berbagi
export const getGoogleDriveId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = sanitizeMediaInput(url);

  // Cocokkan drive.google.com/file/d/ID
  const fileMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // Cocokkan id= parameter pada open, uc, atau thumbnail
  const idMatch = cleanUrl.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?(?:[^&]+&)*id=([a-zA-Z0-9_-]+)/i);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Cocokkan format lh3.googleusercontent.com/d/ID
  const lh3Match = cleanUrl.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  return null;
};

// Ekstrak ID Vimeo
export const getVimeoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = sanitizeMediaInput(url);

  const match = cleanUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|))(\d+)(?:$|\/|\?)/i);
  return match && match[3] ? match[3] : null;
};

// Cek apakah URL adalah berkas video langsung
export const isDirectVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = sanitizeMediaInput(url);
  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:video/')) return true;

  const path = cleanUrl.split('?')[0].toLowerCase();
  return /\.(mp4|webm|ogg|ogv|mov|m4v|mkv)$/i.test(path);
};

// Cek apakah URL adalah berkas gambar langsung
export const isDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = sanitizeMediaInput(url);
  if (cleanUrl.startsWith('data:image/')) return true;

  const path = cleanUrl.split('?')[0].toLowerCase();
  return /\.(jpg|jpeg|png|webp|gif|svg|bmp|avif|ico)$/i.test(path);
};

// Deteksi otomatis tipe media berdasarkan karakteristik URL
export const detectMediaType = (url) => {
  if (!url || typeof url !== 'string') return 'none';
  const cleanUrl = sanitizeMediaInput(url);
  if (!cleanUrl) return 'none';

  // 1. YouTube -> Video
  if (getYouTubeId(cleanUrl)) return 'video';

  // 2. Vimeo -> Video
  if (getVimeoId(cleanUrl)) return 'video';

  // 3. Direct video format
  if (isDirectVideoUrl(cleanUrl)) return 'video';

  // 4. Direct image format
  if (isDirectImageUrl(cleanUrl)) return 'image';

  // 5. Google Drive (default to image, but can be video)
  if (getGoogleDriveId(cleanUrl)) return 'image';

  // Default fallback jika tidak ada pola spesifik
  return 'image';
};

/**
 * Resolusi informasi media secara mendalam.
 * Menghasilkan objek siap-pakai untuk komponen TV dan Admin.
 */
export const resolveMediaInfo = (rawUrl, userMediaType = 'image') => {
  const cleanUrl = sanitizeMediaInput(rawUrl);
  if (!cleanUrl) {
    return {
      hasMedia: false,
      mediaType: 'none',
      url: '',
      provider: 'none'
    };
  }

  // 1. Periksa YouTube (YouTube selalu diproses sebagai video agar memutar pemutar secara otomatis)
  const ytId = getYouTubeId(cleanUrl);
  if (ytId) {
    const originParam = typeof window !== 'undefined' && window.location?.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
    return {
      hasMedia: true,
      mediaType: 'video',
      provider: 'youtube',
      id: ytId,
      url: cleanUrl,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1${originParam}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      thumbnailFallback: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      label: 'YouTube Video'
    };
  }

  // 2. Periksa Google Drive
  const driveId = getGoogleDriveId(cleanUrl);
  if (driveId) {
    return {
      hasMedia: true,
      mediaType: userMediaType === 'video' ? 'video' : 'image',
      provider: 'google-drive',
      id: driveId,
      url: cleanUrl,
      // URL preview Google Drive untuk video dalam iframe
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      // URL direct image / thumbnail resolusi tinggi Google Drive
      imageUrl: `https://drive.google.com/thumbnail?id=${driveId}&sz=w1920`,
      imageFallback: `https://lh3.googleusercontent.com/d/${driveId}`,
      label: 'Google Drive'
    };
  }

  // 3. Periksa Vimeo
  const vimeoId = getVimeoId(cleanUrl);
  if (vimeoId) {
    return {
      hasMedia: true,
      mediaType: 'video',
      provider: 'vimeo',
      id: vimeoId,
      url: cleanUrl,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&autopause=0`,
      label: 'Vimeo Video'
    };
  }

  // 4. Periksa Dropbox
  if (/dropbox\.com/i.test(cleanUrl)) {
    // Ubah ?dl=0 menjadi ?raw=1 agar dapat di-render langsung oleh browser
    let directDropbox = cleanUrl.replace(/[?&]dl=0/, '');
    directDropbox += directDropbox.includes('?') ? '&raw=1' : '?raw=1';
    const isVideo = isDirectVideoUrl(directDropbox) || userMediaType === 'video';
    return {
      hasMedia: true,
      mediaType: isVideo ? 'video' : 'image',
      provider: 'dropbox',
      url: directDropbox,
      isDirect: true,
      label: isVideo ? 'Dropbox Video' : 'Dropbox Foto'
    };
  }

  // 5. Berkas Video Langsung (MP4, WebM, dsb.)
  if (isDirectVideoUrl(cleanUrl) || userMediaType === 'video') {
    return {
      hasMedia: true,
      mediaType: 'video',
      provider: 'direct-video',
      url: cleanUrl,
      isDirect: true,
      label: 'Berkas Video'
    };
  }

  // 6. Berkas Gambar Langsung / URL Eksternal Lainnya
  return {
    hasMedia: true,
    mediaType: 'image',
    provider: 'direct-image',
    url: cleanUrl,
    imageUrl: cleanUrl,
    isDirect: true,
    label: 'Foto / Gambar'
  };
};
