import React, { useState, useEffect } from 'react';
import { 
  Tv, Plus, Search, ExternalLink, Copy, Check, Trash2, Edit3, 
  MonitorPlay, MapPin, Layout, Palette, RefreshCw, Power, 
  CheckCircle2, Sliders, Info, ShieldCheck, Sparkles, Building2, Radio, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useDashboard, FACULTY_LIST } from '../../context/DashboardContext';
import { PRESET_COLORS, TEMPLATE_LIST } from '../../utils/themeUtils';

export default function TvDeviceManager() {
  const { prefix, currentUser } = useDashboard();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLayout, setFilterLayout] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Otomatis terikat pada akun fakultas yang sedang login / dasbor yang dibuka
  const currentFaculty = currentUser?.faculty_prefix || prefix || 'main';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null); // null = mode tambah baru
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    faculty_prefix: currentFaculty,
    layout: 'standard',
    theme_color: '#1e40af',
    slide_duration: 8,
    marquee_speed: 20,
    custom_announcement: '',
    is_active: 1,
    notes: ''
  });

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tv-devices?faculty=${currentFaculty}`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (err) {
      console.error('Error fetching tv devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [currentFaculty]);

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormData({
      name: '',
      code: '',
      location: '',
      faculty_prefix: currentFaculty,
      layout: 'standard',
      theme_color: '#1e40af',
      slide_duration: 8,
      marquee_speed: 20,
      custom_announcement: '',
      is_active: 1,
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (dev) => {
    setEditingDevice(dev);
    setFormData({
      name: dev.name || '',
      code: dev.code || '',
      location: dev.location || '',
      faculty_prefix: dev.faculty_prefix || currentFaculty,
      layout: dev.layout || 'standard',
      theme_color: dev.theme_color || '#1e40af',
      slide_duration: dev.slide_duration || 8,
      marquee_speed: dev.marquee_speed || 20,
      custom_announcement: dev.custom_announcement || '',
      is_active: dev.is_active ? 1 : 0,
      notes: dev.notes || ''
    });
    setIsModalOpen(true);
  };

  // Simpan Form (Tambah / Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Perhatian', 'Nama TV wajib diisi!', 'warning');
      return;
    }

    try {
      const isEdit = !!editingDevice;
      const url = isEdit ? `/api/tv-devices/${editingDevice.id}` : '/api/tv-devices';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        admin_user: currentUser?.username || 'admin'
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: isEdit ? 'TV Diperbarui!' : 'TV Berhasil Ditambahkan!',
          text: data.message || 'Konfigurasi TV telah tersimpan di database.',
          timer: 2000,
          showConfirmButton: false
        });
        setIsModalOpen(false);
        fetchDevices();
      } else {
        Swal.fire('Gagal Menyimpan', data.error || data.message || 'Terjadi kesalahan sistem.', 'error');
      }
    } catch (err) {
      Swal.fire('Kesalahan Jaringan', err.message, 'error');
    }
  };

  // Hapus TV
  const handleDeleteDevice = (dev) => {
    Swal.fire({
      title: 'Hapus Perangkat TV?',
      html: `Apakah Anda yakin ingin menghapus <strong>"${dev.name}"</strong> (ID: #${dev.id}, Kode: ${dev.code})?<br/><br/><span style="font-size:0.85rem;color:#ef4444;">Perangkat ini tidak akan dapat mengakses display lagi.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus TV',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/tv-devices/${dev.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_user: currentUser?.username || 'admin' })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            Swal.fire({
              icon: 'success',
              title: 'TV Dihapus!',
              text: `Perangkat TV "${dev.name}" telah dihapus.`,
              timer: 1800,
              showConfirmButton: false
            });
            fetchDevices();
          } else {
            Swal.fire('Gagal Menghapus', data.error || 'Terjadi kesalahan', 'error');
          }
        } catch (err) {
          Swal.fire('Kesalahan', err.message, 'error');
        }
      }
    });
  };

  // Toggle Status Aktif Langsung
  const handleToggleStatus = async (dev) => {
    const nextStatus = dev.is_active ? 0 : 1;
    try {
      const res = await fetch(`/api/tv-devices/${dev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: nextStatus,
          admin_user: currentUser?.username || 'admin'
        })
      });
      if (res.ok) {
        setDevices(prev => prev.map(d => d.id === dev.id ? { ...d, is_active: nextStatus } : d));
      }
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  // Salin URL TV ke Clipboard
  const getDeviceUrl = (dev) => {
    const origin = window.location.origin;
    const facPath = (dev.faculty_prefix && dev.faculty_prefix !== 'main') ? `/${dev.faculty_prefix}` : '';
    // Menggunakan format URL bersih: /tv/:code atau /tv/:id
    return `${origin}${facPath}/tv/${dev.code || dev.id}`;
  };

  const handleCopyUrl = (dev) => {
    const fullUrl = getDeviceUrl(dev);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(dev.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Buka URL TV di Tab Baru
  const handleOpenTv = (dev) => {
    const fullUrl = getDeviceUrl(dev);
    window.open(fullUrl, '_blank');
  };

  // Filter daftar TV
  const filteredDevices = devices.filter(dev => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      (dev.name && dev.name.toLowerCase().includes(q)) ||
      (dev.code && dev.code.toLowerCase().includes(q)) ||
      (dev.location && dev.location.toLowerCase().includes(q));

    const matchLayout = filterLayout === 'all' || dev.layout === filterLayout;
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && Boolean(dev.is_active)) || 
      (filterStatus === 'inactive' && !Boolean(dev.is_active));

    return matchSearch && matchLayout && matchStatus;
  });

  const totalActive = devices.filter(d => Boolean(d.is_active)).length;
  const totalStandby = devices.length - totalActive;

  return (
    <div style={{ paddingBottom: '2.5rem' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
              <Tv size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Manajemen Perangkat TV
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Tambahkan, sesuaikan tata letak, dan kelola URL unik layar TV display.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchDevices}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.65rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            title="Muat Ulang Data TV"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Segarkan
          </button>
          <button
            onClick={handleOpenAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '0.65rem', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'transform 0.15s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} /> Tambah TV Baru
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total TV Terdaftar</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{devices.length} Unit</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TV Aktif (Online)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{totalActive} Unit</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: '#f8fafc', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Power size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mode Standby</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748b' }}>{totalStandby} Unit</div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div style={{ background: 'white', borderRadius: '0.85rem', padding: '0.85rem 1.15rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 260px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.6rem', padding: '0.45rem 0.85rem' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Cari nama TV, lokasi gedung, atau kode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem', color: '#1e293b' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            <span>Tata Letak:</span>
            <select
              value={filterLayout}
              onChange={e => setFilterLayout(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#334155', outline: 'none' }}
            >
              <option value="all">Semua Layout</option>
              <option value="standard">Standard (Split)</option>
              <option value="agenda-focus">Fokus Agenda</option>
              <option value="full-media">Full Media</option>
              <option value="tu">Tema Tata Usaha</option>
              <option value="admin">Tema Eksekutif</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#334155', outline: 'none' }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Saja</option>
              <option value="inactive">Standby Saja</option>
            </select>
          </div>
        </div>
      </div>

      {/* TV CARDS GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={32} className="spin" color="#2563eb" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ margin: 0, color: '#334155' }}>Memuat Daftar TV...</h4>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
          <Tv size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '1.25rem' }}>
            {searchQuery ? 'Tidak Ada TV yang Cocok' : 'Belum Ada Perangkat TV'}
          </h3>
          <p style={{ margin: '0 auto 1.25rem auto', color: '#64748b', fontSize: '0.9rem', maxWidth: '400px' }}>
            {searchQuery ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Klik tombol di bawah untuk menambahkan perangkat TV baru ke dalam sistem.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.65rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={16} /> Tambah TV Pertama
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredDevices.map(dev => {
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
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {/* Header Card */}
                <div style={{ padding: '1.15rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', background: '#fafbfc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '0.65rem',
                        background: dev.theme_color || '#1e40af',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Tv size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {dev.name}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '0.35rem', background: '#e0e7ff', color: '#3730a3' }}>
                          ID: #{dev.id}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '0.35rem', background: '#f1f5f9', color: '#475569' }}>
                          Kode: {dev.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Aktif / Nonaktif */}
                  <button
                    onClick={() => handleToggleStatus(dev)}
                    style={{
                      border: 'none',
                      background: isOnline ? '#ecfdf5' : '#f8fafc',
                      color: isOnline ? '#059669' : '#94a3b8',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '2rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      border: `1px solid ${isOnline ? '#a7f3d0' : '#e2e8f0'}`,
                      transition: 'all 0.2s'
                    }}
                    title="Klik untuk mengubah status aktif/standby"
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10b981' : '#cbd5e1' }}></span>
                    {isOnline ? 'Online' : 'Standby'}
                  </button>
                </div>

                {/* Body Card */}
                <div style={{ padding: '1.15rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Lokasi */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                    <MapPin size={16} color="#64748b" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{dev.location || 'Lokasi belum diatur'}</span>
                  </div>

                  {/* Layout & Durasi */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: '0.45rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                      <Layout size={13} color="#2563eb" /> Layout: {dev.layout}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: '0.45rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                      <Clock size={13} color="#f59e0b" /> {dev.slide_duration || 8} detik/slide
                    </span>
                  </div>

                  {/* KOTAK URL UNIK TV */}
                  <div style={{ marginTop: '0.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.65rem 0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        URL Unik Display TV:
                      </span>
                      <button
                        onClick={() => handleCopyUrl(dev)}
                        style={{ background: 'transparent', border: 'none', color: copiedId === dev.id ? '#10b981' : '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.1rem 0.35rem' }}
                      >
                        {copiedId === dev.id ? (
                          <>
                            <Check size={13} /> Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Salin URL
                          </>
                        )}
                      </button>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#1e293b', wordBreak: 'break-all', background: 'white', padding: '0.35rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1' }}>
                      {devUrl}
                    </div>
                  </div>

                  {/* Catatan / Pengumuman Khusus */}
                  {dev.custom_announcement && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.45rem 0.65rem', borderRadius: '0.45rem', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
                      <Info size={14} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: '#92400e' }}><strong>Pengumuman:</strong> {dev.custom_announcement}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Card */}
                <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenTv(dev)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 0.85rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.55rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(16,185,129,0.25)',
                      transition: 'transform 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <ExternalLink size={14} /> Buka Layar TV
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleOpenEditModal(dev)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.55rem',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
                      title="Edit Pengaturan TV"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      onClick={() => handleDeleteDevice(dev)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        background: 'white',
                        border: '1px solid #fecaca',
                        borderRadius: '0.55rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
                      title="Hapus TV Ini"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT TV */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.6rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tv size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {editingDevice ? `Edit Konfigurasi TV #${editingDevice.id}` : 'Tambah Perangkat TV Baru'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    {editingDevice ? 'Sesuaikan nama, lokasi, dan preferensi tampilan TV ini' : 'Daftarkan layar TV baru agar memiliki URL khusus dan target slide'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '0.35rem' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Nama TV */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Nama TV / Layar <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TV 6 - Gedung Kuliah Bersama"
                  value={formData.name}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      name: val,
                      // Jika mode tambah baru dan code belum diedit manual, auto-generate slug
                      code: !editingDevice && !prev.codeEdited ? val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : prev.code
                    }));
                  }}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              {/* Kode / Slug Unik */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Kode / Slug URL Unik <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.55rem', padding: '0 0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>/tv/</span>
                  <input
                    type="text"
                    required
                    placeholder="tv-6"
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'), codeEdited: true }))}
                    style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0.35rem', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#1e40af' }}
                  />
                </div>
                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Kode ini akan menjadi bagian URL unik layar TV (contoh: <code>/tv/{formData.code || 'tv-x'}</code>).
                </small>
              </div>

              {/* Lokasi Gedung */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Lokasi / Penempatan Gedung
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lobi Utama Lantai 1, Gedung Rektorat Bina Widya"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              {/* Grid 2 Kolom: Layout & Durasi Slide */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Tipe Tata Letak (Layout)
                  </label>
                  <select
                    value={formData.layout}
                    onChange={e => setFormData(prev => ({ ...prev, layout: e.target.value }))}
                    className="admin-input"
                    style={{ background: 'white', fontWeight: 600, color: '#2563eb' }}
                  >
                    <option value="standard">Standard (Agenda & Slide)</option>
                    <option value="agenda-focus">Fokus Agenda Utama</option>
                    <option value="full-media">Full Media (Slide 100%)</option>
                    <option value="tu">Tema Tata Usaha</option>
                    <option value="admin">Tema Eksekutif</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Durasi Pergantian Slide
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.55rem', padding: '0 0.75rem' }}>
                    <input
                      type="number"
                      min="3"
                      max="60"
                      value={formData.slide_duration}
                      onChange={e => setFormData(prev => ({ ...prev, slide_duration: Number(e.target.value) }))}
                      style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0.2rem', width: '100%', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}
                    />
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>detik</span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Kolom: Warna Tema & Kecepatan Running Text */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Warna Tema Display
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={formData.theme_color}
                      onChange={e => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                      style={{ width: '40px', height: '38px', borderRadius: '0.5rem', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={formData.theme_color}
                      onChange={e => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                      className="admin-input"
                      style={{ background: 'white', flex: 1, fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Kecepatan Teks Berjalan
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.55rem', padding: '0 0.75rem' }}>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={formData.marquee_speed}
                      onChange={e => setFormData(prev => ({ ...prev, marquee_speed: Number(e.target.value) }))}
                      style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0.2rem', width: '100%', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}
                    />
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>detik</span>
                  </div>
                </div>
              </div>

              {/* Pengumuman Khusus Running Text (Opsional) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Pengumuman Khusus TV Ini (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Isi jika TV ini membutuhkan pesan berjalan khusus (misal: 'Selamat Datang Peserta Seminar di Gedung PKM')"
                  value={formData.custom_announcement}
                  onChange={e => setFormData(prev => ({ ...prev, custom_announcement: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white', resize: 'vertical' }}
                />
              </div>

              {/* Status Aktif Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="tv_is_active"
                  checked={Boolean(formData.is_active)}
                  onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <label htmlFor="tv_is_active" style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  Aktifkan Layar TV Ini (Siap Tayang / Online)
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.6rem', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', borderRadius: '0.6rem', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
                >
                  {editingDevice ? 'Simpan Perubahan' : 'Tambahkan TV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
