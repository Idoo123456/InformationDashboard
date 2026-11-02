import React, { useState, useEffect } from 'react';
import { 
  Activity, Trash2, Plus, Save, Image as ImageIcon, MessageSquare, 
  Upload, ExternalLink, Video, CheckCircle2, Sparkles, HelpCircle,
  MoreVertical, Tv, CheckSquare, Square, Search, X, Check, Layers
} from 'lucide-react';
import { resolveMediaInfo, sanitizeMediaInput, detectMediaType } from '../../utils/mediaUtils';
import SlideMedia from '../display/SlideMedia';
import { showToastPopup } from '../../utils/adminAlerts';
import { useDashboard } from '../../context/DashboardContext';
import { DEFAULT_CAMPUS_TVS, fetchCampusTvDevices } from '../../utils/tvDevices';

export default function SlidesTab({
  localSlides,
  localSlideDuration,
  setLocalSlideDuration,
  selectedSlides,
  setSelectedSlides,
  availableTvs: propTvs,
  handleDeleteSelectedSlides,
  handleAddSlide,
  handleSaveSlides,
  deleteSlide,
  updateSlide,
  handleImageUpload,
  handleMediaUpload
}) {
  const { prefix, currentUser } = useDashboard();
  const currentFaculty = currentUser?.faculty_prefix || prefix || 'main';

  // State untuk daftar perangkat TV yang terdaftar di database - default ke daftar TV kampus (TV 1, 2, 3, 6, 8)
  const [availableTvs, setAvailableTvs] = useState(() => (propTvs && propTvs.length > 0 ? propTvs : DEFAULT_CAMPUS_TVS));
  
  // State untuk modal konfigurasi target TV
  const [targetModalSlide, setTargetModalSlide] = useState(null); // slide yang sedang diatur
  const [selectedTargetTvs, setSelectedTargetTvs] = useState([]); // array string/number id TV
  const [isAllTvMode, setIsAllTvMode] = useState(true);
  const [tvSearch, setTvSearch] = useState('');

  // Sinkronisasi data TV dari prop parent
  useEffect(() => {
    if (propTvs && propTvs.length > 0) {
      setAvailableTvs(propTvs);
    }
  }, [propTvs]);

  // Ambil daftar TV dari backend sesuai akun fakultas yang aktif
  useEffect(() => {
    fetchCampusTvDevices(currentFaculty).then(data => {
      if (Array.isArray(data) && data.length > 0) setAvailableTvs(data);
    });
  }, [currentFaculty]);

  // Buka modal Target TV untuk slide tertentu
  const handleOpenTargetModal = (slide) => {
    fetchCampusTvDevices(currentFaculty).then(data => {
      if (Array.isArray(data) && data.length > 0) setAvailableTvs(data);
    });
    setTargetModalSlide(slide);
    setTvSearch('');
    const currentTargets = slide.targetTvs || slide.target_tvs;
    if (!currentTargets || !Array.isArray(currentTargets) || currentTargets.length === 0 || currentTargets.includes('all')) {
      setIsAllTvMode(true);
      setSelectedTargetTvs([]);
    } else {
      setIsAllTvMode(false);
      setSelectedTargetTvs(currentTargets.map(t => String(t)));
    }
  };

  // Simpan Target TV untuk slide
  const handleSaveTargetTvs = () => {
    if (!targetModalSlide) return;
    const finalTargets = isAllTvMode ? [] : selectedTargetTvs;
    updateSlide(targetModalSlide.id, 'targetTvs', finalTargets);
    setTargetModalSlide(null);
    showToastPopup(`Target tayang slide berhasil disimpan! (Jangan lupa klik Publikasikan ke TV)`);
  };

  // Helper render badge target TV pada card slide
  const renderTargetBadge = (slide) => {
    const targets = slide.targetTvs || slide.target_tvs;
    const isGlobal = !targets || !Array.isArray(targets) || targets.length === 0 || targets.includes('all');

    if (isGlobal) {
      return (
        <button
          type="button"
          onClick={() => handleOpenTargetModal(slide)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '0.45rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Klik untuk mengubah target tampilan TV"
        >
          <Tv size={12} /> Tayang di: Semua TV (Global)
        </button>
      );
    }

    // Ambil nama atau ID TV yang dipilih
    const names = targets.map(t => {
      const found = availableTvs.find(dev => String(dev.id) === String(t) || String(dev.code) === String(t));
      return found ? (found.code ? found.code.toUpperCase() : `TV ${found.id}`) : `TV ${t}`;
    });

    return (
      <button
        type="button"
        onClick={() => handleOpenTargetModal(slide)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.6rem',
          borderRadius: '0.45rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
        title="Klik untuk mengubah target tampilan TV"
      >
        <Tv size={12} /> Tayang di: {names.join(', ')} ({targets.length} TV)
      </button>
    );
  };

  return (
    <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Manajemen Slide Konten</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Atur tampilan visual, durasi, serta tentukan target layar TV mana saja yang menayangkan setiap slide.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.5rem 0.75rem 0.5rem 1rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
             <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Activity size={16} color="#64748b" /> Durasi / Slide:
             </label>
             <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '0.2rem 0.4rem', gap: '0.25rem' }}>
               <input 
                  type="number" 
                  value={localSlideDuration} 
                  onChange={(e) => setLocalSlideDuration(Number(e.target.value))} 
                  min="1"
                  style={{ width: '40px', border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, color: '#3b82f6', textAlign: 'center', fontSize: '0.9rem', padding: 0 }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>dtk</span>
             </div>
          </div>

          <button onClick={handleDeleteSelectedSlides} disabled={selectedSlides.length === 0} style={{ padding: '0.7rem 1.25rem', background: selectedSlides.length > 0 ? '#fef2f2' : 'white', color: selectedSlides.length > 0 ? '#ef4444' : '#cbd5e1', border: `1px solid ${selectedSlides.length > 0 ? '#fecaca' : '#e2e8f0'}`, borderRadius: '0.65rem', cursor: selectedSlides.length > 0 ? 'pointer' : 'not-allowed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
            <Trash2 size={16} /> Hapus ({selectedSlides.length})
          </button>
          <button onClick={handleAddSlide} style={{ padding: '0.7rem 1.35rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '0.65rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Plus size={18} /> Tambah Slide
          </button>
          <button onClick={handleSaveSlides} style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.65rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Save size={18} /> Publikasikan ke TV
          </button>
        </div>
      </div>

      <div className="slide-grid">
        {localSlides.map((slide, index) => {
          const previewMediaInfo = resolveMediaInfo(slide.mediaUrl, slide.mediaType);
          const hasCustomTvTarget = slide.targetTvs && Array.isArray(slide.targetTvs) && slide.targetTvs.length > 0 && !slide.targetTvs.includes('all');

          return (
            <div key={slide.id} className="slide-card-admin">
              <div className="slide-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                  <input 
                    type="checkbox"
                    checked={selectedSlides.includes(slide.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedSlides(prev => [...prev, slide.id]);
                      else setSelectedSlides(prev => prev.filter(id => id !== slide.id));
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6', flexShrink: 0 }}
                  />
                  <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800, whiteSpace: 'nowrap' }}>Slide #{index + 1}</h4>
                  <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.25rem', background: slide.mediaType === 'video' ? '#fef08a' : slide.mediaType === 'image' ? '#dcfce7' : '#e0e7ff', color: slide.mediaType === 'video' ? '#854d0e' : slide.mediaType === 'image' ? '#166534' : '#3730a3', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
                    {slide.mediaType === 'none' ? 'Teks & Warna' : slide.mediaType}
                  </span>
                </div>

                {/* ACTION BUTTONS: TITIK 3 (TARGET TV) & TOMBOL HAPUS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  {/* TOMBOL TITIK 3 (MORE OPTIONS: TARGET TV) */}
                  <button
                    type="button"
                    onClick={() => handleOpenTargetModal(slide)}
                    style={{
                      background: hasCustomTvTarget ? '#eff6ff' : 'transparent',
                      border: hasCustomTvTarget ? '1px solid #bfdbfe' : 'none',
                      color: hasCustomTvTarget ? '#2563eb' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.4rem',
                      borderRadius: '0.4rem',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = hasCustomTvTarget ? '#2563eb' : '#64748b';
                      e.currentTarget.style.background = hasCustomTvTarget ? '#eff6ff' : 'transparent';
                    }}
                    title="Pilih Target Display TV (Titik 3 Opsi)"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* TOMBOL HAPUS SLIDE */}
                  <button 
                    onClick={() => deleteSlide(slide.id)} 
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', borderRadius: '0.35rem', transition: 'all 0.2s' }} 
                    onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }} 
                    onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }} 
                    title="Hapus Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* INDIKATOR TARGET TV */}
              <div style={{ padding: '0.4rem 1.25rem 0.6rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Target Layar:</span>
                  {renderTargetBadge(slide)}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenTargetModal(slide)}
                  style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Ubah TV
                </button>
              </div>

              <div className="slide-card-body">
                {/* Konten Teks */}
                <div className="slide-section">
                  <div className="slide-section-title"><MessageSquare size={14} /> KONTEN TEKS</div>
                  <div className="form-group">
                    <label>Label Tag (Contoh: PENGUMUMAN)</label>
                    <input type="text" value={slide.tag} onChange={(e) => updateSlide(slide.id, 'tag', e.target.value)} className="admin-input" style={{ background: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label>Judul Utama</label>
                    <textarea value={typeof slide.title === 'string' ? slide.title : slide.title?.props?.children?.join('') || 'Judul'} onChange={(e) => updateSlide(slide.id, 'title', e.target.value)} className="admin-input" rows="2" style={{ background: 'white', minHeight: '60px', resize: 'vertical' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Deskripsi Tambahan</label>
                    <textarea value={slide.desc !== undefined ? slide.desc : (slide.description || '')} onChange={(e) => updateSlide(slide.id, 'desc', e.target.value)} className="admin-input" rows="3" style={{ background: 'white', minHeight: '80px', resize: 'vertical' }} />
                  </div>
                </div>

                {/* Konten Media */}
                <div className="slide-section">
                  <div className="slide-section-title"><ImageIcon size={14} /> MEDIA & LATAR BELAKANG</div>
                  
                  <div className="form-group">
                    <label>Tipe Latar Belakang</label>
                    <select 
                      value={slide.mediaType || 'none'} 
                      onChange={(e) => updateSlide(slide.id, 'mediaType', e.target.value)} 
                      className="admin-input" 
                      style={{ background: 'white', fontWeight: 600, color: '#3b82f6' }}
                    >
                      <option value="none">Hanya Warna / Gradien</option>
                      <option value="image">Gambar / Foto (URL Web, Google Drive, File JPG/PNG)</option>
                      <option value="video">Video (YouTube, Google Drive, Vimeo, File MP4/WebM)</option>
                    </select>
                  </div>

                  {slide.mediaType !== 'none' && (
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <label style={{ margin: 0 }}>
                            {slide.mediaType === 'video' ? 'URL Video' : 'URL Gambar / Flyer'}
                          </label>
                          {slide.mediaUrl && (
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <CheckCircle2 size={12} /> {previewMediaInfo?.provider || 'Media Terhubung'}
                            </span>
                          )}
                        </div>
                        <input 
                          type="text" 
                          placeholder={slide.mediaType === 'video' ? "Tempel URL YouTube, Google Drive, atau link .mp4" : "Tempel URL Web gambar atau Google Drive"} 
                          value={slide.mediaUrl || ''} 
                          onChange={(e) => updateSlide(slide.id, 'mediaUrl', e.target.value)} 
                          className="admin-input" 
                          style={{ background: 'white' }} 
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <label className="admin-btn-secondary" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '1px dashed #cbd5e1' }}>
                          <Upload size={14} /> {slide.mediaType === 'video' ? 'Unggah Video Lokal (.mp4, .webm)' : 'Unggah File Gambar'}
                          <input 
                            type="file" 
                            accept={slide.mediaType === 'video' ? "video/mp4,video/webm" : "image/*"} 
                            onChange={(e) => handleMediaUpload(slide.id, e.target.files[0])} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      </div>

                      {/* Preview Media Box */}
                      {slide.mediaUrl && (
                        <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '0.4rem', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#000' }}>
                          <SlideMedia 
                            slide={slide}
                            mediaUrl={slide.mediaUrl} 
                            mediaType={slide.mediaType} 
                            mediaFit={slide.mediaFit || 'cover'}
                            title={slide.title}
                            isPreview={true}
                          />
                        </div>
                      )}

                      {/* Opsi Media Layar Penuh */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <input 
                          type="checkbox" 
                          id={`media_only_${slide.id}`} 
                          checked={Boolean(slide.isMediaOnly)} 
                          onChange={(e) => updateSlide(slide.id, 'isMediaOnly', e.target.checked)} 
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
                        />
                        <label htmlFor={`media_only_${slide.id}`} style={{ margin: 0, fontSize: '0.8rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                          Sembunyikan kartu teks (Tampilkan media layar penuh 100%)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Pilihan Warna / Gradien Latar Belakang */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Kode Warna / Gradien CSS Latar Belakang</label>
                    <input type="text" value={slide.bg || slide.bgColor || ''} onChange={(e) => updateSlide(slide.id, 'bg', e.target.value)} className="admin-input" style={{ background: 'white', fontFamily: 'monospace' }} />
                  </div>
                </div>

                {/* Konten Tombol Aksi & QR */}
                <div className="slide-section" style={{ borderBottom: 'none' }}>
                  <div className="slide-section-title"><Sparkles size={14} /> TOMBOL AKSI & KODE QR</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Teks Tombol (Opsional)</label>
                      <input type="text" placeholder="Contoh: Info Lengkap" value={slide.btnText || ''} onChange={(e) => updateSlide(slide.id, 'btnText', e.target.value)} className="admin-input" style={{ background: 'white' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Tautan Tombol</label>
                      <input type="text" placeholder="https://unri.ac.id" value={slide.btnLink || ''} onChange={(e) => updateSlide(slide.id, 'btnLink', e.target.value)} className="admin-input" style={{ background: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>URL Kode QR (Untuk discan pengunjung)</label>
                    <input type="text" placeholder="https://api.qrserver.com/... atau URL tautan" value={slide.qr !== undefined ? slide.qr : (slide.qrUrl || '')} onChange={(e) => updateSlide(slide.id, 'qr', e.target.value)} className="admin-input" style={{ background: 'white' }} />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div style={{ marginTop: '2.5rem', padding: '1.25rem 1.5rem', background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Total: <strong style={{ color: '#0f172a' }}>{localSlides.length} Slide</strong> aktif di daftar tayang.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleAddSlide}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s'
            }}
          >
            <Plus size={16} /> Tambah Slide Baru
          </button>
          <button
            onClick={handleSaveSlides}
            style={{
              padding: '0.65rem 1.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Save size={16} /> Publikasikan ke TV
          </button>
        </div>
      </div>

      {/* MODAL TARGET DISPLAY TV (TITIK 3 FITUR) */}
      {targetModalSlide && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '0.65rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tv size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Target Display TV — Slide #{localSlides.findIndex(s => s.id === targetModalSlide.id) + 1}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Tentukan pada layar TV mana saja slide ini akan ditayangkan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTargetModalSlide(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '0.35rem' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Ringkasan Slide */}
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.65rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '36px', borderRadius: '4px', background: targetModalSlide.bg || '#2563eb' }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {targetModalSlide.tag || 'Slide Informasi'}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {typeof targetModalSlide.title === 'string' ? targetModalSlide.title : 'Judul Slide'}
                  </div>
                </div>
              </div>

              {/* Mode Pemilihan: Semua TV vs TV Tertentu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Pilihan Jangkauan Tampilan:
                </label>

                {/* Option 1: Semua TV */}
                <div
                  onClick={() => setIsAllTvMode(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.65rem',
                    border: `2px solid ${isAllTvMode ? '#2563eb' : '#e2e8f0'}`,
                    background: isAllTvMode ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <input
                    type="radio"
                    name="tv_target_mode"
                    checked={isAllTvMode}
                    onChange={() => setIsAllTvMode(true)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isAllTvMode ? '#1e40af' : '#1e293b' }}>
                      🌐 Tampilkan di Seluruh Layar TV (Global)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isAllTvMode ? '#3b82f6' : '#64748b' }}>
                      Slide ini akan otomatis tayang di setiap layar TV kampus tanpa batasan (default).
                    </div>
                  </div>
                </div>

                {/* Option 2: TV Tertentu */}
                <div
                  onClick={() => setIsAllTvMode(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.65rem',
                    border: `2px solid ${!isAllTvMode ? '#2563eb' : '#e2e8f0'}`,
                    background: !isAllTvMode ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <input
                    type="radio"
                    name="tv_target_mode"
                    checked={!isAllTvMode}
                    onChange={() => setIsAllTvMode(false)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: !isAllTvMode ? '#1e40af' : '#1e293b' }}>
                      🎯 Tampilkan Hanya di TV Tertentu (Contoh: TV 3, TV 6, TV 8)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: !isAllTvMode ? '#3b82f6' : '#64748b' }}>
                      Pilih satu atau beberapa TV khusus untuk menayangkan slide ini.
                    </div>
                  </div>
                </div>
              </div>

              {/* LIST TV CHECKBOXES (Hanya muncul jika mode TV Tertentu dipilih) */}
              {!isAllTvMode && (
                <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      Pilih Layar TV Target:
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetTvs(availableTvs.map(t => String(t.id)))}
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.35rem', color: '#2563eb', cursor: 'pointer' }}
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetTvs([])}
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.35rem', color: '#64748b', cursor: 'pointer' }}
                      >
                        Hapus Pilihan
                      </button>
                    </div>
                  </div>

                  {/* List TV Cards */}
                  <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#fafbfc' }}>
                    {availableTvs.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Belum ada data TV di sistem. Silakan tambahkan TV di menu 'Kelola Perangkat TV'.
                      </div>
                    ) : (
                      availableTvs.map(dev => {
                        const devIdStr = String(dev.id);
                        const isChecked = selectedTargetTvs.includes(devIdStr) || selectedTargetTvs.includes(dev.code);

                        return (
                          <label
                            key={dev.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '0.5rem',
                              background: isChecked ? 'white' : '#f8fafc',
                              border: `1px solid ${isChecked ? '#3b82f6' : '#e2e8f0'}`,
                              cursor: 'pointer',
                              boxShadow: isChecked ? '0 2px 4px rgba(59,130,246,0.1)' : 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTargetTvs(prev => [...prev.filter(id => id !== devIdStr && id !== dev.code), devIdStr]);
                                  } else {
                                    setSelectedTargetTvs(prev => prev.filter(id => id !== devIdStr && id !== dev.code));
                                  }
                                }}
                                style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#2563eb' }}
                              />
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                  {dev.name}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                  {dev.location || 'Lokasi umum'} • <span style={{ fontWeight: 600 }}>Kode: {dev.code}</span>
                                </div>
                              </div>
                            </div>

                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '0.35rem', background: '#eff6ff', color: '#1d4ed8' }}>
                              #{dev.id}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* Summary Pemilihan */}
                  <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '0.55rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    {selectedTargetTvs.length === 0 ? (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Belum ada TV yang dipilih. Silakan centang minimal 1 TV atau pilih opsi 'Semua TV'.</span>
                    ) : (
                      <span>
                        ✅ Dipilih <strong>{selectedTargetTvs.length} dari {availableTvs.length} TV</strong>: {' '}
                        {selectedTargetTvs.map(t => {
                          const f = availableTvs.find(d => String(d.id) === String(t) || String(d.code) === String(t));
                          return f ? f.name : `TV #${t}`;
                        }).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#fafbfc' }}>
              <button
                type="button"
                onClick={() => setTargetModalSlide(null)}
                style={{ padding: '0.6rem 1.2rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.55rem', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTargetTvs}
                style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', borderRadius: '0.55rem', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
              >
                Terapkan Target TV
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
