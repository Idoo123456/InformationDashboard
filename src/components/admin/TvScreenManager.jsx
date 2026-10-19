import React, { useState, useEffect } from 'react';
import { Tv, Radio, MonitorPlay, ExternalLink, Copy, Check, Sparkles, Power, Layout, Building2, Palette, RefreshCw, Sliders, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { FACULTY_LIST } from '../../context/DashboardContext';
import { PRESET_COLORS, TEMPLATE_LIST } from '../../utils/themeUtils';

export default function TvScreenManager() {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1); // 1, 2, 3
  const [copiedId, setCopiedId] = useState(null);

  // Form Individual TV state
  const [currentTv, setCurrentTv] = useState({
    name: '',
    location: '',
    faculty_prefix: 'main',
    layout: 'standard',
    theme_color: '#1e40af',
    is_active: 1,
    custom_announcement: ''
  });

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    faculty_prefix: 'main',
    layout: 'standard',
    theme_color: '#1e40af',
    is_active: true,
    custom_announcement: ''
  });

  const fetchScreens = async () => {
    try {
      const res = await fetch('/api/tv-screens');
      if (res.ok) {
        const data = await res.json();
        setScreens(data);
        const active = data.find(s => s.id === activeTab) || data[0];
        if (active) {
          setCurrentTv({
            name: active.name,
            location: active.location,
            faculty_prefix: active.faculty_prefix,
            layout: active.layout,
            theme_color: active.theme_color,
            is_active: active.is_active,
            custom_announcement: active.custom_announcement || ''
          });
        }
      }
    } catch (err) {
      console.error('Error fetching tv screens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    const target = screens.find(s => s.id === tabId);
    if (target) {
      setCurrentTv({
        name: target.name,
        location: target.location,
        faculty_prefix: target.faculty_prefix,
        layout: target.layout,
        theme_color: target.theme_color,
        is_active: target.is_active,
        custom_announcement: target.custom_announcement || ''
      });
    }
  };

  // Simpan pengaturan 1 TV individual
  const handleSaveIndividual = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tv-screens/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTv)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Pengaturan TV ${activeTab} berhasil disimpan! Layar TV akan langsung terupdate otomatis.`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchScreens();
      } else {
        Swal.fire('Gagal', data.message || 'Gagal menyimpan pengaturan TV.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal menghubungi server backend.', 'error');
    }
  };

  // Broadcast ke SEMUA 3 TV sekaligus
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tv-screens/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Sinkronisasi Berhasil!',
          text: 'Pengaturan berhasil disiarkan dan diterapkan serentak ke seluruh 3 TV Pusat!',
          timer: 2500,
          showConfirmButton: false
        });
        setIsBroadcastModalOpen(false);
        fetchScreens();
      } else {
        Swal.fire('Gagal', data.message || 'Gagal menerapkan pengaturan massal.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal menghubungi server backend.', 'error');
    }
  };

  const handleCopyLink = (screenId) => {
    const url = `${window.location.origin}/tv?screen=${screenId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(screenId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLayoutLabel = (layoutId) => {
    switch (layoutId) {
      case 'standard': return 'Standard (Sidebar & Slider)';
      case 'agenda-focus': return 'Fokus Agenda (Hero Left)';
      case 'full-media': return 'Full Media (Layar Penuh)';
      case 'tu': return 'Tema Tata Usaha (2 Slide)';
      case 'admin': return 'Tema Eksekutif Admin';
      default: return layoutId;
    }
  };

  const getFacultyName = (prefix) => {
    const f = FACULTY_LIST.find(item => item.prefix === prefix);
    return f ? f.name : prefix.toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Card with Broadcast CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '1.75rem 2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Tv size={24} color="#60a5fa" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Manajemen 3 Layar TV Pusat</h2>
          </div>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>
            Kelola tampilan 3 monitor TV display di lingkungan rektorat & perpustakaan. Anda dapat mengubah satu per satu atau menyinkronkan sekaligus semua.
          </p>
        </div>

        <button
          onClick={() => setIsBroadcastModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.25)',
            padding: '0.75rem 1.4rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
            transition: 'all 0.2s'
          }}
        >
          <Radio size={20} /> Ubah Sekaligus Semua TV (Broadcast)
        </button>
      </div>

      {/* 3 TV Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
        {[1, 2, 3].map((num) => {
          const screen = screens.find(s => s.id === num) || {
            id: num,
            name: `TV Pusat ${num}`,
            location: `Lokasi TV ${num}`,
            layout: 'standard',
            faculty_prefix: 'main',
            theme_color: '#1e40af',
            is_active: 1
          };
          const isActive = Number(screen.is_active) === 1;

          return (
            <div
              key={num}
              style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: activeTab === num ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                boxShadow: activeTab === num ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '0.5rem',
                    background: screen.theme_color || '#1e40af',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Tv size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b' }}>{screen.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{screen.location}</span>
                  </div>
                </div>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: isActive ? '#ecfdf5' : '#fef2f2',
                  color: isActive ? '#059669' : '#dc2626',
                  border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#059669' : '#dc2626' }}></span>
                  {isActive ? 'Aktif' : 'Standby'}
                </span>
              </div>

              {/* Specs */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Tata Letak:</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{getLayoutLabel(screen.layout)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Sumber Konten:</span>
                  <span style={{ fontWeight: 600, color: '#2563eb' }}>{getFacultyName(screen.faculty_prefix)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Warna Tema:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: screen.theme_color }}></span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{screen.theme_color}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button
                  onClick={() => handleSelectTab(num)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    background: activeTab === num ? '#3b82f6' : '#f1f5f9',
                    color: activeTab === num ? 'white' : '#334155',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sliders size={16} /> Ubah TV {num}
                </button>

                <button
                  onClick={() => window.open(`/tv?screen=${num}`, '_blank')}
                  title={`Buka Layar Penuh TV ${num}`}
                  style={{
                    padding: '0.55rem 0.75rem',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ExternalLink size={16} /> Buka Layar
                </button>

                <button
                  onClick={() => handleCopyLink(num)}
                  title="Salin Link Layar"
                  style={{
                    padding: '0.55rem',
                    background: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {copiedId === num ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual TV Setting Form (Ubah Satu Per Satu) */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Form Tab Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.5rem 1rem 0 1rem', gap: '0.5rem' }}>
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => handleSelectTab(num)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderBottom: activeTab === num ? '3px solid #2563eb' : '3px solid transparent',
                background: 'transparent',
                fontWeight: activeTab === num ? 700 : 500,
                color: activeTab === num ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Tv size={16} /> Pengaturan TV {num}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSaveIndividual} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>Konfigurasi Mandiri: TV {activeTab}</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Ubah tata letak, warna, dan sumber fakultas khusus untuk monitor ini.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status Monitor:</span>
              <button
                type="button"
                onClick={() => setCurrentTv({ ...currentTv, is_active: currentTv.is_active ? 0 : 1 })}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: currentTv.is_active ? '#ecfdf5' : '#fef2f2',
                  color: currentTv.is_active ? '#059669' : '#dc2626'
                }}
              >
                <Power size={14} /> {currentTv.is_active ? 'Aktif (Menyala)' : 'Standby (Mati)'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>Nama TV</label>
              <input
                type="text"
                value={currentTv.name}
                onChange={(e) => setCurrentTv({ ...currentTv, name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Misal: TV Pusat 1"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>Lokasi Pemasangan</label>
              <input
                type="text"
                value={currentTv.location}
                onChange={(e) => setCurrentTv({ ...currentTv, location: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Misal: Lobi Utama Rektorat"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>Tata Letak (Layout)</label>
              <select
                value={currentTv.layout}
                onChange={(e) => setCurrentTv({ ...currentTv, layout: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, outline: 'none', background: 'white', boxSizing: 'border-box' }}
              >
                <option value="standard">Standard (Agenda Kiri + Slider Kanan)</option>
                <option value="agenda-focus">Fokus Agenda (Agenda Lebar + Slider Kompak)</option>
                <option value="full-media">Full Media (Slide Layar Penuh 100%)</option>
                <option value="tu">Tata Usaha (2 Slide Khusus Jadwal)</option>
                <option value="admin">Eksekutif Admin</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>Sumber Data Fakultas</label>
              <select
                value={currentTv.faculty_prefix}
                onChange={(e) => setCurrentTv({ ...currentTv, faculty_prefix: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, outline: 'none', background: 'white', boxSizing: 'border-box' }}
              >
                {FACULTY_LIST.map(f => (
                  <option key={f.prefix} value={f.prefix}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>Warna Tema TV</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="color"
                value={currentTv.theme_color}
                onChange={(e) => setCurrentTv({ ...currentTv, theme_color: e.target.value })}
                style={{ width: '45px', height: '40px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.375rem', cursor: 'pointer' }}
              />
              {['#1e40af', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0f172a'].map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setCurrentTv({ ...currentTv, theme_color: color })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: color,
                    border: currentTv.theme_color === color ? '3px solid #000' : '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>Pengumuman Teks Berjalan Khusus TV Ini (Opsional)</label>
            <input
              type="text"
              value={currentTv.custom_announcement}
              onChange={(e) => setCurrentTv({ ...currentTv, custom_announcement: e.target.value })}
              placeholder="Kosongkan untuk menggunakan pengumuman default fakultas/pusat..."
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.7rem 1.75rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(37,99,235,0.3)'
              }}
            >
              <CheckCircle2 size={18} /> Simpan Pengaturan TV {activeTab}
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Modal (Ubah Sekaligus Semua 3 TV) */}
      {isBroadcastModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: 'white',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Radio size={20} /> Broadcast: Sinkronkan 3 TV Sekaligus
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
                  Pilihan di bawah ini akan diterapkan secara serentak ke TV 1, TV 2, dan TV 3.
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '0.375rem', padding: '0.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                  Tata Letak Serentak (Layout)
                </label>
                <select
                  value={broadcastData.layout}
                  onChange={(e) => setBroadcastData({ ...broadcastData, layout: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, outline: 'none', background: 'white', boxSizing: 'border-box' }}
                >
                  <option value="standard">Standard (Agenda Kiri + Slider Kanan)</option>
                  <option value="agenda-focus">Fokus Agenda (Hero Left)</option>
                  <option value="full-media">Full Media (Slide Layar Penuh 100%)</option>
                  <option value="tu">Tata Usaha (2 Slide Khusus Jadwal)</option>
                  <option value="admin">Eksekutif Admin</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                  Sumber Fakultas Serentak
                </label>
                <select
                  value={broadcastData.faculty_prefix}
                  onChange={(e) => setBroadcastData({ ...broadcastData, faculty_prefix: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, outline: 'none', background: 'white', boxSizing: 'border-box' }}
                >
                  {FACULTY_LIST.map(f => (
                    <option key={f.prefix} value={f.prefix}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                  Warna Tema Bersama
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input
                    type="color"
                    value={broadcastData.theme_color}
                    onChange={(e) => setBroadcastData({ ...broadcastData, theme_color: e.target.value })}
                    style={{ width: '45px', height: '40px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.375rem', cursor: 'pointer' }}
                  />
                  {['#1e40af', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0f172a'].map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setBroadcastData({ ...broadcastData, theme_color: color })}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: color,
                        border: broadcastData.theme_color === color ? '3px solid #000' : '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                  Status Seluruh TV
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, color: '#059669' }}>
                    <input
                      type="radio"
                      name="broadcastActive"
                      checked={broadcastData.is_active === true}
                      onChange={() => setBroadcastData({ ...broadcastData, is_active: true })}
                    />
                    Semua TV Aktif (Menyala)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, color: '#dc2626' }}>
                    <input
                      type="radio"
                      name="broadcastActive"
                      checked={broadcastData.is_active === false}
                      onChange={() => setBroadcastData({ ...broadcastData, is_active: false })}
                    />
                    Semua TV Standby (Mati)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.3)'
                  }}
                >
                  <Radio size={18} /> Terapkan ke 3 TV Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
