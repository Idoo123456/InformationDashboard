const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the filter definition
const oldFilterCode = `  const filteredSchedulesView = localSchedules.filter(s => {
    const matchSearch = !scheduleSearch || (s.title && s.title.toLowerCase().includes(scheduleSearch.toLowerCase()));
    const matchDateFrom = !scheduleDateFrom || s.date >= scheduleDateFrom;
    const matchDateTo = !scheduleDateTo || s.date <= scheduleDateTo;
    return matchSearch && matchDateFrom && matchDateTo;
  }).sort((a,b) => new Date(a.date) - new Date(b.date));`;

const newFilterCode = `  const schedulesWithDynamicStatus = localSchedules.map(s => ({ ...s, dynamicStatus: getDynamicStatus(s) }));
  
  const filteredSchedulesView = schedulesWithDynamicStatus.filter(s => {
    const matchSearch = !scheduleSearch || (s.title && s.title.toLowerCase().includes(scheduleSearch.toLowerCase()));
    const matchDateFrom = !scheduleDateFrom || s.date >= scheduleDateFrom;
    const matchDateTo = !scheduleDateTo || s.date <= scheduleDateTo;
    return matchSearch && matchDateFrom && matchDateTo;
  }).sort((a,b) => new Date(a.date) - new Date(b.date));

  const activeSchedulesList = filteredSchedulesView.filter(s => s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Berlangsung' || s.dynamicStatus === 'Otomatis');
  const historySchedulesList = filteredSchedulesView.filter(s => s.dynamicStatus === 'Selesai' || s.dynamicStatus === 'Dibatalkan').sort((a,b) => new Date(b.date) - new Date(a.date));`;

content = content.replace(oldFilterCode, newFilterCode);

// 2. Update the 'daftar' view rendering
const newDaftarView = `{/* VIEW: DAFTAR */}
              {scheduleView === 'daftar' && (
                <>
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1.1rem' }}>Kegiatan Aktif & Akan Datang</h4>
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
                          {activeSchedulesList.map((s, i) => (
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
                                  backgroundColor: s.dynamicStatus === 'Berlangsung' ? '#dcfce7' : s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Otomatis' ? '#dbeafe' : s.dynamicStatus === 'Selesai' ? '#f3e8ff' : '#fee2e2',
                                  color: s.dynamicStatus === 'Berlangsung' ? '#166534' : s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Otomatis' ? '#1e40af' : s.dynamicStatus === 'Selesai' ? '#6b21a8' : '#991b1b',
                                  display: 'inline-block'
                                }}>
                                  {s.dynamicStatus}
                                </span>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button className="btn-edit" onClick={() => handleEditSchedule(s)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', marginRight: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', color: '#1e293b' }}><Edit size={14} /> Ubah</button>
                                <button className="btn-delete" onClick={() => deleteSchedule(s.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}><Trash2 size={14} /> Batal</button>
                              </td>
                            </tr>
                          ))}
                          {activeSchedulesList.length === 0 && (
                            <tr>
                              <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada kegiatan aktif.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1.1rem' }}>Log Riwayat Kegiatan</h4>
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
                          {historySchedulesList.map((s, i) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc', opacity: 0.85 }}>
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
                                  backgroundColor: s.dynamicStatus === 'Selesai' ? '#f3e8ff' : '#fee2e2',
                                  color: s.dynamicStatus === 'Selesai' ? '#6b21a8' : '#991b1b',
                                  display: 'inline-block'
                                }}>
                                  {s.dynamicStatus}
                                </span>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button className="btn-edit" onClick={() => handleEditSchedule(s)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', marginRight: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', color: '#1e293b' }}><Edit size={14} /> Ubah</button>
                                <button className="btn-delete" onClick={() => deleteSchedule(s.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}><Trash2 size={14} /> Hapus</button>
                              </td>
                            </tr>
                          ))}
                          {historySchedulesList.length === 0 && (
                            <tr>
                              <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada riwayat kegiatan.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}`;

const daftarStartIndex = content.indexOf('{/* VIEW: DAFTAR */}');
const gridStartIndex = content.indexOf('{/* VIEW: GRID */}');

if (daftarStartIndex !== -1 && gridStartIndex !== -1) {
    content = content.substring(0, daftarStartIndex) + newDaftarView + '\n\n              ' + content.substring(gridStartIndex);
} else {
    console.error("View tags not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update success');
