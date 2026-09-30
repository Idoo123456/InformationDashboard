const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\/\* ANNOUNCEMENTS \*\/\}(.*?)\{\/\* SCHEDULES \*\/\}/s;

const newAnnouncementsSection = `{/* ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              
              {/* KOLOM KIRI: LIVE PREVIEW TV */}
              <div className="card" style={{ padding: '2rem' }}>
                <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: 'none', paddingBottom: 0 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MonitorPlay size={20} color="#cb0c9f" /> Pratinjau Teks Berjalan (Live TV)</h3>
                  <p style={{ color: '#8392ab', fontSize: '0.85rem', marginTop: '0.5rem' }}>Simulasi tampilan pengumuman pada layar utama.</p>
                </div>
                
                <div style={{ background: '#0f172a', borderRadius: '1rem', padding: '2rem 1rem', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)' }}>
                  {/* FAKE TV FOOTER */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.9)', height: '50px', borderRadius: '0.5rem', overflow: 'hidden', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ background: '#2152ff', color: 'white', fontWeight: 800, padding: '0 1.5rem', height: '100%', display: 'flex', alignItems: 'center', zIndex: 2, letterSpacing: '1px', fontSize: '0.9rem' }}>
                      PENGUMUMAN
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap', 
                        display: 'inline-block',
                        animation: \`scroll \${localMarqueeSpeed}s linear infinite\`,
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        paddingLeft: '100%'
                      }}>
                        {localAnnouncements.length > 0 ? localAnnouncements.map(a => typeof a === 'string' ? a : a.text).join(' • ') : 'Tidak ada pengumuman aktif...'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <span style={{ display: 'inline-block', width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></span>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> Kecepatan Berjalan (Detik)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="range" 
                      value={localMarqueeSpeed} 
                      onChange={(e) => setLocalMarqueeSpeed(Number(e.target.value))} 
                      min="5" max="60"
                      style={{ flex: 1, accentColor: '#cb0c9f' }}
                    />
                    <span style={{ fontWeight: 800, color: '#cb0c9f', minWidth: '40px' }}>{localMarqueeSpeed}s</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#8392ab', marginTop: '0.5rem' }}>*Semakin kecil angkanya, semakin cepat teks berjalan.</p>
                </div>
              </div>

              {/* KOLOM KANAN: MANAJEMEN PENGUMUMAN */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3>Daftar Pengumuman</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn-delete" onClick={handleDeleteSelectedAnnouncements} disabled={selectedAnnouncements.length === 0} style={{ opacity: selectedAnnouncements.length === 0 ? 0.5 : 1 }}>
                      Hapus ({selectedAnnouncements.length})
                    </button>
                    <button className="btn-add" onClick={handleAddAnnouncement}><Plus size={16} /> Tambah Baru</button>
                  </div>
                </div>
                
                <div className="list-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {localAnnouncements.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#8392ab', background: '#f8f9fa', borderRadius: '1rem', border: '2px dashed #e9ecef' }}>
                      <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Belum ada pengumuman.</p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Klik "Tambah Baru" untuk mulai membuat teks berjalan.</p>
                    </div>
                  ) : (
                    localAnnouncements.map((ann, i) => {
                      const text = typeof ann === 'string' ? ann : ann.text;
                      const expiry = typeof ann === 'string' ? '' : ann.expiryDate;
                      return (
                      <div key={i} className="list-item" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#f8f9fa', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e9ecef', transition: 'all 0.2s' }}>
                        <div style={{ paddingTop: '0.5rem' }}>
                          <input 
                            type="checkbox"
                            checked={selectedAnnouncements.includes(i)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAnnouncements(prev => [...prev, i]);
                              else setSelectedAnnouncements(prev => prev.filter(idx => idx !== i));
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#cb0c9f' }}
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <input 
                            type="text" 
                            value={text} 
                            onChange={(e) => updateAnnouncement(i, 'text', e.target.value)}
                            className="admin-input"
                            placeholder="Tuliskan teks pengumuman di sini..."
                            style={{ fontWeight: 600, color: '#344767' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} color="#8392ab" />
                            <input 
                              type="datetime-local" 
                              value={expiry || ''} 
                              onChange={(e) => updateAnnouncement(i, 'expiryDate', e.target.value)}
                              className="admin-input"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: 'auto', flex: 1, maxWidth: '250px' }}
                              title="Waktu Berakhir"
                            />
                            <span style={{ fontSize: '0.75rem', color: '#8392ab' }}>(Opsional) Tanggal Berakhir</span>
                          </div>
                        </div>
                        <button className="btn-delete" onClick={() => deleteAnnouncement(i)} style={{ padding: '0.6rem' }} title="Hapus Pengumuman"><Trash2 size={16} /></button>
                      </div>
                      );
                    })
                  )}
                </div>
                
                <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}>
                  <button className="btn-save" onClick={handleSaveAnnouncements} style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}><Save size={18} /> Simpan Pengumuman ke TV</button>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULES */}`;

content = content.replace(regex, newAnnouncementsSection);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Announcements section rewritten');
