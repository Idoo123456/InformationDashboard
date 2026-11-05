import React, { useState, useEffect } from 'react';
import { 
  Tv, Plus, Search, ExternalLink, Copy, Check, Trash2, Edit3, 
  MapPin, Layout, RefreshCw, Power, 
  Info, ShieldCheck, Building2, Radio, Clock, CheckCircle2, XCircle, Send, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useDashboard, FACULTY_LIST } from '../../context/DashboardContext';

export default function TvDeviceManager({ onRequestsUpdated }) {
  const { prefix, currentUser } = useDashboard();
  
  // Tab Level 1: 'devices' atau 'requests'
  const [managerTab, setManagerTab] = useState('devices');

  // State TV Devices
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('all');
  const [filterLayout, setFilterLayout] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // State TV Requests
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');

  // Modal Tambah / Edit TV State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    faculty_prefix: 'main',
    layout: 'standard',
    theme_color: '#1e40af',
    slide_duration: 8,
    marquee_speed: 20,
    custom_announcement: '',
    is_active: 1,
    notes: ''
  });

  // Modal Approval State
  const [approvingRequest, setApprovingRequest] = useState(null);
  const [approvalForm, setApprovalForm] = useState({
    name: '',
    code: '',
    location: '',
    layout: 'standard',
    theme_color: '#1e40af',
    notes: ''
  });

  // Fetch TV Devices (semua atau per fakultas)
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const url = selectedFacultyFilter === 'all' 
        ? '/api/tv-devices' 
        : `/api/tv-devices?faculty=${selectedFacultyFilter}`;
      const res = await fetch(url);
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

  // Fetch TV Requests
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch('/api/tv-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        if (onRequestsUpdated) {
          const pendingCount = data.filter(r => r.status === 'pending').length;
          onRequestsUpdated(pendingCount);
        }
      }
    } catch (err) {
      console.error('Error fetching tv requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [selectedFacultyFilter]);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Buka Modal Tambah TV Baru (Super Admin)
  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormData({
      name: '',
      code: '',
      location: '',
      faculty_prefix: selectedFacultyFilter !== 'all' ? selectedFacultyFilter : 'main',
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

  // Buka Modal Edit TV
  const handleOpenEditModal = (dev) => {
    setEditingDevice(dev);
    setFormData({
      name: dev.name || '',
      code: dev.code || '',
      location: dev.location || '',
      faculty_prefix: dev.faculty_prefix || 'main',
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

  // Simpan Form (Tambah / Edit TV)
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
        admin_user: currentUser?.username || 'superadmin'
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

  // Hapus TV (Hanya Super Admin)
  const handleDeleteDevice = (dev) => {
    Swal.fire({
      title: 'Hapus Perangkat TV?',
      html: `Apakah Anda yakin ingin menghapus <strong>"${dev.name}"</strong> (ID: #${dev.id}, Kode: ${dev.code})?<br/><br/><span style="font-size:0.85rem;color:#ef4444;">Perangkat TV ini akan dihapus permanen dari sistem.</span>`,
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
            body: JSON.stringify({ admin_user: currentUser?.username || 'superadmin' })
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
          admin_user: currentUser?.username || 'superadmin'
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

  // Buka Modal Persetujuan (Approval) Permintaan TV
  const handleOpenApproveModal = (req) => {
    setApprovingRequest(req);
    const generatedSlug = `${req.faculty_prefix}-${req.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
    setApprovalForm({
      name: req.name,
      code: generatedSlug,
      location: req.location || '',
      layout: req.preferred_layout || 'standard',
      theme_color: '#1e40af',
      notes: `Disetujui dari pengajuan #${req.id} oleh ${req.requested_by}`
    });
  };

  // Eksekusi Persetujuan Permintaan
  const handleExecuteApproval = async (e) => {
    e.preventDefault();
    if (!approvingRequest) return;

    try {
      const payload = {
        approved_by: currentUser?.username || 'superadmin',
        name: approvalForm.name.trim(),
        code: approvalForm.code.trim(),
        location: approvalForm.location.trim(),
        layout: approvalForm.layout,
        theme_color: approvalForm.theme_color,
        notes: approvalForm.notes.trim()
      };

      const res = await fetch(`/api/tv-requests/${approvingRequest.id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Pengajuan Disetujui!',
          text: data.message || 'Perangkat TV telah diterbitkan dan langsung aktif.',
          confirmButtonColor: '#2563eb'
        });
        setApprovingRequest(null);
        fetchRequests();
        fetchDevices();
      } else {
        Swal.fire('Gagal Menyetujui', data.error || 'Terjadi kesalahan sistem.', 'error');
      }
    } catch (err) {
      Swal.fire('Kesalahan Jaringan', err.message, 'error');
    }
  };

  // Tolak Permintaan TV
  const handleRejectRequest = (req) => {
    Swal.fire({
      title: 'Tolak Permintaan TV?',
      html: `Apakah Anda yakin ingin menolak pengajuan TV <strong>"${req.name}"</strong> dari fakultas <strong>${req.faculty_prefix.toUpperCase()}</strong>?`,
      input: 'textarea',
      inputLabel: 'Alasan Penolakan (akan dilihat oleh admin fakultas):',
      inputPlaceholder: 'Misal: Slot display gedung tersebut sudah mencukupi atau pertimbangan efisiensi...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Tolak Permintaan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan penolakan wajib diisi agar admin fakultas memahaminya!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/tv-requests/${req.id}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              approved_by: currentUser?.username || 'superadmin',
              admin_notes: result.value
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            Swal.fire('Permintaan Ditolak', 'Permintaan telah ditandai ditolak.', 'info');
            fetchRequests();
          } else {
            Swal.fire('Gagal Menolak', data.error || 'Terjadi kesalahan', 'error');
          }
        } catch (err) {
          Swal.fire('Kesalahan', err.message, 'error');
        }
      }
    });
  };

  // Hapus Riwayat Request
  const handleDeleteRequest = async (id) => {
    try {
      const res = await fetch(`/api/tv-requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Devices
  const filteredDevices = devices.filter(dev => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      (dev.name && dev.name.toLowerCase().includes(q)) ||
      (dev.code && dev.code.toLowerCase().includes(q)) ||
      (dev.location && dev.location.toLowerCase().includes(q)) ||
      (dev.faculty_prefix && dev.faculty_prefix.toLowerCase().includes(q));

    const matchLayout = filterLayout === 'all' || dev.layout === filterLayout;
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && Boolean(dev.is_active)) || 
      (filterStatus === 'inactive' && !Boolean(dev.is_active));

    return matchSearch && matchLayout && matchStatus;
  });

  // Filter Requests
  const filteredRequests = requests.filter(r => {
    if (requestStatusFilter === 'all') return true;
    return r.status === requestStatusFilter;
  });

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const totalActive = devices.filter(d => Boolean(d.is_active)).length;
  const totalStandby = devices.length - totalActive;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* HEADER SECTION (SUPER ADMIN EXCLUSIVE) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.8rem', background: 'linear-gradient(135deg, #1e40af, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 14px rgba(30,64,175,0.25)' }}>
              <Tv size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  Kelola Perangkat TV Kampus
                </h2>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '999px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                  Khusus Super Administrator
                </span>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Kendali penuh penambahan, pengurangan, dan persetujuan TV seluruh fakultas Universitas Riau.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => { fetchDevices(); fetchRequests(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.65rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={15} className={loading || loadingRequests ? 'spin' : ''} /> Segarkan
          </button>
          <button
            onClick={handleOpenAddModal}
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
            <Plus size={18} /> Tambah TV Baru Langsung
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS: DAFTAR TV VS PERMINTAAN FAKULTAS */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setManagerTab('devices')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: managerTab === 'devices' ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-2px',
            fontSize: '0.95rem',
            fontWeight: managerTab === 'devices' ? 800 : 600,
            color: managerTab === 'devices' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Tv size={18} />
          Daftar TV Aktif Kampus
          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '999px', background: managerTab === 'devices' ? '#eff6ff' : '#f1f5f9', color: managerTab === 'devices' ? '#2563eb' : '#64748b', fontWeight: 700 }}>
            {devices.length}
          </span>
        </button>

        <button
          onClick={() => setManagerTab('requests')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: managerTab === 'requests' ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-2px',
            fontSize: '0.95rem',
            fontWeight: managerTab === 'requests' ? 800 : 600,
            color: managerTab === 'requests' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Send size={18} />
          Permintaan TV dari Fakultas
          {pendingRequestsCount > 0 ? (
            <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.55rem', borderRadius: '999px', background: '#ef4444', color: 'white', fontWeight: 800, boxShadow: '0 2px 6px rgba(239,68,68,0.4)' }}>
              {pendingRequestsCount} Baru
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '999px', background: '#f1f5f9', color: '#64748b', fontWeight: 700 }}>
              0
            </span>
          )}
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DAFTAR TV AKTIF KAMPUS */}
      {/* ============================================================== */}
      {managerTab === 'devices' && (
        <>
          {/* STATS OVERVIEW CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tv size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total TV Terdaftar</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{devices.length} Unit</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TV Aktif (Online)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{totalActive} Unit</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: '#f8fafc', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Power size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mode Standby</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748b' }}>{totalStandby} Unit</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '0.85rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setManagerTab('requests')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: pendingRequestsCount > 0 ? '#fef2f2' : '#f8fafc', color: pendingRequestsCount > 0 ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Permintaan Menunggu</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: pendingRequestsCount > 0 ? '#ef4444' : '#0f172a' }}>{pendingRequestsCount} Antrean</div>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
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
              {/* Filter Fakultas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                <Building2 size={15} color="#2563eb" />
                <span>Fakultas:</span>
                <select
                  value={selectedFacultyFilter}
                  onChange={e => setSelectedFacultyFilter(e.target.value)}
                  style={{ padding: '0.4rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', outline: 'none' }}
                >
                  <option value="all">Semua Fakultas & Pusat</option>
                  {FACULTY_LIST.map(f => (
                    <option key={f.prefix} value={f.prefix}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter Layout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                <span>Layout:</span>
                <select
                  value={filterLayout}
                  onChange={e => setFilterLayout(e.target.value)}
                  style={{ padding: '0.4rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#334155', outline: 'none' }}
                >
                  <option value="all">Semua Layout</option>
                  <option value="standard">Standard</option>
                  <option value="agenda-focus">Fokus Agenda</option>
                  <option value="full-media">Full Media</option>
                  <option value="tu">Tata Usaha</option>
                  <option value="admin">Eksekutif</option>
                </select>
              </div>

              {/* Filter Status */}
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
              <h4 style={{ margin: 0, color: '#334155' }}>Memuat Data Perangkat TV...</h4>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <Tv size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '1.25rem' }}>
                {searchQuery ? 'Tidak Ada TV yang Cocok' : 'Belum Ada TV di Fakultas Ini'}
              </h3>
              <p style={{ margin: '0 auto 1.25rem auto', color: '#64748b', fontSize: '0.9rem', maxWidth: '420px' }}>
                Sebagai Super Administrator, Anda dapat langsung menambahkan TV baru untuk fakultas ini.
              </p>
              <button
                onClick={handleOpenAddModal}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <Plus size={16} /> Tambah TV Baru Sekarang
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {filteredDevices.map(dev => {
                const devUrl = getDeviceUrl(dev);
                const isOnline = Boolean(dev.is_active);
                const facInfo = FACULTY_LIST.find(f => f.prefix === dev.faculty_prefix);

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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '0.35rem', background: '#dbeafe', color: '#1e40af' }}>
                              {facInfo?.name?.split('(')[0]?.trim() || dev.faculty_prefix?.toUpperCase()}
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
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10b981' : '#cbd5e1' }} />
                        {isOnline ? 'Online' : 'Standby'}
                      </button>
                    </div>

                    {/* Body Card */}
                    <div style={{ padding: '1.15rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                        <MapPin size={16} color="#64748b" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{dev.location || 'Lokasi belum diatur'}</span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: '0.45rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                          <Layout size={13} color="#2563eb" /> Layout: {dev.layout}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: '0.45rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                          <Clock size={13} color="#f59e0b" /> {dev.slide_duration || 8}s/slide
                        </span>
                      </div>

                      {/* URL Box */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.65rem 0.75rem', marginTop: '0.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                            URL Unik Display:
                          </span>
                          <button
                            onClick={() => handleCopyUrl(dev)}
                            style={{ background: 'transparent', border: 'none', color: copiedId === dev.id ? '#10b981' : '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {copiedId === dev.id ? <><Check size={13} /> Tersalin!</> : <><Copy size={13} /> Salin URL</>}
                          </button>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#1e293b', wordBreak: 'break-all', background: 'white', padding: '0.35rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1' }}>
                          {devUrl}
                        </div>
                      </div>

                      {dev.custom_announcement && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.45rem 0.65rem', borderRadius: '0.45rem', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
                          <Info size={14} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ color: '#92400e' }}><strong>Pengumuman:</strong> {dev.custom_announcement}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions: Super Admin Can Open, Edit, and Delete */}
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
                          cursor: 'pointer'
                        }}
                      >
                        <ExternalLink size={14} /> Buka Layar TV
                      </button>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(dev)}
                          style={{ padding: '0.55rem 0.75rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.55rem', color: '#334155', cursor: 'pointer' }}
                          title="Edit Pengaturan TV"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteDevice(dev)}
                          style={{ padding: '0.55rem 0.75rem', background: 'white', border: '1px solid #fecaca', borderRadius: '0.55rem', color: '#ef4444', cursor: 'pointer' }}
                          title="Hapus Perangkat TV Ini (Khusus Super Admin)"
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
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PERMINTAAN TV DARI FAKULTAS */}
      {/* ============================================================== */}
      {managerTab === 'requests' && (
        <div>
          {/* Header Request */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Daftar Permintaan Penambahan TV dari Fakultas ({requests.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Tinjau, setujui, atau tolak permohonan TV baru yang diajukan oleh admin masing-masing fakultas.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Filter Status:</span>
              <select
                value={requestStatusFilter}
                onChange={e => setRequestStatusFilter(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}
              >
                <option value="all">Semua Status ({requests.length})</option>
                <option value="pending">Menunggu Persetujuan ({pendingRequestsCount})</option>
                <option value="approved">Disetujui ({requests.filter(r => r.status === 'approved').length})</option>
                <option value="rejected">Ditolak ({requests.filter(r => r.status === 'rejected').length})</option>
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: '0 0 0.35rem', color: '#334155', fontSize: '1.15rem' }}>Tidak Ada Permintaan yang Cocok</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                {requestStatusFilter === 'pending' ? 'Bagus! Semua permohonan TV dari fakultas telah ditinjau.' : 'Belum ada data permohonan untuk filter ini.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRequests.map(req => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const facInfo = FACULTY_LIST.find(f => f.prefix === req.faculty_prefix);

                return (
                  <div
                    key={req.id}
                    style={{
                      background: 'white',
                      borderRadius: '1rem',
                      border: isPending ? '1.5px solid #fbbf24' : '1px solid #e2e8f0',
                      padding: '1.25rem',
                      boxShadow: isPending ? '0 4px 16px rgba(245,158,11,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '0.7rem',
                          background: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
                          color: isApproved ? '#10b981' : isPending ? '#d97706' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isApproved ? <CheckCircle2 size={22} /> : isPending ? <Clock size={22} /> : <XCircle size={22} />}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '0.4rem', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                              {facInfo?.name || `Fakultas ${req.faculty_prefix.toUpperCase()}`}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.55rem',
                              borderRadius: '999px',
                              background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                              color: isApproved ? '#15803d' : isPending ? '#b45309' : '#b91c1c'
                            }}>
                              {isApproved ? 'Telah Disetujui' : isPending ? 'Menunggu Review Super Admin' : 'Ditolak'}
                            </span>
                          </div>
                          <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            {req.name}
                          </h4>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
                        <div>Diajukan oleh: <strong style={{ color: '#1e293b' }}>{req.requested_by}</strong></div>
                        <div>{new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</div>
                      </div>
                    </div>

                    {/* Middle Detail Box */}
                    <div style={{ background: '#f8fafc', borderRadius: '0.65rem', padding: '0.85rem 1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#334155' }}>
                        <MapPin size={15} color="#64748b" />
                        <strong>Rencana Penempatan:</strong> {req.location || 'Tidak disertakan'}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#334155' }}>
                        <Layout size={15} color="#64748b" />
                        <strong>Preferensi Layout:</strong> {req.preferred_layout}
                      </div>
                      {req.reason && (
                        <div style={{ marginTop: '0.2rem', color: '#475569', fontStyle: 'italic', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem' }}>
                          <strong>Alasan Kebutuhan:</strong> "{req.reason}"
                        </div>
                      )}
                      {req.admin_notes && (
                        <div style={{ color: isApproved ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                          Catatan Super Admin: {req.admin_notes}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.65rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleRejectRequest(req)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'white',
                              border: '1px solid #fecaca',
                              color: '#ef4444',
                              borderRadius: '0.55rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Tolak Permintaan
                          </button>
                          <button
                            onClick={() => handleOpenApproveModal(req)}
                            style={{
                              padding: '0.5rem 1.25rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '0.55rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <CheckCircle2 size={15} /> Setujui & Buat TV
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            background: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.45rem',
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Hapus Riwayat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL APPROVE PERMINTAAN TV (SUPER ADMIN) */}
      {/* ============================================================== */}
      {approvingRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '0.65rem', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Setujui & Terbitkan Perangkat TV
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Fakultas: <strong>{approvingRequest.faculty_prefix.toUpperCase()}</strong> (Diajukan oleh {approvingRequest.requested_by})
                  </p>
                </div>
              </div>
              <button onClick={() => setApprovingRequest(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteApproval} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Nama TV Resmi <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={approvalForm.name}
                  onChange={e => setApprovalForm(prev => ({ ...prev, name: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Kode / Slug URL Unik <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.55rem', padding: '0 0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>/tv/</span>
                  <input
                    type="text"
                    required
                    value={approvalForm.code}
                    onChange={e => setApprovalForm(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') }))}
                    style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0.35rem', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#1e40af' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Lokasi Gedung / Penempatan TV
                </label>
                <input
                  type="text"
                  value={approvalForm.location}
                  onChange={e => setApprovalForm(prev => ({ ...prev, location: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Tata Letak (Layout)
                  </label>
                  <select
                    value={approvalForm.layout}
                    onChange={e => setApprovalForm(prev => ({ ...prev, layout: e.target.value }))}
                    className="admin-input"
                    style={{ background: 'white', fontWeight: 600, color: '#2563eb' }}
                  >
                    <option value="standard">Standard (Split)</option>
                    <option value="agenda-focus">Fokus Agenda</option>
                    <option value="full-media">Full Media</option>
                    <option value="tu">Tata Usaha</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Warna Tema Display
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={approvalForm.theme_color}
                      onChange={e => setApprovalForm(prev => ({ ...prev, theme_color: e.target.value }))}
                      style={{ width: '40px', height: '38px', borderRadius: '0.5rem', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={approvalForm.theme_color}
                      onChange={e => setApprovalForm(prev => ({ ...prev, theme_color: e.target.value }))}
                      className="admin-input"
                      style={{ background: 'white', flex: 1, fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Catatan Persetujuan
                </label>
                <input
                  type="text"
                  value={approvalForm.notes}
                  onChange={e => setApprovalForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setApprovingRequest(null)}
                  style={{ padding: '0.65rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.6rem', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '0.6rem', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                >
                  Setujui & Terbitkan TV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL TAMBAH / EDIT TV LANGSUNG (SUPER ADMIN) */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
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
                    Super Administrator dapat mendaftarkan TV untuk fakultas mana pun
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Fakultas Pemilik TV */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Fakultas Pemilik TV <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.faculty_prefix}
                  onChange={e => setFormData(prev => ({ ...prev, faculty_prefix: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white', fontWeight: 700, color: '#1e40af' }}
                >
                  {FACULTY_LIST.map(f => (
                    <option key={f.prefix} value={f.prefix}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Nama TV */}
              <div>
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
                      code: !editingDevice && !prev.codeEdited ? val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : prev.code
                    }));
                  }}
                  className="admin-input"
                  style={{ background: 'white' }}
                />
              </div>

              {/* Slug Code */}
              <div>
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
              </div>

              {/* Lokasi */}
              <div>
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

              {/* Layout & Durasi */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Tipe Tata Letak (Layout)
                  </label>
                  <select
                    value={formData.layout}
                    onChange={e => setFormData(prev => ({ ...prev, layout: e.target.value }))}
                    className="admin-input"
                    style={{ background: 'white', fontWeight: 600, color: '#2563eb' }}
                  >
                    <option value="standard">Standard (Split)</option>
                    <option value="agenda-focus">Fokus Agenda</option>
                    <option value="full-media">Full Media</option>
                    <option value="tu">Tata Usaha</option>
                    <option value="admin">Eksekutif</option>
                  </select>
                </div>

                <div>
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

              {/* Warna Tema & Running Text */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
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

                <div>
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

              {/* Pengumuman Khusus */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Pengumuman Khusus TV Ini (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Isi jika TV ini membutuhkan pesan berjalan khusus"
                  value={formData.custom_announcement}
                  onChange={e => setFormData(prev => ({ ...prev, custom_announcement: e.target.value }))}
                  className="admin-input"
                  style={{ background: 'white', resize: 'vertical' }}
                />
              </div>

              {/* Status Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="tv_is_active_super"
                  checked={Boolean(formData.is_active)}
                  onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <label htmlFor="tv_is_active_super" style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  Aktifkan Layar TV Ini (Siap Tayang / Online)
                </label>
              </div>

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
