import { MonitorPlay, Activity, Plus, Trash2, Calendar, Save, MessageSquare } from 'lucide-react';

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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* BAGIAN ATAS: LIVE PREVIEW & SPEED */}
      <div className="card" style={{ padding: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#344767' }}>
              <MonitorPlay size={22} color="#cb0c9f" /> Pratinjau Layar TV
            </h3>
            <p style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
              Simulasi tampilan teks berjalan pada layar utama.
            </p>
          </div>
          
          {/* SPEED CONTROL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #e9ecef' }}>
            <Activity size={18} color="#8392ab" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Kecepatan (Detik):</span>
            <input 
              type="number" 
              value={localMarqueeSpeed} 
              onChange={(e) => setLocalMarqueeSpeed(Number(e.target.value))} 
              min="5" max="60"
              className="admin-input"
              style={{ width: '70px', padding: '0.35rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#cb0c9f' }}
            />
          </div>
        </div>
        
        {/* TV SIMULATOR */}
        <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)', marginTop: '1rem' }}>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.95)', height: '55px', borderRadius: '0.5rem', overflow: 'hidden', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            {/* BLUE BADGE */}
            <div style={{ background: 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)', color: 'white', fontWeight: 800, padding: '0 1.5rem', height: '100%', display: 'flex', alignItems: 'center', zIndex: 10, letterSpacing: '1px', fontSize: '0.9rem', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
              PENGUMUMAN
            </div>
            {/* SCROLLING TEXT */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                whiteSpace: 'nowrap', 
                display: 'inline-block',
                animation: `scroll ${localMarqueeSpeed}s linear infinite`,
                color: '#344767',
                fontWeight: 700,
                fontSize: '1.15rem',
                paddingLeft: '100%'
              }}>
                {localAnnouncements.length > 0 ? localAnnouncements.map(a => typeof a === 'string' ? a : a.text).join(' • ') : 'Tidak ada pengumuman aktif...'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BAGIAN BAWAH: LIST PENGUMUMAN */}
      <div className="card" style={{ padding: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef', paddingBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#344767' }}>Manajemen Daftar Pengumuman</h3>
            <p style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>Atur teks pengumuman yang akan ditampilkan di layar bawah TV.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-delete" onClick={handleDeleteSelectedAnnouncements} disabled={selectedAnnouncements.length === 0} style={{ opacity: selectedAnnouncements.length === 0 ? 0.5 : 1 }}>
              Hapus Pilihan ({selectedAnnouncements.length})
            </button>
            <button className="btn-add" onClick={handleAddAnnouncement}>
              <Plus size={16} /> Tambah Baru
            </button>
          </div>
        </div>
        
        <div className="list-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {localAnnouncements.length === 0 ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 500, background: '#f8f9fa', borderRadius: '1rem', border: '2px dashed #e9ecef' }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#344767' }}>Belum ada pengumuman.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Klik tombol "Tambah Baru" di atas untuk mulai membuat teks berjalan.</p>
            </div>
          ) : (
            localAnnouncements.map((ann, i) => {
              const text = typeof ann === 'string' ? ann : ann.text;
              const expiry = typeof ann === 'string' ? '' : ann.expiryDate;
              return (
              <div key={i} className="list-item" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '1rem', border: '1px solid #e9ecef', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}>
                
                {/* Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox"
                    checked={selectedAnnouncements.includes(i)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedAnnouncements(prev => [...prev, i]);
                      else setSelectedAnnouncements(prev => prev.filter(idx => idx !== i));
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#cb0c9f' }}
                  />
                </div>

                {/* Input Teks */}
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Isi Pengumuman</label>
                  <input 
                    type="text" 
                    value={text} 
                    onChange={(e) => updateAnnouncement(i, 'text', e.target.value)}
                    className="admin-input"
                    placeholder="Tuliskan teks pengumuman di sini..."
                    style={{ fontWeight: 600, color: '#344767', width: '100%' }}
                  />
                </div>

                {/* Input Expiry Date */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={12} /> Tanggal Berakhir (Opsional)
                  </label>
                  <input 
                    type="datetime-local" 
                    value={expiry || ''} 
                    onChange={(e) => updateAnnouncement(i, 'expiryDate', e.target.value)}
                    className="admin-input"
                    style={{ width: '100%', color: '#475569', fontWeight: 600 }}
                  />
                </div>

                {/* Action Button */}
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: '1.5rem' }}>
                  <button className="btn-delete" onClick={() => deleteAnnouncement(i)} style={{ padding: '0.75rem' }} title="Hapus Pengumuman">
                    <Trash2 size={18} />
                  </button>
                </div>

              </div>
              );
            })
          )}
        </div>
        
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}>
          <button className="btn-save" onClick={handleSaveAnnouncements} style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
            <Save size={18} /> Simpan Pengumuman ke TV
          </button>
        </div>
      </div>

    </div>
  );
}
