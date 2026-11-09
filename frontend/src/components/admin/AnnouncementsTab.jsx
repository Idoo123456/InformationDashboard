import { MonitorPlay, Activity, Plus, Trash2, Calendar, Save, MessageSquare, Clock, Megaphone, Info } from 'lucide-react';

export default function AnnouncementsTab({
  localMarqueeSpeed,
  setLocalMarqueeSpeed,
  localAnnouncements,
  selectedAnnouncements,
  setSelectedAnnouncements,
  handleDeleteSelectedAnnouncements,
  handleAddAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  handleSaveAnnouncements
}) {
  const marqueeItems = localAnnouncements.length > 0
    ? localAnnouncements.map(a => typeof a === 'string' ? a : a.text)
    : ['Pusat Informasi & Layanan Terpadu — Belum ada pengumuman khusus saat ini.'];

  return (
    <div className="announcements-container">
      
      {/* BAGIAN ATAS: LIVE PREVIEW & SPEED */}
      <div className="card announcements-preview-card">
        <div className="announcements-header-bar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h3 className="announcements-title">
                <MonitorPlay size={20} color="#2563eb" /> Pratinjau Teks Berjalan
              </h3>
              <span className="announcements-badge">
                Running Text TV
              </span>
            </div>
            <p className="announcements-desc">
              Simulasi tampilan teks berita/pengumuman yang berjalan di bagian bawah layar TV.
            </p>
          </div>
          
          {/* SPEED CONTROL */}
          <div className="announcements-speed-box">
            <Activity size={16} color="#2563eb" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Kecepatan Gulir:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input 
                type="number" 
                value={localMarqueeSpeed} 
                onChange={(e) => setLocalMarqueeSpeed(Number(e.target.value))} 
                min="5" max="120"
                className="admin-input announcements-speed-input"
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>dtk</span>
            </div>
          </div>
        </div>
        
        {/* TV SIMULATOR FRAME */}
        <div className="announcements-simulator-frame">
          <div className="announcements-marquee-bar">
            {/* BADGE PENGUMUMAN */}
            <div className="announcements-marquee-label">
              <Megaphone size={14} className="announcements-badge-icon" />
              <span>PENGUMUMAN</span>
            </div>
            {/* SCROLLING TEXT */}
            <div className="announcements-marquee-track">
              <div 
                className="announcements-marquee-content"
                style={{ 
                  animationDuration: `${localMarqueeSpeed || 20}s`
                }}
              >
                <div className="announcements-marquee-group">
                  {marqueeItems.map((text, idx) => (
                    <span key={idx} className="announcements-marquee-item">
                      <Info size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span>{text}</span>
                      <span className="announcements-marquee-bullet">•</span>
                    </span>
                  ))}
                </div>
                <div className="announcements-marquee-group" aria-hidden="true">
                  {marqueeItems.map((text, idx) => (
                    <span key={`clone-${idx}`} className="announcements-marquee-item">
                      <Info size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span>{text}</span>
                      <span className="announcements-marquee-bullet">•</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN BAWAH: LIST PENGUMUMAN */}
      <div className="card announcements-list-card">
        <div className="announcements-toolbar-bar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h3 className="announcements-title">
                Daftar Isi Pengumuman
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '999px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                {localAnnouncements.length} Teks Aktif
              </span>
            </div>
            <p className="announcements-desc">
              Kelola teks pengumuman yang otomatis berputar di pita bawah layar TV kampus.
            </p>
          </div>

          {/* ACTION BUTTONS: HAPUS TERPILIH & TAMBAH */}
          <div className="announcements-actions-group">
            {selectedAnnouncements.length > 0 && (
              <button 
                type="button"
                className="announcements-btn-delete-selected" 
                onClick={handleDeleteSelectedAnnouncements}
                title="Hapus pengumuman yang dicentang"
              >
                <Trash2 size={15} /> <span>Hapus ({selectedAnnouncements.length})</span>
              </button>
            )}
            <button 
              type="button"
              className="announcements-btn-add" 
              onClick={handleAddAnnouncement}
            >
              <Plus size={16} /> <span>Tambah Pengumuman</span>
            </button>
          </div>
        </div>
        
        {/* DAFTAR KARTU PENGUMUMAN */}
        <div className="announcements-items-list">
          {localAnnouncements.length === 0 ? (
            <div className="announcements-empty-box">
              <MessageSquare size={48} style={{ opacity: 0.25, marginBottom: '0.75rem', color: '#64748b' }} />
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Belum ada pengumuman.</p>
              <p style={{ fontSize: '0.88rem', margin: '0.35rem 0 1.25rem 0', color: '#64748b' }}>Klik tombol "Tambah Pengumuman" di atas untuk membuat teks berjalan baru.</p>
              <button 
                type="button"
                onClick={handleAddAnnouncement}
                className="announcements-btn-add"
                style={{ margin: '0 auto' }}
              >
                <Plus size={16} /> Buat Pengumuman Pertama
              </button>
            </div>
          ) : (
            localAnnouncements.map((ann, i) => {
              const text = typeof ann === 'string' ? ann : ann.text;
              const expiry = typeof ann === 'string' ? '' : ann.expiryDate;
              const isSelected = selectedAnnouncements.includes(i);

              return (
                <div 
                  key={i} 
                  className={`announcement-item-card ${isSelected ? 'selected' : ''}`}
                >
                  {/* Top Bar Item: Checkbox, Index, dan Tombol Hapus */}
                  <div className="announcement-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAnnouncements(prev => [...prev, i]);
                          else setSelectedAnnouncements(prev => prev.filter(idx => idx !== i));
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#cb0c9f' }}
                      />
                      <span className="announcement-index-badge">#{i + 1}</span>
                    </div>

                    <button 
                      type="button"
                      className="announcement-btn-trash" 
                      onClick={() => deleteAnnouncement(i)} 
                      title="Hapus Pengumuman Ini"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Isi Formulir Pengumuman */}
                  <div className="announcement-card-body">
                    {/* Input Teks */}
                    <div className="announcement-field-text">
                      <label className="announcement-field-label">Isi Teks Pengumuman</label>
                      <textarea 
                        rows="2"
                        value={text} 
                        onChange={(e) => updateAnnouncement(i, 'text', e.target.value)}
                        className="admin-input announcement-text-input"
                        placeholder="Tuliskan teks pengumuman yang ingin ditayangkan di layar TV..."
                      />
                    </div>

                    {/* Input Expiry Date */}
                    <div className="announcement-field-expiry">
                      <label className="announcement-field-label">
                        <Calendar size={13} color="#3b82f6" /> Batas Tayang (Opsional)
                      </label>
                      <input 
                        type="datetime-local" 
                        value={expiry || ''} 
                        onChange={(e) => updateAnnouncement(i, 'expiryDate', e.target.value)}
                        className="admin-input announcement-date-input"
                      />
                      <span className="announcement-expiry-hint">
                        {expiry ? '⏱️ Otomatis berhenti tayang setelah waktu ini' : '🌐 Selalu aktif tanpa batas waktu'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* FOOTER BAR SIMPAN */}
        <div className="announcements-footer-bar">
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Total: <strong style={{ color: '#0f172a' }}>{localAnnouncements.length} Teks</strong> pengumuman aktif.
          </div>
          <button 
            type="button"
            className="announcements-btn-save" 
            onClick={handleSaveAnnouncements}
          >
            <Save size={16} /> <span>Simpan Pengumuman ke TV</span>
          </button>
        </div>
      </div>

    </div>
  );
}

