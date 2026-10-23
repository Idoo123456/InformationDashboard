import { LayoutDashboard, LayoutGrid, List, Activity, MonitorPlay, Calendar, MessageSquare, Shield, Image as ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function OverviewTab({
  overviewLayout,
  setOverviewLayout,
  slides,
  schedules,
  computedSchedules,
  isDbConnected,
  setActiveTab
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Layout Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={18} color="#3b82f6"/> Tampilan Dasbor
        </h3>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.25rem' }}>
          <button 
            onClick={() => setOverviewLayout('modern')}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, background: overviewLayout === 'modern' ? 'white' : 'transparent', color: overviewLayout === 'modern' ? '#3b82f6' : '#64748b', border: 'none', cursor: 'pointer', boxShadow: overviewLayout === 'modern' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <LayoutGrid size={16} /> Modern
          </button>
          <button 
            onClick={() => setOverviewLayout('compact')}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, background: overviewLayout === 'compact' ? 'white' : 'transparent', color: overviewLayout === 'compact' ? '#3b82f6' : '#64748b', border: 'none', cursor: 'pointer', boxShadow: overviewLayout === 'compact' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <List size={16} /> Kompak
          </button>
          <button 
            onClick={() => setOverviewLayout('analytics')}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, background: overviewLayout === 'analytics' ? 'white' : 'transparent', color: overviewLayout === 'analytics' ? '#3b82f6' : '#64748b', border: 'none', cursor: 'pointer', boxShadow: overviewLayout === 'analytics' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Activity size={16} /> Analitik
          </button>
        </div>
      </div>

      {/* ==============================================
          LAYOUT 1: MODERN (Default) 
          ============================================== */}
      {overviewLayout === 'modern' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: 'linear-gradient(to right, #eff6ff, #ffffff)', borderLeft: '4px solid #3b82f6', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
            <div style={{ padding: '0.75rem', background: '#3b82f6', borderRadius: '50%', color: 'white' }}>
              <Activity size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1rem' }}>Ringkasan Bulan Ini</h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                Terdapat <strong>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length} kegiatan</strong> {' '}
                ({schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-')) && s.partnerCategory === 'Internal').length} Internal, {schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-')) && s.partnerCategory === 'Eksternal').length} Eksternal). 
                Saat ini <strong>{schedules.filter(s => s.status === 'Berlangsung').length} kegiatan</strong> sedang berlangsung.
              </p>
            </div>
          </div>

          <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MonitorPlay size={24} /></div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Slide Aktif</p>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }}>{slides.length}</h3>
              </div>
            </div>
            <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={24} /></div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Kegiatan Hari Ini</p>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }}>{schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</h3>
              </div>
            </div>
            <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={24} /></div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Kegiatan Bulan Ini</p>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }}>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length}</h3>
              </div>
            </div>
            <div className="card" style={{ margin: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', background: isDbConnected ? '#ffffff' : '#fef2f2' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isDbConnected ? '#f8fafc' : '#fee2e2', color: isDbConnected ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={24} /></div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', color: isDbConnected ? '#64748b' : '#b91c1c', fontSize: '0.875rem', fontWeight: 500 }}>Status Database</p>
                <h3 style={{ margin: 0, color: isDbConnected ? '#10b981' : '#dc2626', fontSize: '1.1rem', fontWeight: 700 }}>
                  {isDbConnected ? 'MySQL Terhubung' : 'Database Offline'}
                </h3>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Kegiatan Berdasarkan Status</h3>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length },
                    { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length },
                    { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length },
                    { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length },
                  ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
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
            <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Mitra Kegiatan</h3>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
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
          
          <div className="card" style={{ margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Akses Cepat</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Pilih menu di bawah untuk langsung memperbarui konten layar TV.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <button onClick={() => setActiveTab('slides')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><ImageIcon size={20} color="#3b82f6" /> Kelola Slide</button>
              <button onClick={() => setActiveTab('schedules')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#a7f3d0'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><Calendar size={20} color="#10b981" /> Update Jadwal</button>
              <button onClick={() => setActiveTab('announcements')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fed7aa'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><MessageSquare size={20} color="#f59e0b" /> Teks Berjalan</button>
              <button onClick={() => setActiveTab('reports')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.borderColor = '#e9d5ff'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}><Activity size={20} color="#8b5cf6" /> Lihat Laporan</button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          LAYOUT 2: COMPACT
          ============================================== */}
      {overviewLayout === 'compact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Slide</p><h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{slides.length}</h3></div>
               <MonitorPlay size={24} color="#3b82f6" />
            </div>
            <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Aktivitas Hari Ini</p><h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</h3></div>
               <Calendar size={24} color="#10b981" />
            </div>
            <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Bulan Ini</p><h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{schedules.filter(s => s.date.startsWith(new Date().toISOString().split('-').slice(0,2).join('-'))).length}</h3></div>
               <MessageSquare size={24} color="#f59e0b" />
            </div>
            <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: 'none', background: isDbConnected ? '#ecfdf5' : '#fef2f2' }}>
               <div><p style={{ margin: '0 0 0.2rem 0', color: isDbConnected ? '#065f46' : '#991b1b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Database</p><h3 style={{ margin: 0, fontSize: '1.15rem', color: isDbConnected ? '#065f46' : '#dc2626', fontWeight: 700 }}>{isDbConnected ? 'MySQL Aktif' : 'Offline'}</h3></div>
               <Shield size={24} color={isDbConnected ? '#10b981' : '#ef4444'} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem', margin: 0, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem' }}>Status Kegiatan</h3>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length }, { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length }, { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length }, { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length }]} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                      {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1rem', margin: 0, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem' }}>Mitra</h3>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="45%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="card" style={{ flex: 2, margin: 0, padding: '2rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Kinerja Kegiatan</h2>
                <p style={{ color: '#64748b', margin: 0 }}>Analisis status kegiatan keseluruhan dari jadwal yang tersimpan.</p>
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Akan Datang', count: computedSchedules.filter(s => s.status === 'Akan Datang').length }, { name: 'Berlangsung', count: computedSchedules.filter(s => s.status === 'Berlangsung').length }, { name: 'Selesai', count: computedSchedules.filter(s => s.status === 'Selesai').length }, { name: 'Dibatalkan', count: computedSchedules.filter(s => s.status === 'Dibatalkan').length }]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 13 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                      {[{ name: 'Akan Datang' }, { name: 'Berlangsung' }, { name: 'Selesai' }, { name: 'Dibatalkan' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Akan Datang' ? '#3b82f6' : entry.name === 'Berlangsung' ? '#10b981' : entry.name === 'Selesai' ? '#8b5cf6' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 500, opacity: 0.9 }}>Total Kegiatan Selesai</h4>
                <h1 style={{ margin: 0, fontSize: '3rem' }}>{computedSchedules.filter(s => s.status === 'Selesai').length}</h1>
              </div>
              <div className="card" style={{ padding: '1.5rem', margin: 0, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Distribusi Mitra</h4>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(computedSchedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="40%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {Object.entries(schedules.reduce((acc, curr) => { const cat = curr.partnerCategory || 'Internal'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
