import { Activity, Trash2, Plus, Save, Image as ImageIcon, MessageSquare, Upload } from 'lucide-react';

export default function SlidesTab({
  localSlides,
  localSlideDuration,
  setLocalSlideDuration,
  selectedSlides,
  setSelectedSlides,
  handleDeleteSelectedSlides,
  handleAddSlide,
  handleSaveSlides,
  deleteSlide,
  updateSlide,
  handleImageUpload,
  handleMediaUpload
}) {
  return (
    <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Manajemen Slide Konten</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Atur tampilan gambar, video, dan pesan utama di layar TV Anda.</p>
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
        {localSlides.map((slide, index) => (
          <div key={slide.id} className="slide-card-admin">
            <div className="slide-card-header">
              <input 
                type="checkbox"
                checked={selectedSlides.includes(slide.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedSlides(prev => [...prev, slide.id]);
                  else setSelectedSlides(prev => prev.filter(id => id !== slide.id));
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>Slide #{index + 1}</h4>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.25rem', background: slide.mediaType === 'video' ? '#fef08a' : slide.mediaType === 'image' ? '#dcfce7' : '#e0e7ff', color: slide.mediaType === 'video' ? '#854d0e' : slide.mediaType === 'image' ? '#166534' : '#3730a3', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {slide.mediaType === 'none' ? 'Teks & Warna' : slide.mediaType}
                </span>
              </div>
              <button onClick={() => deleteSlide(slide.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', borderRadius: '0.35rem', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2';}} onMouseOut={e => {e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent';}} title="Hapus Slide">
                <Trash2 size={16} />
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
                    <option value="image">Gambar (JPG/PNG)</option>
                    <option value="video">Video Latar (MP4/WebM)</option>
                  </select>
                </div>

                {slide.mediaType !== 'none' && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#334155', fontWeight: 600, margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={slide.isMediaOnly || false} 
                        onChange={(e) => updateSlide(slide.id, 'isMediaOnly', e.target.checked)} 
                        style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                      />
                      Mode Full-Screen Media (Sembunyikan Teks)
                    </label>
                  </div>
                )}

                {slide.mediaType === 'none' ? (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Pilih Warna Latar</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <input 
                        type="color" 
                        value={(slide.bg || slide.bgColor || '#1e40af').startsWith('#') ? (slide.bg || slide.bgColor || '#1e40af').slice(0, 7) : '#1e40af'} 
                        onChange={(e) => updateSlide(slide.id, 'bg', e.target.value)} 
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', padding: 0 }}
                      />
                      <input 
                        type="text" 
                        value={slide.bg || slide.bgColor || '#1e40af'} 
                        onChange={(e) => updateSlide(slide.id, 'bg', e.target.value)} 
                        className="admin-input" 
                        style={{ border: 'none', boxShadow: 'none', background: 'transparent' }} 
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Upload File Media</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          value={slide.mediaUrl?.startsWith('localforage:') ? '[File tersimpan secara lokal]' : (slide.mediaUrl || '')} 
                          onChange={(e) => updateSlide(slide.id, 'mediaUrl', e.target.value)} 
                          className="admin-input" 
                          style={{ background: 'white', flex: 1, fontSize: '0.8rem' }}
                          placeholder="Link URL gambar/video..." 
                        />
                        <label style={{ cursor: 'pointer', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', background: '#3b82f6', color: 'white', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#2563eb'} onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}>
                          <Upload size={16} /> Browse
                          <input 
                            type="file" 
                            accept={slide.mediaType === 'video' ? 'video/*' : 'image/*'} 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleMediaUpload(slide.id, e.target.files[0])} 
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Mode Tampilan Media</label>
                      <select 
                        value={slide.mediaFit || 'cover'} 
                        onChange={(e) => updateSlide(slide.id, 'mediaFit', e.target.value)} 
                        className="admin-input" 
                        style={{ background: 'white' }}
                      >
                        <option value="cover">Penuhi Layar (Cover)</option>
                        <option value="contain">Ukuran Asli (Contain)</option>
                        <option value="fill">Tarik Penuh (Fill)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* QR Code */}
              <div className="slide-section" style={{ background: '#fdf4ff', borderColor: '#fbcfe8' }}>
                <div className="slide-section-title" style={{ color: '#d946ef' }}><ImageIcon size={14} /> KODE QR (OPSIONAL)</div>
                <div className="form-group">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #fbcfe8' }}>
                    <input 
                        type="text" 
                        value={slide.qr !== undefined ? slide.qr : (slide.qrUrl || '')} 
                        onChange={(e) => updateSlide(slide.id, 'qr', e.target.value)} 
                        className="admin-input" 
                        style={{ border: 'none', boxShadow: 'none', flex: 1 }} 
                        placeholder="Link gambar QR..." 
                    />
                    <label style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', background: '#d946ef', color: 'white', borderRadius: '0.35rem', fontWeight: 600, fontSize: '0.8rem' }}>
                      <Upload size={14} /> Upload QR
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(slide.id, e.target.files[0], 'qr')} />
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a21caf', marginBottom: '0.25rem', display: 'block' }}>Ukuran (px)</label>
                    <input type="number" value={slide.qrSize || 240} onChange={(e) => updateSlide(slide.id, 'qrSize', parseInt(e.target.value))} className="admin-input" style={{ background: 'white', borderColor: '#fbcfe8' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a21caf', marginBottom: '0.25rem', display: 'block' }}>Potongan QR</label>
                    <select value={slide.qrFit || 'cover'} onChange={(e) => updateSlide(slide.id, 'qrFit', e.target.value)} className="admin-input" style={{ background: 'white', borderColor: '#fbcfe8' }}>
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="fill">Fill</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {localSlides.length === 0 && (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1.5rem', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#94a3b8' }}>
            <ImageIcon size={40} />
          </div>
          <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>Belum ada slide</h3>
          <p style={{ color: '#64748b', margin: '0 0 1.5rem 0' }}>Mulai buat slide pertama Anda untuk ditampilkan di layar TV.</p>
          <button onClick={handleAddSlide} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
            <Plus size={18} /> Buat Slide Baru
          </button>
        </div>
      )}

      {/* DOCKED SLIDES FOOTER (SOLID & GROUNDED) */}
      <div style={{
        marginTop: '2.5rem',
        background: '#ffffff',
        padding: '1.25rem 1.75rem',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#475569' }}>
            Total Terpasang: <strong style={{ color: '#0f172a' }}>{localSlides.length} Slide Konten</strong>
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Siap tayang di layar TV</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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

    </div>
  );
}
