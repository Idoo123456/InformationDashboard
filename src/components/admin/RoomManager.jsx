import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Building2, Plus, Trash2, MapPin, Users, CheckCircle, 
  Search, RefreshCw, Layers, ShieldCheck, Tag
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function RoomManager() {
  const { currentFacultyPrefix, isSuperAdmin, FACULTY_LIST } = useDashboard();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Ruang Rapat',
    building: 'Gedung Rektorat',
    floor: 'Lt. 1',
    capacity: 30,
    facilities: '',
    faculty_prefix: currentFacultyPrefix || 'main'
  });

  const categories = [
    'Ruang Rapat',
    'Studio Multimedia',
    'Auditorium',
    'Ruang Kolaborasi',
    'Studio Recording / Podcast',
    'Laboratorium',
    'Ruang Kuliah Bersama',
    'Aula Serbaguna'
  ];

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms?faculty=${currentFacultyPrefix || 'main'}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Gagal mengambil data ruangan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [currentFacultyPrefix]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Ruang Rapat',
      building: 'Gedung Rektorat',
      floor: 'Lt. 1',
      capacity: 30,
      facilities: 'AC, Proyektor, Sound System, WiFi Dedicated',
      faculty_prefix: currentFacultyPrefix || 'main'
    });
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Peringatan', 'Nama ruangan wajib diisi', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          title: 'Berhasil!',
          text: `Ruangan "${formData.name}" berhasil didaftarkan ke sistem.`,
          icon: 'success',
          timer: 1600,
          showConfirmButton: false
        });
        setIsModalOpen(false);
        fetchRooms();
      } else {
        Swal.fire('Gagal', data.message || 'Gagal menyimpan ruangan', 'error');
      }
    } catch (err) {
      console.error('Error saving room:', err);
      Swal.fire('Error', 'Terjadi kesalahan pada server', 'error');
    }
  };

  const handleDeleteRoom = async (room) => {
    const result = await Swal.fire({
      title: 'Hapus Ruangan?',
      text: `Apakah Anda yakin ingin menghapus "${room.name}"? Jadwal yang menggunakan ruangan ini tetap tersimpan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/rooms/${room.id}`, { method: 'DELETE' });
        if (res.ok) {
          Swal.fire({
            title: 'Terhapus!',
            text: 'Ruangan berhasil dihapus.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          fetchRooms();
        } else {
          Swal.fire('Gagal', 'Tidak dapat menghapus ruangan ini.', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  // Filter Logic
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.building && r.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (r.facilities && r.facilities.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBuilding = filterBuilding === 'ALL' || r.building === filterBuilding;
    return matchesSearch && matchesBuilding;
  });

  const uniqueBuildings = Array.from(new Set(rooms.map(r => r.building).filter(Boolean)));

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
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Master Ruangan & Studio Kampus
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                Kelola data ruang rapat, auditorium, dan studio yang terintegrasi langsung dengan TV Display
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchRooms}
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
            onClick={handleOpenAdd}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Plus size={18} />
            Tambah Ruangan Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Cari nama ruangan, gedung, atau fasilitas..."
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
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Gedung:</span>
          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
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
            <option value="ALL">Semua Gedung ({rooms.length})</option>
            {uniqueBuildings.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          Total Terdaftar: <strong style={{ color: '#0284c7' }}>{filteredRooms.length} Ruangan</strong>
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={36} className="spin-anim" style={{ margin: '0 auto 12px', color: '#0284c7' }} />
          <p>Memuat daftar ruangan master...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '60px 20px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px dashed #cbd5e1'
        }}>
          <Building2 size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#475569' }}>Tidak Ada Ruangan Ditemukan</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            {searchTerm ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada ruangan yang didaftarkan. Klik "Tambah Ruangan Baru" di atas.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.07)';
                e.currentTarget.style.borderColor = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {/* Category Tag & Action */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: '#e0f2fe',
                    color: '#0369a1'
                  }}>
                    {room.category || 'Ruang Rapat'}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteRoom(room)}
                    title="Hapus Ruangan"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  {room.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '0.85rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <MapPin size={15} style={{ color: '#0284c7' }} />
                    <span>{room.building || 'Gedung Pusat'} {room.floor ? `(${room.floor})` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Users size={15} style={{ color: '#059669' }} />
                    <span>Kapasitas: <strong>{room.capacity || 30} Orang</strong></span>
                  </div>
                </div>

                {/* Facilities */}
                {room.facilities && (
                  <div style={{
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    fontSize: '0.82rem',
                    color: '#475569'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#334155' }}>Fasilitas Ruang:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {room.facilities.split(',').map((fac, idx) => (
                        <span key={idx} style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.78rem'
                        }}>
                          {fac.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Status */}
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontWeight: 600 }}>
                  <CheckCircle size={14} /> Siap Digunakan
                </span>
                <span style={{ color: '#94a3b8' }}>
                  Prefix: <strong style={{ color: '#64748b' }}>{room.faculty_prefix || 'main'}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'fadeInScale 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  Tambah Ruangan Baru
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                  Daftarkan ruangan resmi kampus untuk jadwal TV & peminjaman
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRoom} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Nama Ruangan / Studio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Studio Gurindam 12, Ruang Senat Lt.5"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Kategori Ruangan
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        background: '#fff'
                      }}
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Kapasitas (Orang)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Gedung
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Gedung Rektorat, UPA Perpustakaan"
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Lantai
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Lt. 1, Lt. 2, Lt. 5"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Fasilitas Ruang (Pisahkan dengan koma)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: AC, Proyektor, Wireless Mic, Video Wall, Sound System"
                    value={formData.facilities}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      resize: 'none'
                    }}
                  />
                </div>

                {isSuperAdmin && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Unit / Fakultas Pemilik
                    </label>
                    <select
                      value={formData.faculty_prefix}
                      onChange={(e) => setFormData({ ...formData, faculty_prefix: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        background: '#fff'
                      }}
                    >
                      {FACULTY_LIST.map(f => (
                        <option key={f.prefix} value={f.prefix}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
