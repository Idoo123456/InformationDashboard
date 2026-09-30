const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const startTag = '{/* SCHEDULES */}';
const endTag = '{/* SLIDES */}';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.error('Tags not found');
    process.exit(1);
}

const newLayout = `          {/* SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
              
              {/* HEADER & TOGGLES */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Jadwal & Agenda</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Kelola semua aktivitas operasional dan jadwal di satu tempat.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', background: 'white', borderRadius: '999px', padding: '0.3rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <button onClick={() => setScheduleView('daftar')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '999px', background: scheduleView === 'daftar' ? '#3b82f6' : 'transparent', color: scheduleView === 'daftar' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}><List size={16} /> Timeline</button>
                    <button onClick={() => setScheduleView('kalender')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '999px', background: scheduleView === 'kalender' ? '#3b82f6' : 'transparent', color: scheduleView === 'kalender' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}><Calendar size={16} /> Kalender</button>
                    <button onClick={() => setScheduleView('grid')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '999px', background: scheduleView === 'grid' ? '#3b82f6' : 'transparent', color: scheduleView === 'grid' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}><LayoutGrid size={16} /> Kanvas</button>
                  </div>
                  <button onClick={handleAddSchedule} style={{ padding: '0.85rem 1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Plus size={18} /> Entri Baru
                  </button>
                </div>
              </div>

              {/* MODERN FILTER BAR */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div style={{ flex: '2 1 250px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={18} /></div>
                  <input type="text" value={scheduleSearch} onChange={(e) => setScheduleSearch(e.target.value)} placeholder="Cari judul kegiatan, PIC, atau ruangan..." style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem', color: '#1e293b', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="date" value={scheduleDateFrom} onChange={(e) => setScheduleDateFrom(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.9rem', color: '#475569' }} />
                    <span style={{ position: 'absolute', top: '-8px', left: '12px', background: 'white', padding: '0 4px', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', borderRadius: '4px' }}>Mulai</span>
                  </div>
                  <span style={{ color: '#cbd5e1' }}>—</span>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="date" value={scheduleDateTo} onChange={(e) => setScheduleDateTo(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.9rem', color: '#475569' }} />
                    <span style={{ position: 'absolute', top: '-8px', left: '12px', background: 'white', padding: '0 4px', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', borderRadius: '4px' }}>Akhir</span>
                  </div>
                </div>
              </div>

              {/* VIEW: DAFTAR (TIMELINE LAYOUT) */}
              {scheduleView === 'daftar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  
                  {/* ACTIVE SCHEDULES */}
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '8px', height: '24px', background: '#3b82f6', borderRadius: '4px' }}></div>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Aktivitas Mendatang & Berlangsung</h4>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{activeSchedulesList.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activeSchedulesList.map((s) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '1.25rem 1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }} onMouseOver={e => {e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';}} onMouseOut={e => {e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';}}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: s.dynamicStatus === 'Berlangsung' ? '#10b981' : '#3b82f6' }}></div>
                          
                          <div style={{ width: '160px', paddingLeft: '0.5rem' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>{s.startTime}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>s/d {s.endTime}</div>
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>{s.title}</h4>
                            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14}/> {s.date}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><LayoutGrid size={14}/> {s.loc || '-'}</span>
                              {s.pic && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14}/> {s.pic}</span>}
                            </div>
                          </div>

                          <div style={{ width: '130px', textAlign: 'center' }}>
                             <span style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: s.dynamicStatus === 'Berlangsung' ? '#ecfdf5' : '#eff6ff', color: s.dynamicStatus === 'Berlangsung' ? '#059669' : '#2563eb', border: \`1px solid \${s.dynamicStatus === 'Berlangsung' ? '#a7f3d0' : '#bfdbfe'}\`, display: 'inline-block' }}>
                              {s.dynamicStatus}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                            <button onClick={() => handleEditSchedule(s)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }} title="Edit" onMouseOver={e => {e.currentTarget.style.background = '#e2e8f0';}} onMouseOut={e => {e.currentTarget.style.background = '#f8fafc';}}><Edit size={16} /></button>
                            <button onClick={() => deleteSchedule(s.id)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s' }} title="Hapus" onMouseOver={e => {e.currentTarget.style.background = '#fee2e2';}} onMouseOut={e => {e.currentTarget.style.background = '#fef2f2';}}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                      {activeSchedulesList.length === 0 && (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                          <Calendar size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                          <h4 style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>Belum ada aktivitas baru.</h4>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* HISTORY LOG */}
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                      <div style={{ width: '8px', height: '24px', background: '#94a3b8', borderRadius: '4px' }}></div>
                      <h4 style={{ margin: 0, color: '#475569', fontSize: '1.25rem' }}>Log Historis</h4>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{historySchedulesList.length}</span>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                      {/* Timeline line */}
                      <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }}></div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {historySchedulesList.map((s) => (
                          <div key={s.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'transparent', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', transition: 'all 0.2s', opacity: 0.75 }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.75}>
                            {/* Timeline dot */}
                            <div style={{ position: 'absolute', left: '-22px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: s.dynamicStatus === 'Selesai' ? '#cbd5e1' : '#fca5a5', border: '2px solid white', zIndex: 2 }}></div>
                            
                            <div style={{ width: '120px' }}>
                              <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>{s.date}</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{s.startTime}</div>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: '#334155', fontWeight: 600 }}>{s.title}</h4>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.loc}</div>
                            </div>

                            <div style={{ width: '110px', textAlign: 'center' }}>
                               <span style={{ padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: s.dynamicStatus === 'Selesai' ? '#f1f5f9' : '#fef2f2', color: s.dynamicStatus === 'Selesai' ? '#64748b' : '#dc2626' }}>
                                {s.dynamicStatus}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem' }}>
                              <button onClick={() => handleEditSchedule(s)} style={{ padding: '0.4rem', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}><Edit size={14} /></button>
                              <button onClick={() => deleteSchedule(s.id)} style={{ padding: '0.4rem', background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                        {historySchedulesList.length === 0 && (
                          <div style={{ padding: '2rem', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Riwayat bersih.
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW: GRID (KANVAS) */}
              {scheduleView === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                  {filteredSchedulesView.map(s => (
                    <div key={s.id} style={{ position: 'relative', background: 'white', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {/* Decorative Gradient Blob */}
                      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '120px', height: '120px', background: s.dynamicStatus === 'Berlangsung' ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0 }}></div>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <span style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: s.dynamicStatus === 'Berlangsung' ? '#10b981' : s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Otomatis' ? '#3b82f6' : s.dynamicStatus === 'Selesai' ? '#94a3b8' : '#ef4444', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          {s.dynamicStatus}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} /> {s.date}</span>
                      </div>
                      
                      <h4 style={{ position: 'relative', zIndex: 1, margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.3, fontWeight: 800 }}>{s.title}</h4>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem', fontSize: '0.9rem', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Activity size={14} /></div>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{s.startTime} - {s.endTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><LayoutGrid size={14} /></div>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.loc || 'Belum diatur'}</span>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                          <User size={14} />
                          <span style={{ fontWeight: 500, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.pic || 'Tanpa PIC'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditSchedule(s)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', color: '#475569', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}><Edit size={14} /></button>
                          <button onClick={() => deleteSchedule(s.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSchedulesView.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                      <LayoutGrid size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                      <h4 style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>Kanvas kosong. Tidak ada data.</h4>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: KALENDER (MODERN) */}
              {scheduleView === 'kalender' && (
                <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', background: 'linear-gradient(to right, #f8fafc, #ffffff)', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>{currentMonth.getFullYear()}</span>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: 800 }}>{currentMonth.toLocaleString('id-ID', { month: 'long' })}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={prevMonth} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform='scale(1.05)'}} onMouseOut={e => {e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform='scale(1)'}}><ChevronLeft size={20} /></button>
                      <button onClick={nextMonth} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform='scale(1.05)'}} onMouseOut={e => {e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform='scale(1)'}}><ChevronRight size={20} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9', background: '#fafaf9' }}>
                    {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day, idx) => (
                      <div key={day} style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: 700, color: idx === 0 || idx === 6 ? '#94a3b8' : '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{day.substring(0,3)}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', gap: '1px' }}>
                    {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                      <div key={'empty-'+i} style={{ padding: '1rem', minHeight: '140px', background: '#f8fafc' }}></div>
                    ))}
                    {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = \`\${currentMonth.getFullYear()}-\${String(currentMonth.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
                      const daySchedules = localSchedules.filter(s => s.date === dateStr);
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      return (
                        <div key={day} style={{ padding: '0.75rem', minHeight: '140px', background: isToday ? '#f0fdfa' : 'white', position: 'relative', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = isToday ? '#f0fdfa' : '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = isToday ? '#f0fdfa' : 'white'}>
                          <div style={{ fontWeight: 800, color: isToday ? '#0d9488' : '#334155', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ background: isToday ? '#14b8a6' : 'transparent', color: isToday ? 'white' : 'inherit', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem' }}>{day}</span>
                            {daySchedules.length > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }}></span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {daySchedules.map(s => (
                              <div key={s.id} onClick={() => handleEditSchedule(s)} style={{ padding: '0.35rem 0.5rem', background: s.dynamicStatus === 'Berlangsung' ? '#dcfce7' : s.dynamicStatus === 'Selesai' ? '#f1f5f9' : '#eff6ff', color: s.dynamicStatus === 'Berlangsung' ? '#166534' : s.dynamicStatus === 'Selesai' ? '#64748b' : '#1e40af', fontSize: '0.75rem', borderRadius: '0.35rem', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, borderLeft: \`3px solid \${s.dynamicStatus === 'Berlangsung' ? '#10b981' : s.dynamicStatus === 'Selesai' ? '#94a3b8' : '#3b82f6'}\`, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} title={s.title}>
                                {s.startTime} {s.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FLOATING SAVE BAR */}
              <div style={{ position: 'sticky', bottom: '2rem', left: 0, right: 0, marginTop: '3rem', zIndex: 10 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '1rem 1.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Kecepatan Scroll TV (Normal=1):</label>
                    <input 
                      type="number" 
                      value={localScheduleSpeed} 
                      onChange={(e) => setLocalScheduleSpeed(Number(e.target.value))} 
                      className="admin-input"
                      min="0.1"
                      step="0.1"
                      style={{ width: '80px', padding: '0.4rem', margin: 0, borderRadius: '0.5rem', textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                  <button onClick={handleSaveSchedules} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Save size={16} /> Publikasikan ke Layar TV
                  </button>
                </div>
              </div>
            </div>
          )}
`;

content = content.substring(0, startIndex) + newLayout + content.substring(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Update success');
