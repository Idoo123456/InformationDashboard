import sys

file_path = "c:\\Dashboard Pusat Informasi\\src\\pages\\AdminDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# --- 1. Modify Imports ---
for i, line in enumerate(lines):
    if line.startswith("import { Settings"):
        lines[i] = "import { Settings, Image as ImageIcon, Calendar, MessageSquare, Save, Trash2, Plus, Edit, LogOut, ChevronRight, ChevronLeft, User, Upload, Copy, LayoutDashboard, MonitorPlay, Activity, Download, Filter, Search, X, List, LayoutGrid } from 'lucide-react';\n"
        break

# --- 2. Add States ---
state_insert_index = -1
for i, line in enumerate(lines):
    if "const [activeTab, setActiveTab] = useState('overview');" in line:
        state_insert_index = i + 1
        break

if state_insert_index != -1:
    states_code = """
  // Schedule Views & Modal States
  const [scheduleView, setScheduleView] = useState('daftar');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleDateFrom, setScheduleDateFrom] = useState('');
  const [scheduleDateTo, setScheduleDateTo] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
"""
    lines.insert(state_insert_index, states_code)


# --- 3. Update Handlers ---
for i, line in enumerate(lines):
    if "const handleAddSchedule = () => {" in line:
        handler_start = i
        break

for i in range(handler_start, len(lines)):
    if "const handleSaveSchedules = () => {" in lines[i]:
        handler_end = i
        break

handlers_code = """  const handleAddSchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingSchedule({ id: Date.now(), date: today, startTime: '09:00', endTime: '12:00', title: '', description: '', loc: '', status: 'Otomatis', pic: '', partnerCategory: 'Internal' });
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule({ ...schedule });
    setIsScheduleModalOpen(true);
  };

  const handleSaveModalSchedule = () => {
    if (!editingSchedule.title) {
      Swal.fire('Error', 'Nama Kegiatan harus diisi', 'error');
      return;
    }
    const exists = localSchedules.find(s => s.id === editingSchedule.id);
    if (exists) {
      setLocalSchedules(localSchedules.map(s => s.id === editingSchedule.id ? editingSchedule : s));
    } else {
      setLocalSchedules([...localSchedules, editingSchedule]);
    }
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
    showToastPopup('Jadwal berhasil disimpan');
  };

  const updateSchedule = (id, field, value) => {
    setLocalSchedules(localSchedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSchedule = (id) => {
    showConfirmDelete(() => {
      setLocalSchedules(prev => prev.filter(s => s.id !== id));
    });
  };

  const handleSaveSchedules = () => {
    setSchedules(localSchedules);
    setScheduleSpeed(localScheduleSpeed);
    showSuccessPopup('Jadwal berhasil disimpan dan diperbarui di layar TV!');
  };

  const filteredSchedulesView = localSchedules.filter(s => {
    const matchSearch = !scheduleSearch || (s.title && s.title.toLowerCase().includes(scheduleSearch.toLowerCase()));
    const matchDateFrom = !scheduleDateFrom || s.date >= scheduleDateFrom;
    const matchDateTo = !scheduleDateTo || s.date <= scheduleDateTo;
    return matchSearch && matchDateFrom && matchDateTo;
  }).sort((a,b) => new Date(a.date) - new Date(b.date));

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

"""
# Find end of handleSaveSchedules block
save_sched_end = handler_end
while not lines[save_sched_end].strip() == "};":
    save_sched_end += 1

# Delete old handlers
del lines[handler_start:save_sched_end+1]
# Insert new handlers
lines.insert(handler_start, handlers_code)

# --- 4. Replace Schedules Layout ---
for i, line in enumerate(lines):
    if "{/* SCHEDULES */}" in line:
        sched_start = i
        break

sched_end = -1
for i in range(sched_start + 1, len(lines)):
    if "{/* SLIDES */}" in lines[i]:
        sched_end = i - 1
        break

layout_code = """          {/* SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem' }}>
              <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Jadwal Kegiatan</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="view-toggle" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.25rem' }}>
                    <button onClick={() => setScheduleView('daftar')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.25rem', background: scheduleView === 'daftar' ? 'white' : 'transparent', color: scheduleView === 'daftar' ? '#1e293b' : '#64748b', boxShadow: scheduleView === 'daftar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none', cursor: 'pointer', fontWeight: scheduleView === 'daftar' ? 600 : 500 }}><List size={16} /> Daftar</button>
                    <button onClick={() => setScheduleView('kalender')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.25rem', background: scheduleView === 'kalender' ? 'white' : 'transparent', color: scheduleView === 'kalender' ? '#1e293b' : '#64748b', boxShadow: scheduleView === 'kalender' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none', cursor: 'pointer', fontWeight: scheduleView === 'kalender' ? 600 : 500 }}><Calendar size={16} /> Kalender</button>
                    <button onClick={() => setScheduleView('grid')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.25rem', background: scheduleView === 'grid' ? 'white' : 'transparent', color: scheduleView === 'grid' ? '#1e293b' : '#64748b', boxShadow: scheduleView === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none', cursor: 'pointer', fontWeight: scheduleView === 'grid' ? 600 : 500 }}><LayoutGrid size={16} /> Grid</button>
                  </div>
                </div>
              </div>

              {/* FILTERS */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'flex-end', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block' }}>Cari Kegiatan</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={16} /></div>
                    <input type="text" value={scheduleSearch} onChange={(e) => setScheduleSearch(e.target.value)} placeholder="Ketik nama kegiatan..." className="admin-input" style={{ paddingLeft: '35px', margin: 0 }} />
                  </div>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block' }}>Dari Tanggal</label>
                  <input type="date" value={scheduleDateFrom} onChange={(e) => setScheduleDateFrom(e.target.value)} className="admin-input" style={{ margin: 0 }} />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block' }}>Sampai Tanggal</label>
                  <input type="date" value={scheduleDateTo} onChange={(e) => setScheduleDateTo(e.target.value)} className="admin-input" style={{ margin: 0 }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  <button className="btn-add" onClick={handleAddSchedule} style={{ padding: '0.6rem 1.2rem' }}><Plus size={16} /> Tambah Kegiatan Baru</button>
                </div>
              </div>

              {/* VIEW: DAFTAR */}
              {scheduleView === 'daftar' && (
                <div style={{ overflowX: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#475569' }}>Tanggal</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#475569' }}>Waktu</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#475569' }}>Nama Kegiatan</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#475569' }}>Ruangan</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#475569' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#475569' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedulesView.map((s, i) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={{ padding: '1rem' }}>{s.date}</td>
                          <td style={{ padding: '1rem' }}>{s.startTime} - {s.endTime}</td>
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#1e293b' }}>{s.title}</td>
                          <td style={{ padding: '1rem' }}>{s.loc}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              padding: '0.3rem 0.6rem', 
                              borderRadius: '999px', 
                              fontSize: '0.75rem', 
                              fontWeight: 600,
                              backgroundColor: s.status === 'Berlangsung' ? '#dcfce7' : s.status === 'Akan Datang' || s.status === 'Otomatis' ? '#dbeafe' : s.status === 'Selesai' ? '#f3e8ff' : '#fee2e2',
                              color: s.status === 'Berlangsung' ? '#166534' : s.status === 'Akan Datang' || s.status === 'Otomatis' ? '#1e40af' : s.status === 'Selesai' ? '#6b21a8' : '#991b1b'
                            }}>
                              {s.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button className="btn-edit" onClick={() => handleEditSchedule(s)} style={{ padding: '0.4rem 0.75rem', marginRight: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', color: '#1e293b' }}><Edit size={14} /> Ubah</button>
                            <button className="btn-delete" onClick={() => deleteSchedule(s.id)} style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}><Trash2 size={14} /> Batal</button>
                          </td>
                        </tr>
                      ))}
                      {filteredSchedulesView.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada kegiatan yang ditemukan.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VIEW: GRID */}
              {scheduleView === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {filteredSchedulesView.map(s => (
                    <div key={s.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', flex: 1, paddingRight: '1rem' }}>{s.title}</h4>
                        <span style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.loc || 'Ruangan -'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> {s.date}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14} /> {s.startTime} - {s.endTime}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> PIC: {s.pic || '-'}</div>
                      </div>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', alignItems: 'center' }}>
                         <span style={{ 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '999px', 
                            fontSize: '0.7rem', 
                            fontWeight: 600,
                            backgroundColor: s.status === 'Berlangsung' ? '#dcfce7' : s.status === 'Akan Datang' || s.status === 'Otomatis' ? '#dbeafe' : s.status === 'Selesai' ? '#f3e8ff' : '#fee2e2',
                            color: s.status === 'Berlangsung' ? '#166534' : s.status === 'Akan Datang' || s.status === 'Otomatis' ? '#1e40af' : s.status === 'Selesai' ? '#6b21a8' : '#991b1b'
                          }}>
                            {s.status}
                          </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-edit" onClick={() => handleEditSchedule(s)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', color: '#1e293b', fontWeight: 500 }}><Edit size={14} /> Ubah</button>
                          <button className="btn-delete" onClick={() => deleteSchedule(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 500 }}><Trash2 size={14} /> Batal</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSchedulesView.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada kegiatan yang ditemukan.</div>
                  )}
                </div>
              )}

              {/* VIEW: KALENDER */}
              {scheduleView === 'kalender' && (
                <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>{currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={prevMonth} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', color: '#64748b' }}><ChevronLeft size={18} /></button>
                      <button onClick={nextMonth} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', color: '#64748b' }}><ChevronRight size={18} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                      <div key={day} style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>{day}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ padding: '1rem', minHeight: '120px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#fafaf9' }}></div>
                    ))}
                    {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const daySchedules = localSchedules.filter(s => s.date === dateStr);
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      return (
                        <div key={day} style={{ padding: '0.5rem', minHeight: '120px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: isToday ? '#f0fdf4' : 'white' }}>
                          <div style={{ fontWeight: 600, color: isToday ? '#166534' : '#1e293b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ background: isToday ? '#22c55e' : 'transparent', color: isToday ? 'white' : 'inherit', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{day}</span>
                            {daySchedules.length > 0 && <span style={{ fontSize: '0.65rem', background: '#e2e8f0', padding: '0.1rem 0.3rem', borderRadius: '0.25rem', color: '#475569' }}>{daySchedules.length} keg</span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {daySchedules.map(s => (
                              <div key={s.id} onClick={() => handleEditSchedule(s)} style={{ padding: '0.25rem 0.5rem', background: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem', borderRadius: '0.25rem', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }} title={s.title}>
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

              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <div className="form-group" style={{ margin: 0, marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ margin: 0, fontSize: '0.85rem' }}>Auto-Scroll Ticker (Normal=1):</label>
                  <input 
                    type="number" 
                    value={localScheduleSpeed} 
                    onChange={(e) => setLocalScheduleSpeed(Number(e.target.value))} 
                    className="admin-input"
                    min="0.1"
                    step="0.1"
                    style={{ width: '80px', padding: '0.3rem', margin: 0 }}
                  />
                </div>
                <button className="btn-save" onClick={handleSaveSchedules}><Save size={16} /> Simpan Jadwal ke Layar TV</button>
              </div>
            </div>
          )}
"""
del lines[sched_start:sched_end]
lines.insert(sched_start, layout_code)

# --- 5. Add Modal Component ---
for i, line in enumerate(lines):
    if "{croppingImage && (" in line:
        modal_insert_index = i
        break

modal_code = """      {isScheduleModalOpen && editingSchedule && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{localSchedules.find(s => s.id === editingSchedule.id) ? 'Ubah Kegiatan' : 'Tambah Kegiatan Baru'}</h3>
              <button onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Kegiatan</label>
                <input type="text" value={editingSchedule.title} onChange={(e) => setEditingSchedule({...editingSchedule, title: e.target.value})} className="admin-input" placeholder="Misal: Rapat Koordinasi..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal</label>
                  <input type="date" value={editingSchedule.date} onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})} className="admin-input" />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                  <select value={editingSchedule.status === 'Dibatalkan' ? 'Dibatalkan' : 'Otomatis'} onChange={(e) => setEditingSchedule({...editingSchedule, status: e.target.value})} className="admin-input">
                    <option value="Otomatis">Otomatis (Sesuai Waktu)</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu Mulai</label>
                  <input type="time" value={editingSchedule.startTime} onChange={(e) => setEditingSchedule({...editingSchedule, startTime: e.target.value})} className="admin-input" />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu Selesai</label>
                  <input type="time" value={editingSchedule.endTime} onChange={(e) => setEditingSchedule({...editingSchedule, endTime: e.target.value})} className="admin-input" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ruangan</label>
                <select value={['TGCL - Podcast', 'TGCL - Meetingroom', 'TGCL - Event & Training Area', 'Studio Gurindam 12', 'Ruang Pertemuan/Meeting Room', 'Ruang Diskusi (Max 15 orang)', 'Ruang Diskusi (Max 8 orang)'].includes(editingSchedule.loc) ? editingSchedule.loc : (editingSchedule.loc ? 'Lainnya' : '')} onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value === 'Lainnya' ? '' : e.target.value})} className="admin-input">
                  <option value="">Pilih Ruangan...</option>
                  <option value="TGCL - Podcast">TGCL - Podcast</option>
                  <option value="TGCL - Meetingroom">TGCL - Meetingroom</option>
                  <option value="TGCL - Event & Training Area">TGCL - Event & Training Area</option>
                  <option value="Studio Gurindam 12">Studio Gurindam 12</option>
                  <option value="Ruang Pertemuan/Meeting Room">Ruang Pertemuan/Meeting Room</option>
                  <option value="Ruang Diskusi (Max 15 orang)">Ruang Diskusi (Max 15 orang)</option>
                  <option value="Ruang Diskusi (Max 8 orang)">Ruang Diskusi (Max 8 orang)</option>
                  <option value="Lainnya">Lainnya (Isi Sendiri)...</option>
                </select>
                {!['TGCL - Podcast', 'TGCL - Meetingroom', 'TGCL - Event & Training Area', 'Studio Gurindam 12', 'Ruang Pertemuan/Meeting Room', 'Ruang Diskusi (Max 15 orang)', 'Ruang Diskusi (Max 8 orang)', ''].includes(editingSchedule.loc) && (
                  <input type="text" value={editingSchedule.loc} onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value})} className="admin-input" placeholder="Ketik nama ruangan..." style={{ marginTop: '0.5rem' }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PIC Kegiatan</label>
                  <select value={['Evi Susanti, S.Si., M.I.Kom.', 'Gusti Maya Sari, S. IP.', 'Yuliastuti, S.IP.', 'Anton Yuliarto, S.Kom.', 'H. Thamrin Hasan, M.Pd.', 'Listya Oktaviana, S.Sos.'].includes(editingSchedule.pic) ? editingSchedule.pic : (editingSchedule.pic ? 'Lainnya' : '')} onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value === 'Lainnya' ? '' : e.target.value})} className="admin-input">
                    <option value="">Pilih PIC...</option>
                    <option value="Evi Susanti, S.Si., M.I.Kom.">Evi Susanti, S.Si., M.I.Kom.</option>
                    <option value="Gusti Maya Sari, S. IP.">Gusti Maya Sari, S. IP.</option>
                    <option value="Yuliastuti, S.IP.">Yuliastuti, S.IP.</option>
                    <option value="Anton Yuliarto, S.Kom.">Anton Yuliarto, S.Kom.</option>
                    <option value="H. Thamrin Hasan, M.Pd.">H. Thamrin Hasan, M.Pd.</option>
                    <option value="Listya Oktaviana, S.Sos.">Listya Oktaviana, S.Sos.</option>
                    <option value="Lainnya">Lainnya (Isi Sendiri)...</option>
                  </select>
                  {!['Evi Susanti, S.Si., M.I.Kom.', 'Gusti Maya Sari, S. IP.', 'Yuliastuti, S.IP.', 'Anton Yuliarto, S.Kom.', 'H. Thamrin Hasan, M.Pd.', 'Listya Oktaviana, S.Sos.', ''].includes(editingSchedule.pic) && (
                    <input type="text" value={editingSchedule.pic} onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value})} className="admin-input" placeholder="Ketik nama PIC..." style={{ marginTop: '0.5rem' }} />
                  )}
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kategori Mitra</label>
                  <select value={editingSchedule.partnerCategory === 'Internal' ? 'Internal' : 'Eksternal'} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value === 'Eksternal' ? '' : 'Internal'})} className="admin-input">
                    <option value="Internal">Internal</option>
                    <option value="Eksternal">Eksternal (Isi Nama Mitra)...</option>
                  </select>
                  {editingSchedule.partnerCategory !== 'Internal' && (
                    <input type="text" value={editingSchedule.partnerCategory} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value})} className="admin-input" placeholder="Ketik nama mitra..." style={{ marginTop: '0.5rem' }} />
                  )}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deskripsi Tambahan</label>
                <textarea value={editingSchedule.description} onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})} className="admin-input" placeholder="Tambahkan keterangan singkat tentang kegiatan..." rows="2"></textarea>
              </div>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#f8fafc', borderRadius: '0 0 0.75rem 0.75rem' }}>
              <button onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Batal</button>
              <button onClick={handleSaveModalSchedule} style={{ padding: '0.6rem 1.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Save size={16} /> Simpan</button>
            </div>
          </div>
        </div>
      )}
"""

lines.insert(modal_insert_index, modal_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)
