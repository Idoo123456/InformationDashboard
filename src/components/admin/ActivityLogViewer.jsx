import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, RefreshCw, Download, ShieldCheck, 
  User, Calendar, Monitor, FileText, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function ActivityLogViewer() {
  const { isSuperAdmin, currentFacultyPrefix } = useDashboard();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Gagal mengambil audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN_SUKSES')) {
      return { bg: '#dcfce7', color: '#15803d', label: 'Login Sukses' };
    }
    if (act.includes('LOGIN_GAGAL')) {
      return { bg: '#fee2e2', color: '#b91c1c', label: 'Login Gagal' };
    }
    if (act.includes('BROADCAST')) {
      return { bg: '#f3e8ff', color: '#7e22ce', label: 'Broadcast TV' };
    }
    if (act.includes('TV')) {
      return { bg: '#e0e7ff', color: '#3730a3', label: 'Pengaturan TV' };
    }
    if (act.includes('TAMBAH') || act.includes('CREATE')) {
      return { bg: '#dbeafe', color: '#1d4ed8', label: 'Tambah Data' };
    }
    if (act.includes('UBAH') || act.includes('UPDATE')) {
      return { bg: '#fef3c7', color: '#b45309', label: 'Ubah Data' };
    }
    if (act.includes('HAPUS') || act.includes('DELETE')) {
      return { bg: '#fee2e2', color: '#dc2626', label: 'Hapus Data' };
    }
    if (act.includes('UPLOAD')) {
      return { bg: '#ccfbf1', color: '#0f766e', label: 'Unggah Berkas' };
    }
    return { bg: '#f1f5f9', color: '#475569', label: action };
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip_address && log.ip_address.includes(searchTerm));
    
    const matchesFilter = actionFilter === 'ALL' || (log.action || '').toUpperCase().includes(actionFilter);
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Waktu', 'Pengguna', 'Fakultas', 'Aksi', 'Keterangan', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.created_at).toLocaleString('id-ID'),
      `"${l.username || ''}"`,
      `"${l.faculty_prefix || ''}"`,
      `"${l.action || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip_address || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Log_UNRI_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(30, 41, 59, 0.3)'
            }}>
              <ClipboardList size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Log Audit & Aktivitas Kampus
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                Catatan riwayat keamanan transaksi, perubahan pengaturan, dan interaksi pengguna di server
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchLogs}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin-anim' : ''} />
            Segarkan
          </button>

          <button
            onClick={exportToCSV}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: '#059669',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            <Download size={16} />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: '#ffffff',
        padding: '16px 20px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Cari user, aksi, keterangan, atau IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Jenis Aksi:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              background: '#fff',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Semua Aksi</option>
            <option value="LOGIN">Autentikasi / Login</option>
            <option value="TV">Pengaturan & Broadcast TV</option>
            <option value="PENGGUNA">Manajemen Pengguna</option>
            <option value="UPLOAD">Upload Berkas / Media</option>
            <option value="RUANGAN">Master Ruangan</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
          Menampilkan <strong style={{ color: '#0f172a' }}>{filteredLogs.length}</strong> log transaksi
        </div>
      </div>

      {/* Log Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={36} className="spin-anim" style={{ margin: '0 auto 12px', color: '#475569' }} />
            <p>Memuat catatan log aktivitas...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <ClipboardList size={44} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>Tidak ada riwayat aktivitas yang cocok.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Waktu</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Pengguna</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Unit / Fakultas</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Aksi</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Detail Keterangan</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>IP Client</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const dateObj = new Date(log.created_at);
                  const formattedDate = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Waktu */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap', color: '#334155' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{formattedTime} WIB</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formattedDate}</div>
                      </td>

                      {/* Pengguna */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#475569'
                          }}>
                            {(log.username || 'U')[0].toUpperCase()}
                          </div>
                          <strong style={{ color: '#0f172a' }}>{log.username || 'System'}</strong>
                        </div>
                      </td>

                      {/* Fakultas */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {log.faculty_prefix || 'main'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Detail */}
                      <td style={{ padding: '14px 18px', color: '#475569', maxWidth: '340px' }}>
                        <span style={{ wordBreak: 'break-word', fontSize: '0.85rem' }}>
                          {log.details || '-'}
                        </span>
                      </td>

                      {/* IP */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap', color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
