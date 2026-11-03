import React, { useState, useEffect } from 'react';
import { 
  Tv, Plus, ExternalLink, Copy, Check, Clock, MapPin, 
  Layout, Info, Send, AlertCircle, CheckCircle2, XCircle, RefreshCw, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useDashboard, FACULTY_LIST } from '../../context/DashboardContext';

export default function FacultyTvView() {
  const { prefix, currentUser } = useDashboard();
  const currentFaculty = currentUser?.faculty_prefix || prefix || 'main';

  const [devices, setDevices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Modal Request State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqForm, setReqForm] = useState({
    name: '',
    location: '',
    preferred_layout: 'standard',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Nama fakultas lengkap
  const facultyObj = FACULTY_LIST.find(f => f.prefix === currentFaculty);
  const facultyName = facultyObj?.name || `Fakultas ${currentFaculty.toUpperCase()}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDev, resReq] = await Promise.all([
        fetch(`/api/tv-devices?faculty=${currentFaculty}`),
        fetch(`/api/tv-requests?faculty=${currentFaculty}`)
      ]);

      if (resDev.ok) {
        const devData = await resDev.json();
        setDevices(devData);
      }
      if (resReq.ok) {
        const reqData = await resReq.json();
        setRequests(reqData);
      }
    } catch (err) {
      console.error('Error fetching faculty TV data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentFaculty]);

  // URL Display TV
  const getDeviceUrl = (dev) => {
    const origin = window.location.origin;
    const facPath = (dev.faculty_prefix && dev.faculty_prefix !== 'main') ? `/${dev.faculty_prefix}` : '';
    return `${origin}${facPath}/tv/${dev.code || dev.id}`;
  };

  const handleCopyUrl = (dev) => {
    const fullUrl = getDeviceUrl(dev);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(dev.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenTv = (dev) => {
    const fullUrl = getDeviceUrl(dev);
    window.open(fullUrl, '_blank');
  };

  // Submit Pengajuan TV Baru
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!reqForm.name.trim()) {
      Swal.fire('Perhatian', 'Nama TV yang diajukan wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        faculty_prefix: currentFaculty,
        requested_by: currentUser?.username || 'admin_fakultas',
        name: reqForm.name.trim(),
        location: reqForm.location.trim(),
        preferred_layout: reqForm.preferred_layout,
        reason: reqForm.reason.trim()
      };

      const res = await fetch('/api/tv-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Permintaan Terkirim!',
          html: `Pengajuan penambahan TV <strong>"${reqForm.name}"</strong> telah otomatis dikirimkan ke <strong>Super Administrator</strong> untuk ditinjau dan disetujui.`,
          confirmButtonColor: '#2563eb'
        });
        setIsRequestModalOpen(false);
        setReqForm({
          name: '',
          location: '',
          preferred_layout: 'standard',
          reason: ''
        });
        fetchData();
      } else {
        Swal.fire('Gagal Mengajukan', data.error || 'Terjadi kesalahan pada sistem.', 'error');
      }
    } catch (err) {
      Swal.fire('Kesalahan Jaringan', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.8rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>
              <Tv size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Perangkat TV Display {facultyName}
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Pantau layar TV resmi fakultas Anda atau ajukan unit TV baru ke Super Administrator.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchData}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.65rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Segarkan
          </button>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              transition: 'transform 0.15s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Send size={16} /> Ajukan Tambah TV Baru
          </button>
        </div>
      </div>

      {/* POLICY NOTICE BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
        border: '1.5px solid #bfdbfe',
        borderRadius: '0.85rem',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(37,99,235,0.06)'
      }}>
        <div style={{ background: '#2563eb', color: 'white', borderRadius: '50%', padding: '0.35rem', display: 'flex', flexShrink: 0, marginTop: '2px' }}>
          <ShieldCheck size={16} />
        </div>
        <div style={{ flex: 1, fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5 }}>
          <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.15rem' }}>
            Kebijakan Perangkat TV Digital Signage Terpusat
          </strong>
          Penambahan dan pengurangan (penghapusan) unit TV display di seluruh lingkungan kampus dikelola secara terpusat oleh <strong>Super Administrator</strong>. Jika fakultas Anda membutuhkan unit TV display baru di gedung atau ruangan tertentu, silakan klik tombol <strong>"Ajukan Tambah TV Baru"</strong>. Permintaan Anda akan otomatis masuk ke Super Admin untuk diterbitkan.
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TV Fakultas Aktif</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{devices.length} Unit</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Siap Tayang (Online)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{devices.filter(d => Boolean(d.is_active)).length} Unit</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pengajuan Menunggu</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>{pendingRequests.length} Permintaan</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: DAFTAR TV RESMI FAKULTAS */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Daftar Layar TV Fakultas ({devices.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Tersinkronisasi otomatis dengan server
          </span>
        </div>

        {devices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <Tv size={44} color="#cbd5e1" style={{ margin: '0 auto 0.85rem' }} />
            <h4 style={{ margin: '0 0 0.4rem', color: '#334155', fontSize: '1.1rem' }}>Belum Ada Perangkat TV Khusus Fakultas</h4>
            <p style={{ margin: '0 auto 1.25rem', color: '#64748b', fontSize: '0.88rem', maxWidth: '460px' }}>
              Saat ini fakultas Anda belum memiliki TV khusus yang terdaftar. Layar display TV saat ini menggunakan tampilan TV Utama. Silakan klik tombol di bawah untuk mengajukan unit TV baru.
            </p>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Send size={16} /> Ajukan TV Pertama Sekarang
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
            {devices.map(dev => {
              const devUrl = getDeviceUrl(dev);
              const isOnline = Boolean(dev.is_active);

              return (
                <div
                  key={dev.id}
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fafbfc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '0.6rem', background: dev.theme_color || '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tv size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{dev.name}</h4>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '0.3rem', background: '#e0e7ff', color: '#3730a3' }}>
                            ID: #{dev.id}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '0.3rem', background: '#f1f5f9', color: '#475569' }}>
                            Kode: {dev.code}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '2rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: isOnline ? '#ecfdf5' : '#f8fafc',
                      color: isOnline ? '#059669' : '#94a3b8',
                      border: `1px solid ${isOnline ? '#a7f3d0' : '#e2e8f0'}`
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? '#10b981' : '#cbd5e1' }} />
                      {isOnline ? 'Online' : 'Standby'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#475569' }}>
                      <MapPin size={15} color="#64748b" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{dev.location || 'Lokasi belum diatur'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                        <Layout size={12} color="#2563eb" /> Layout: {dev.layout}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                        <Clock size={12} color="#f59e0b" /> {dev.slide_duration || 8}s/slide
                      </span>
                    </div>

                    {/* URL Display */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.55rem', padding: '0.5rem 0.65rem', marginTop: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>URL Display TV:</span>
                        <button
                          onClick={() => handleCopyUrl(dev)}
                          style={{ background: 'transparent', border: 'none', color: copiedId === dev.id ? '#10b981' : '#2563eb', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          {copiedId === dev.id ? <><Check size={12} /> Tersalin!</> : <><Copy size={12} /> Salin URL</>}
                        </button>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#1e293b', wordBreak: 'break-all', background: 'white', padding: '0.25rem 0.45rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1' }}>
                        {devUrl}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                      Dikelola oleh Super Admin
                    </span>
                    <button
                      onClick={() => handleOpenTv(dev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.85rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={13} /> Buka Layar TV
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: RIWAYAT PENGAJUAN TV KE SUPER ADMIN */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Riwayat Pengajuan Penambahan TV ({requests.length})
          </h3>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={15} /> Buat Pengajuan Baru
          </button>
        </div>

        {requests.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '0.85rem', border: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Belum ada riwayat permohonan TV dari fakultas Anda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {requests.map(req => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  style={{
                    background: 'white',
                    borderRadius: '0.85rem',
                    border: '1px solid #e2e8f0',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: '1 1 320px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '0.65rem',
                      background: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
                      color: isApproved ? '#10b981' : isPending ? '#f59e0b' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isApproved ? <CheckCircle2 size={20} /> : isPending ? <Clock size={20} /> : <XCircle size={20} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          {req.name}
                        </h4>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '999px',
                          background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                          color: isApproved ? '#15803d' : isPending ? '#b45309' : '#b91c1c'
                        }}>
                          {isApproved ? 'Disetujui & Diterbitkan' : isPending ? 'Menunggu Persetujuan Super Admin' : 'Ditolak'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
                        <strong>Lokasi:</strong> {req.location || 'Tidak ditentukan'} • <strong>Layout:</strong> {req.preferred_layout}
                      </div>

                      {req.reason && (
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem', fontStyle: 'italic' }}>
                          "{req.reason}"
                        </div>
                      )}

                      {req.admin_notes && (
                        <div style={{ fontSize: '0.78rem', color: isApproved ? '#15803d' : '#b91c1c', marginTop: '0.35rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '0.35rem', border: '1px solid #e2e8f0' }}>
                          <strong>Catatan Super Admin:</strong> {req.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <div>Diajukan pada:</div>
                    <div style={{ fontWeight: 600, color: '#64748b' }}>
                      {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL FORM PENGAJUAN TV BARU */}
      {isRequestModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.6rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Ajukan Penambahan Layar TV
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Permintaan akan dikirimkan langsung ke Super Administrator untuk disetujui.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsRequestModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Fakultas Pemohon
                </label>
                <input
                  type="text"
                  disabled
                  value={facultyName}
                  className="admin-input"
                  style={{ background: '#f8fafc', color: '#64748b', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Nama TV / Display yang Diinginkan <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TV 2 - Lobi Gedung Dekanat Lantai 1"
                  value={reqForm.name}
                  onChange={e => setReqForm(prev => ({ ...prev, name: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Rencana Lokasi Penempatan Fisik TV <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gedung Dekanat FKIP Lt. 1 Depan Ruang Pengajaran"
                  value={reqForm.location}
                  onChange={e => setReqForm(prev => ({ ...prev, location: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Preferensi Tampilan (Layout)
                </label>
                <select
                  value={reqForm.preferred_layout}
                  onChange={e => setReqForm(prev => ({ ...prev, preferred_layout: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white', fontWeight: 600, color: '#2563eb' }}
                >
                  <option value="standard">Standard (Split Agenda & Slide)</option>
                  <option value="agenda-focus">Fokus Agenda Utama</option>
                  <option value="full-media">Full Media (Slide 100%)</option>
                  <option value="tu">Tata Usaha & Pelayanan</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Alasan / Kebutuhan Penambahan TV
                </label>
                <textarea
                  rows="3"
                  placeholder="Jelaskan kebutuhan penambahan TV ini (misal: 'Dibutuhkan untuk menampilkan jadwal ujian skripsi dan pengumuman dekanat untuk mahasiswa')"
                  value={reqForm.reason}
                  onChange={e => setReqForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.6rem', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', borderRadius: '0.6rem', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <Send size={15} /> {submitting ? 'Mengirim...' : 'Kirim Permintaan ke Super Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

