import { Download, Activity, Filter, Search } from 'lucide-react';

export default function ReportsTab({
  filteredSchedules,
  reportStartDate,
  setReportStartDate,
  reportEndDate,
  setReportEndDate,
  reportStatus,
  setReportStatus,
  reportSearch,
  setReportSearch,
  handleExportCSV,
  facultyName,
  logoUnri
}) {
  return (
    <div className="card">
      <div className="card-header no-print" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Laporan Transkrip Agenda</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-save" onClick={handleExportCSV} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#10b981' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn-save" onClick={() => window.print()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Activity size={16} /> Cetak PDF/Print
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="no-print" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontWeight: 600 }}>
          <Filter size={16} /> <span>Filter Laporan</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Dari Tanggal</label>
            <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="admin-input" />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Sampai Tanggal</label>
            <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="admin-input" />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Status</label>
            <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="admin-input">
              <option value="Semua">Semua Status</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Berlangsung">Berlangsung</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
          <div style={{ flex: '2 1 200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase' }}>Cari Nama Kegiatan</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={16} /></div>
              <input type="text" value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} placeholder="Ketik kata kunci..." className="admin-input" style={{ paddingLeft: '35px' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Menampilkan <strong>{filteredSchedules.length}</strong> kegiatan {reportStartDate && reportEndDate ? `dari ${reportStartDate} hingga ${reportEndDate}` : ''}
        </div>
      </div>

      <div className="print-area">
        <div className="print-header">
          <div className="print-logo-container">
            <img src={logoUnri} alt="Logo" className="print-logo" />
          </div>
          <div className="print-title-container">
            <h2 className="print-title">LAPORAN AGENDA KEGIATAN</h2>
            <p className="print-subtitle">{facultyName}</p>
            <p className="print-date">Periode: {reportStartDate || '-'} s/d {reportEndDate || '-'}</p>
          </div>
        </div>
        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '10%' }}>Tanggal</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '15%' }}>Waktu</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '25%' }}>Nama Kegiatan</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '10%' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '15%' }}>Ruangan</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '10%' }}>PIC</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', width: '15%' }}>Mitra</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '0.75rem' }}>{s.date}</td>
                <td style={{ padding: '0.75rem' }}>{s.startTime} - {s.endTime}</td>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.title}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: s.status === 'Berlangsung' ? '#dcfce7' : s.status === 'Akan Datang' ? '#dbeafe' : s.status === 'Selesai' ? '#f3e8ff' : '#fee2e2',
                    color: s.status === 'Berlangsung' ? '#166534' : s.status === 'Akan Datang' ? '#1e40af' : s.status === 'Selesai' ? '#6b21a8' : '#991b1b'
                  }}>
                    {s.status || 'Akan Datang'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>{s.loc}</td>
                <td style={{ padding: '0.75rem' }}>{s.pic || '-'}</td>
                <td style={{ padding: '0.75rem' }}>{s.partnerCategory || 'Internal'}</td>
              </tr>
            ))}
            {filteredSchedules.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada kegiatan yang cocok dengan filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
