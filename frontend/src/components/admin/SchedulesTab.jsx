import { useState, useEffect } from 'react';
import { List, Calendar, LayoutGrid, Plus, Save, Search, User, Edit, Trash2, ChevronLeft, ChevronRight, Activity, Briefcase, Tv, X } from 'lucide-react';
import { getDynamicStatus, showToastPopup } from '../../utils/adminAlerts';
import { getLocalDateStr } from '../../utils/dateUtils';
import { useDashboard } from '../../context/DashboardContext';
import { DEFAULT_CAMPUS_TVS, fetchCampusTvDevices } from '../../utils/tvDevices';

export default function SchedulesTab({
  localSchedules,
  localScheduleSpeed,
  setLocalScheduleSpeed,
  localScheduleScrollType,
  setLocalScheduleScrollType,
  availableTvs: propTvs,
  handleAddSchedule,
  handleEditSchedule,
  updateSchedule,
  deleteSchedule,
  handleSaveSchedules
}) {
  const { prefix, currentUser } = useDashboard();
  const currentFaculty = currentUser?.faculty_prefix || prefix || 'main';

  const isMainCampus = currentFaculty === 'main';

  // Perangkat TV yang terdaftar di database - default ke daftar TV kampus hanya jika main
  const [availableTvs, setAvailableTvs] = useState(() => (
    propTvs && propTvs.length > 0 ? propTvs : (isMainCampus ? DEFAULT_CAMPUS_TVS : [])
  ));

  // State Modal Target TV
  const [targetModalSchedule, setTargetModalSchedule] = useState(null);
  const [selectedTargetTvs, setSelectedTargetTvs] = useState([]);
  const [isAllTvMode, setIsAllTvMode] = useState(true);

  // Sinkronisasi data TV dari prop parent
  useEffect(() => {
    if (propTvs) {
      setAvailableTvs(propTvs);
    }
  }, [propTvs]);

  // Ambil data TV dari backend
  useEffect(() => {
    fetchCampusTvDevices(currentFaculty).then(data => {
      if (Array.isArray(data)) setAvailableTvs(data);
    });
  }, [currentFaculty]);

  // Buka modal Target TV untuk agenda kegiatan
  const handleOpenTargetModal = (schedule) => {
    fetchCampusTvDevices(currentFaculty).then(data => {
      if (Array.isArray(data)) setAvailableTvs(data);
    });
    setTargetModalSchedule(schedule);
    const currentTargets = schedule.targetTvs || schedule.target_tvs;
    if (!currentTargets || !Array.isArray(currentTargets) || currentTargets.length === 0 || currentTargets.includes('all')) {
      setIsAllTvMode(true);
      setSelectedTargetTvs([]);
    } else {
      setIsAllTvMode(false);
      setSelectedTargetTvs(currentTargets.map(t => String(t)));
    }
  };

  // Simpan Target TV untuk agenda kegiatan
  const handleSaveTargetTvs = () => {
    if (!targetModalSchedule) return;
    const finalTargets = isAllTvMode ? [] : selectedTargetTvs;
    if (updateSchedule) {
      updateSchedule(targetModalSchedule.id, { targetTvs: finalTargets, target_tvs: finalTargets }, null, true);
    }
    setTargetModalSchedule(null);
    showToastPopup('Target tayang kegiatan berhasil disimpan!');
  };

  // Helper render badge target TV pada card kegiatan
  const renderTargetBadge = (schedule) => {
    const targets = schedule.targetTvs || schedule.target_tvs;
    const isGlobal = !targets || !Array.isArray(targets) || targets.length === 0 || targets.includes('all');

    if (isGlobal) {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleOpenTargetModal(schedule); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.55rem',
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

    const names = targets.map(t => {
      const found = availableTvs.find(dev => String(dev.id) === String(t) || String(dev.code) === String(t));
      return found ? (found.code ? found.code.toUpperCase() : `TV ${found.id}`) : `TV ${t}`;
    });

    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleOpenTargetModal(schedule); }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.55rem',
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

  const [scheduleView, setScheduleView] = useState('daftar');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleDateFrom, setScheduleDateFrom] = useState('');
  const [scheduleDateTo, setScheduleDateTo] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const schedulesWithDynamicStatus = localSchedules.map(s => ({ ...s, dynamicStatus: getDynamicStatus(s) }));
  
  const filteredSchedulesView = schedulesWithDynamicStatus.filter(s => {
    const q = scheduleSearch.toLowerCase().trim();
    const matchSearch = !q || 
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.loc && s.loc.toLowerCase().includes(q)) ||
      (s.pic && s.pic.toLowerCase().includes(q)) ||
      (s.partnerCategory && s.partnerCategory.toLowerCase().includes(q));
    const matchDateFrom = !scheduleDateFrom || s.date >= scheduleDateFrom;
    const matchDateTo = !scheduleDateTo || s.date <= scheduleDateTo;
    return matchSearch && matchDateFrom && matchDateTo;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const activeSchedulesList = filteredSchedulesView.filter(s => s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Berlangsung' || s.dynamicStatus === 'Otomatis');
  const historySchedulesList = filteredSchedulesView.filter(s => s.dynamicStatus === 'Selesai' || s.dynamicStatus === 'Dibatalkan').sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
      
      {/* HEADER & TOGGLES */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Jadwal & Agenda</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Kelola semua aktivitas operasional dan jadwal di satu tempat.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: '0.65rem', padding: '0.3rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <button onClick={() => setScheduleView('daftar')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '0.45rem', background: scheduleView === 'daftar' ? '#3b82f6' : 'transparent', color: scheduleView === 'daftar' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}><List size={16} /> Timeline</button>
            <button onClick={() => setScheduleView('kalender')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '0.45rem', background: scheduleView === 'kalender' ? '#3b82f6' : 'transparent', color: scheduleView === 'kalender' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}><Calendar size={16} /> Kalender</button>
            <button onClick={() => setScheduleView('grid')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '0.45rem', background: scheduleView === 'grid' ? '#3b82f6' : 'transparent', color: scheduleView === 'grid' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}><LayoutGrid size={16} /> Kanvas</button>
          </div>
          <button onClick={handleAddSchedule} style={{ padding: '0.75rem 1.35rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.65rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Plus size={17} /> Entri Baru
          </button>
          <button onClick={handleSaveSchedules} style={{ padding: '0.75rem 1.4rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '0.65rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Save size={16} /> Publikasikan ke Layar TV
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>{s.title}</h4>
                      {renderTargetBadge(s)}
                      {s.partnerCategory && s.partnerCategory.trim().toLowerCase() !== 'internal' && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '0.45rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#fff7ed',
                          color: '#c2410c',
                          border: '1px solid #ffedd5',
                          boxShadow: '0 1px 2px rgba(234, 88, 12, 0.08)'
                        }}>
                          <Briefcase size={12} color="#ea580c" /> {s.partnerCategory}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14}/> {s.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><LayoutGrid size={14}/> {s.loc || '-'}</span>
                      {s.pic && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14}/> {s.pic}</span>}
                      {(!s.partnerCategory || s.partnerCategory.trim().toLowerCase() === 'internal') && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                          <Briefcase size={12} /> Internal (UNRI)
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ width: '130px', textAlign: 'center' }}>
                     <span style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: s.dynamicStatus === 'Berlangsung' ? '#ecfdf5' : '#eff6ff', color: s.dynamicStatus === 'Berlangsung' ? '#059669' : '#2563eb', border: `1px solid ${s.dynamicStatus === 'Berlangsung' ? '#a7f3d0' : '#bfdbfe'}`, display: 'inline-block' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: '#334155', fontWeight: 600 }}>{s.title}</h4>
                        {renderTargetBadge(s)}
                        {s.partnerCategory && s.partnerCategory.trim().toLowerCase() !== 'internal' && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ea580c', background: '#fff7ed', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            Mitra: {s.partnerCategory}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.loc} {s.pic ? `• ${s.pic}` : ''}</div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: s.dynamicStatus === 'Berlangsung' ? '#10b981' : s.dynamicStatus === 'Akan Datang' || s.dynamicStatus === 'Otomatis' ? '#3b82f6' : s.dynamicStatus === 'Selesai' ? '#94a3b8' : '#ef4444', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {s.dynamicStatus}
                  </span>
                  {renderTargetBadge(s)}
                </div>
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
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const daySchedules = localSchedules.filter(s => s.date === dateStr);
              const isToday = getLocalDateStr() === dateStr;

              return (
                <div key={day} style={{ padding: '0.75rem', minHeight: '140px', background: isToday ? '#f0fdf4' : 'white', display: 'flex', flexDirection: 'column', transition: 'background 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: isToday ? '#16a34a' : '#1e293b', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isToday ? '#dcfce7' : 'transparent' }}>
                      {day}
                    </span>
                    {daySchedules.length > 0 && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{daySchedules.length} Event</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', maxHeight: '110px' }}>
                    {daySchedules.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => handleEditSchedule(s)}
                        style={{ padding: '0.35rem 0.5rem', background: '#eff6ff', borderRadius: '0.4rem', borderLeft: '3px solid #3b82f6', cursor: 'pointer', transition: 'transform 0.1s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{s.startTime} • {s.loc || 'Ruangan -'}</div>
                        <div style={{ fontSize: '0.62rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '2px' }}>
                          <Tv size={10} /> {(!s.targetTvs || s.targetTvs.length === 0 || s.targetTvs.includes('all')) ? 'Semua TV' : `${s.targetTvs.length} TV`}
                        </div>
                        {s.partnerCategory && s.partnerCategory.trim().toLowerCase() !== 'internal' && (
                          <div style={{ fontSize: '0.62rem', color: '#ea580c', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            🏢 {s.partnerCategory}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DOCKED SPEED & PUBLISH FOOTER */}
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
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <label style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>Mode Gulir TV:</label>
            <select
              value={localScheduleScrollType}
              onChange={(e) => setLocalScheduleScrollType(e.target.value)}
              className="admin-input"
              style={{ margin: 0, padding: '0.45rem 0.85rem', borderRadius: '0.5rem', fontWeight: 600, background: '#f8fafc', fontSize: '0.85rem' }}
            >
              <option value="step">Halaman Berganti / Bertahap (Step)</option>
              <option value="continuous">Mengalir Halus / Marquee (Continuous)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <label style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>Kecepatan TV:</label>
            <input 
              type="number" 
              value={localScheduleSpeed} 
              onChange={(e) => setLocalScheduleSpeed(Number(e.target.value))} 
              className="admin-input"
              min="0.1"
              max="5"
              step="0.1"
              style={{ width: '70px', padding: '0.45rem', margin: 0, borderRadius: '0.5rem', textAlign: 'center', fontWeight: 700, background: '#f8fafc' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              {localScheduleScrollType === 'step' 
                ? `(Jeda ±${Math.round(4.5 / (localScheduleSpeed || 1) * 10) / 10}s)` 
                : `(±${Math.round(30 * (localScheduleSpeed || 1))} px/s)`}
            </span>
          </div>
        </div>

        <button
          onClick={handleSaveSchedules}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            background: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '0.65rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
            transition: 'all 0.2s',
            marginLeft: 'auto'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Save size={16} /> Publikasikan ke Layar TV
        </button>
      </div>

      {/* MODAL TARGET DISPLAY TV */}
      {targetModalSchedule && (
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
                    Target Display TV — Agenda Kegiatan
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Tentukan pada layar TV mana saja kegiatan ini akan ditampilkan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTargetModalSchedule(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Ringkasan Kegiatan */}
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.65rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '6px', height: '36px', borderRadius: '4px', background: '#2563eb' }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    📅 {targetModalSchedule.date} • ⏰ {targetModalSchedule.startTime} - {targetModalSchedule.endTime}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {targetModalSchedule.title}
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
                    name="schedule_modal_tv_mode"
                    checked={isAllTvMode}
                    onChange={() => setIsAllTvMode(true)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isAllTvMode ? '#1e40af' : '#1e293b' }}>
                      {isMainCampus 
                        ? '🌐 Tampilkan di Seluruh Layar TV (Global)' 
                        : `🌐 Tampilkan di Seluruh Layar TV Fakultas (${currentFaculty.toUpperCase()})`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isAllTvMode ? '#3b82f6' : '#64748b' }}>
                      {isMainCampus 
                        ? 'Kegiatan ini akan otomatis tayang di setiap layar TV kampus tanpa batasan (default).' 
                        : `Kegiatan ini akan otomatis tayang di seluruh layar TV fakultas ${currentFaculty.toUpperCase()} (default).`}
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
                    name="schedule_modal_tv_mode"
                    checked={!isAllTvMode}
                    onChange={() => setIsAllTvMode(false)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: !isAllTvMode ? '#1e40af' : '#1e293b' }}>
                      {isMainCampus 
                        ? '🎯 Tampilkan Hanya di TV Tertentu (Contoh: TV 1, TV 3)' 
                        : `🎯 Tampilkan Hanya di TV Tertentu (${currentFaculty.toUpperCase()})`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: !isAllTvMode ? '#3b82f6' : '#64748b' }}>
                      {isMainCampus 
                        ? 'Pilih satu atau beberapa TV khusus untuk menayangkan kegiatan ini.' 
                        : `Pilih satu atau beberapa TV khusus milik fakultas ${currentFaculty.toUpperCase()} untuk menayangkan kegiatan ini.`}
                    </div>
                  </div>
                </div>
              </div>

              {/* LIST TV CHECKBOXES */}
              {!isAllTvMode && (
                <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      Pilih Layar TV Target ({isMainCampus ? 'Kampus Pusat' : currentFaculty.toUpperCase()}):
                    </span>
                    {availableTvs.length > 0 && (
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
                    )}
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#fafbfc' }}>
                    {availableTvs.length === 0 ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: '#b45309', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                        ⚠️ Belum ada perangkat TV yang terdaftar / disetujui untuk unit <strong>{currentFaculty.toUpperCase()}</strong>.<br />
                        Silakan ajukan penambahan TV di menu <strong>Layar TV & Pengajuan</strong>.
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
                onClick={() => setTargetModalSchedule(null)}
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
