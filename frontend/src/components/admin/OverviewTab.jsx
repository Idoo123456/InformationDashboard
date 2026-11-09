import { LayoutDashboard, LayoutGrid, List, Activity, MonitorPlay, Calendar, MessageSquare, Shield, Image as ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getLocalDateStr, getMonthPrefixStr } from '../../utils/dateUtils';

export default function OverviewTab({
  overviewLayout,
  setOverviewLayout,
  slides,
  schedules,
  computedSchedules,
  isDbConnected,
  setActiveTab
}) {
  const todayStr = getLocalDateStr();
  const thisMonthPrefix = getMonthPrefixStr();

  return (
    <div className="overview-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '100%' }}>
      
      {/* Layout Selector */}
      <div className="overview-layout-bar">
        <h3 className="overview-layout-title">
          <LayoutDashboard size={18} color="#3b82f6"/> Tampilan Dasbor
        </h3>
        <div className="overview-layout-pills">
          <button 
            type="button"
            onClick={() => setOverviewLayout('modern')}
            className={`overview-pill-btn ${overviewLayout === 'modern' ? 'active' : ''}`}
          >
            <LayoutGrid size={15} /> Modern
          </button>
          <button 
            type="button"
            onClick={() => setOverviewLayout('compact')}
            className={`overview-pill-btn ${overviewLayout === 'compact' ? 'active' : ''}`}
          >
            <List size={15} /> Kompak
          </button>
          <button 
            type="button"
            onClick={() => setOverviewLayout('analytics')}
            className={`overview-pill-btn ${overviewLayout === 'analytics' ? 'active' : ''}`}
          >
            <Activity size={15} /> Analitik
          </button>
        </div>
      </div>

      {/* ==============================================
          LAYOUT 1: MODERN (Default) 
          ============================================== */}
      {overviewLayout === 'modern' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          <div className="overview-summary-banner">
            <div className="overview-summary-icon">
              <Activity size={22} />
            </div>
            <div className="overview-summary-text" style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.98rem', fontWeight: 700 }}>Ringkasan Bulan Ini</h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Terdapat <strong>{schedules.filter(s => s.date && s.date.startsWith(thisMonthPrefix)).length} kegiatan</strong> {' '}
                ({schedules.filter(s => s.date && s.date.startsWith(thisMonthPrefix) && (!s.partnerCategory || s.partnerCategory.trim().toLowerCase() === 'internal')).length} Internal, {schedules.filter(s => s.date && s.date.startsWith(thisMonthPrefix) && s.partnerCategory && s.partnerCategory.trim().toLowerCase() !== 'internal').length} Eksternal). 
                Saat ini <strong>{schedules.filter(s => s.status === 'Berlangsung').length} kegiatan</strong> sedang berlangsung.
              </p>
            </div>
          </div>

          <div className="overview-stats-grid">
            <div className="card overview-stat-card">
              <div className="overview-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><MonitorPlay size={22} /></div>
              <div style={{ minWidth: 0 }}>
                <p className="overview-stat-label">Total Slide Aktif</p>
                <h3 className="overview-stat-value">{slides.length}</h3>
              </div>
            </div>
            <div className="card overview-stat-card">
              <div className="overview-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><Calendar size={22} /></div>
              <div style={{ minWidth: 0 }}>
                <p className="overview-stat-label">Kegiatan Hari Ini</p>
                <h3 className="overview-stat-value">{schedules.filter(s => s.date === todayStr).length}</h3>
              </div>
            </div>
            <div className="card overview-stat-card">
              <div className="overview-stat-icon" style={{ background: '#fff7ed', color: '#f59e0b' }}><MessageSquare size={22} /></div>
              <div style={{ minWidth: 0 }}>
                <p className="overview-stat-label">Kegiatan Bulan Ini</p>
                <h3 className="overview-stat-value">{schedules.filter(s => s.date && s.date.startsWith(thisMonthPrefix)).length}</h3>
              </div>
            </div>
            <div className="card overview-stat-card" style={{ background: isDbConnected ? '#ffffff' : '#fef2f2' }}>
              <div className="overview-stat-icon" style={{ background: isDbConnected ? '#f8fafc' : '#fee2e2', color: isDbConnected ? '#10b981' : '#ef4444' }}><Shield size={22} /></div>
              <div style={{ minWidth: 0 }}>
                <p className="overview-stat-label" style={{ color: isDbConnected ? '#64748b' : '#b91c1c' }}>Status Database</p>
                <h3 className="overview-stat-value" style={{ color: isDbConnected ? '#10b981' : '#dc2626', fontSize: '1.05rem' }}>
                  {isDbConnected ? 'MySQL Terhubung' : 'Database Offline'}
                </h3>
              </div>
            </div>
          </div>

          <div className="overview-charts-grid">
            <div className="card overview-chart-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Kegiatan Berdasarkan Status</h3>
              </div>
              <div className="chart-responsive-box" style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length },
                    { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length },
                    { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length },
                    { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length },
                  ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                      {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card overview-chart-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Mitra Kegiatan</h3>
              </div>
              <div className="chart-responsive-box" style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                      {Object.entries(schedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ margin: 0, padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)', background: 'white' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.35rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Akses Cepat</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>Pilih menu di bawah untuk langsung memperbarui konten layar TV.</p>
            </div>
            <div className="overview-quick-access-grid">
              <button type="button" onClick={() => setActiveTab('slides')} className="quick-access-btn" style={{ '--qa-color': '#3b82f6', '--qa-bg': '#eff6ff' }}><ImageIcon size={18} color="#3b82f6" /> Kelola Slide</button>
              <button type="button" onClick={() => setActiveTab('schedules')} className="quick-access-btn" style={{ '--qa-color': '#10b981', '--qa-bg': '#ecfdf5' }}><Calendar size={18} color="#10b981" /> Update Jadwal</button>
              <button type="button" onClick={() => setActiveTab('announcements')} className="quick-access-btn" style={{ '--qa-color': '#f59e0b', '--qa-bg': '#fff7ed' }}><MessageSquare size={18} color="#f59e0b" /> Teks Berjalan</button>
              <button type="button" onClick={() => setActiveTab('reports')} className="quick-access-btn" style={{ '--qa-color': '#8b5cf6', '--qa-bg': '#faf5ff' }}><Activity size={18} color="#8b5cf6" /> Lihat Laporan</button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          LAYOUT 2: COMPACT
          ============================================== */}
      {overviewLayout === 'compact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <div className="compact-stats-grid">
            <div className="card overview-stat-card" style={{ padding: '0.85rem 1rem' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Slide</p><h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>{slides.length}</h3></div>
               <MonitorPlay size={22} color="#3b82f6" />
            </div>
            <div className="card overview-stat-card" style={{ padding: '0.85rem 1rem' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Aktivitas Hari Ini</p><h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>{schedules.filter(s => s.date === todayStr).length}</h3></div>
               <Calendar size={22} color="#10b981" />
            </div>
            <div className="card overview-stat-card" style={{ padding: '0.85rem 1rem' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Bulan Ini</p><h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>{schedules.filter(s => s.date && s.date.startsWith(thisMonthPrefix)).length}</h3></div>
               <MessageSquare size={22} color="#f59e0b" />
            </div>
            <div className="card overview-stat-card" style={{ padding: '0.85rem 1rem', background: isDbConnected ? '#ecfdf5' : '#fef2f2' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: isDbConnected ? '#065f46' : '#991b1b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Database</p><h3 style={{ margin: 0, fontSize: '1.05rem', color: isDbConnected ? '#065f46' : '#dc2626', fontWeight: 800 }}>{isDbConnected ? 'MySQL Aktif' : 'Offline'}</h3></div>
               <Shield size={22} color={isDbConnected ? '#10b981' : '#ef4444'} />
            </div>
          </div>

          <div className="compact-charts-grid">
            <div className="card overview-chart-card" style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 }}>Status Kegiatan</h3>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length }, { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length }, { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length }, { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length }]} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={22}>
                      {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card overview-chart-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 }}>Mitra</h3>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="45%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                      {Object.entries(schedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }} />
                    <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          LAYOUT 3: ANALYTICS
          ============================================== */}
      {overviewLayout === 'analytics' && (
        <div className="analytics-container" style={{ width: '100%' }}>
          <div className="card" style={{ flex: 2, margin: 0, padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)', background: 'white' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>Kinerja Kegiatan</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>Analisis status kegiatan keseluruhan dari jadwal yang tersimpan.</p>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length }, { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length }, { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length }, { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                    {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="analytics-sidebar-cards" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem', margin: 0, border: 'none', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
              <h4 style={{ margin: '0 0 0.35rem 0', fontWeight: 600, fontSize: '0.85rem', opacity: 0.9 }}>Total Kegiatan Selesai</h4>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900 }}>{computedSchedules.filter(s => s.status === 'Selesai').length}</h1>
            </div>
            <div className="card" style={{ padding: '1.25rem', margin: 0, border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)', flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 }}>Distribusi Mitra</h4>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="40%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {Object.entries(schedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}