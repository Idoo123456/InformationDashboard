import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Building2, Plus, Trash2, MapPin, Users, CheckCircle, 
  Search, RefreshCw, Layers, ShieldCheck, Tag, X, Sparkles
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import Pagination from './Pagination';

export default function RoomManager() {
  const { currentFacultyPrefix, isSuperAdmin, currentUser, FACULTY_LIST, prefix } = useDashboard();
  const activeFaculty = currentUser?.faculty_prefix || currentFacultyPrefix || prefix || 'main';
  const currentFacultyObj = FACULTY_LIST?.find(f => f.prefix === activeFaculty);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [filterFaculty, setFilterFaculty] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Ruang Rapat',
    building: 'Gedung Rektorat',
    floor: 'Lt. 1',
    capacity: 30,
    facilities: '',
    faculty_prefix: activeFaculty
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
      const endpoint = isSuperAdmin
        ? '/api/rooms?faculty=main&all=true'
        : `/api/rooms?faculty=${activeFaculty}`;
      const res = await fetch(endpoint);
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
  }, [activeFaculty, isSuperAdmin]);

  const handleOpenAdd = () => {
    const defaultBuilding = isSuperAdmin 
      ? 'Gedung Rektorat' 
      : (currentFacultyObj ? `Gedung ${currentFacultyObj.code}` : 'Gedung Fakultas');

    setFormData({
      name: '',
      category: 'Ruang Rapat',
      building: defaultBuilding,
      floor: 'Lt. 1',
      capacity: 30,
      facilities: 'AC, Proyektor, Sound System, WiFi Dedicated',
      faculty_prefix: activeFaculty
    });
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setIsModalOpen(false);
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
      setIsModalOpen(false);

      if (res.ok && data.success) {
        Swal.fire({
          title: 'Berhasil!',
          text: `Ruangan "${formData.name}" berhasil didaftarkan untuk ${formData.faculty_prefix === 'main' ? 'Pusat' : formData.faculty_prefix.toUpperCase()} dan langsung tersedia di sistem.`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
        fetchRooms();
      } else {
        Swal.fire('Gagal', data.message || data.error || 'Gagal menyimpan ruangan', 'error');
      }
    } catch (err) {
      setIsModalOpen(false);
      console.error('Error saving room:', err);
      Swal.fire('Error', 'Terjadi kesalahan pada server', 'error');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!isSuperAdmin && (!room.faculty_prefix || room.faculty_prefix === 'main')) {
      Swal.fire('Akses Ditolak', 'Ruangan Pusat / Global Kampus hanya dapat dihapus oleh Super Admin.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Hapus Ruangan?',
      text: `Apakah Anda yakin ingin menghapus "${room.name}"? Jadwal yang menggunakan ruangan ini tetap tersimpan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/rooms/${room.id}?faculty_prefix=${activeFaculty}`, { method: 'DELETE' });
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
          const data = await res.json();
          Swal.fire('Gagal', data.error || 'Tidak dapat menghapus ruangan ini.', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  // Filter Logic
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.building && r.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (r.facilities && r.facilities.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBuilding = filterBuilding === 'ALL' || r.building === filterBuilding;
    const rFac = r.faculty_prefix || 'main';
    const matchesFaculty = filterFaculty === 'ALL' || rFac === filterFaculty;
    return matchesSearch && matchesBuilding && matchesFaculty;
  });

  // Reset ke halaman 1 saat pencarian / filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBuilding, filterFaculty]);

  // Data terpaginasi
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueBuildings = Array.from(new Set(rooms.map(r => r.building).filter(Boolean)));

  return (
    <div className="rooms-container">
      
      {/* 1. HEADER BAR */}
      <div className="card rooms-header-card">
        <div className="rooms-header-content">
          <div className="rooms-title-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div className="rooms-icon-badge">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="rooms-page-title">
                  Master Ruangan & Studio Kampus
                </h3>
              </div>
              <span className="rooms-header-pill">
                Master Data
              </span>
            </div>
            <p className="rooms-page-desc">
              Kelola data ruang rapat, auditorium, dan studio yang terintegrasi langsung dengan TV Display.
            </p>
          </div>

          {/* Action Buttons: 2-column grid on mobile */}
          <div className="rooms-action-group">
            <button
              type="button"
              onClick={fetchRooms}
              className="rooms-btn-refresh"
              title="Segarkan daftar ruangan"
            >
              <RefreshCw size={15} className={loading ? 'spin-anim' : ''} />
              <span>Segarkan</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="rooms-btn-add"
              title="Tambah ruangan baru"
            >
              <Plus size={16} />
              <span>Tambah Ruangan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="card rooms-filter-card">
        <div className="rooms-filter-row">
          {/* Search Box */}
          <div className="rooms-search-box">
            <Search size={16} className="rooms-search-icon" />
            <input
              type="text"
              placeholder="Cari nama ruangan, gedung, atau fasilitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rooms-search-input"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')} 
                className="rooms-search-clear"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Selects Group */}
          <div className="rooms-filter-selects">
            {/* Filter Gedung */}
            <div className="rooms-select-item">
              <span className="rooms-select-label">Gedung:</span>
              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="rooms-select-input"
              >
                <option value="ALL">Semua Gedung ({rooms.length})</option>
                {uniqueBuildings.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Filter Unit / Fakultas (Super Admin Only) */}
            {isSuperAdmin && (
              <div className="rooms-select-item">
                <span className="rooms-select-label">Unit:</span>
                <select
                  value={filterFaculty}
                  onChange={(e) => setFilterFaculty(e.target.value)}
                  className="rooms-select-input"
                >
                  <option value="ALL">Semua Unit ({rooms.length})</option>
                  <option value="main">Pusat / Rektorat ({rooms.filter(r => !r.faculty_prefix || r.faculty_prefix === 'main').length})</option>
                  {FACULTY_LIST.filter(f => f.prefix !== 'main').map(f => {
                    const count = rooms.filter(r => r.faculty_prefix === f.prefix).length;
                    return (
                      <option key={f.prefix} value={f.prefix}>
                        {f.name} ({f.code}) ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Counter Badge */}
          <div className="rooms-counter-badge">
            Total Terdaftar: <strong>{filteredRooms.length} Ruangan</strong>
          </div>
        </div>
      </div>

      {/* 3. ROOM CARDS GRID */}
      {loading ? (
        <div className="rooms-loading-state">
          <RefreshCw size={36} className="spin-anim" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
          <p>Memuat daftar ruangan master...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="card rooms-empty-state">
          <Building2 size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 6px', color: '#1e293b', fontWeight: 800 }}>Tidak Ada Ruangan Ditemukan</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            {searchTerm ? 'Coba ubah kata kunci atau reset filter Anda.' : 'Belum ada ruangan yang didaftarkan. Klik "Tambah Ruangan" di atas.'}
          </p>
        </div>
      ) : (
        <div className="rooms-cards-grid">
          {paginatedRooms.map((room) => (
            <div key={room.id} className="room-item-card">
              
              {/* Category, Faculty Badge & Delete Action */}
              <div className="room-card-top-bar">
                <div className="room-badge-group">
                  <span className="room-category-pill">
                    {room.category || 'Ruang Rapat'}
                  </span>

                  {/* Unit / Faculty Badge */}
                  {(!room.faculty_prefix || room.faculty_prefix === 'main') ? (
                    <span className="room-faculty-pill pusat">
                      🏛️ Pusat
                    </span>
                  ) : (
                    <span className="room-faculty-pill faculty">
                      🎓 {FACULTY_LIST?.find(f => f.prefix === room.faculty_prefix)?.code || room.faculty_prefix.toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Delete Button */}
                {(!isSuperAdmin && (!room.faculty_prefix || room.faculty_prefix === 'main')) ? (
                  <span title="Ruangan Global Kampus hanya dapat dihapus oleh Super Admin" className="room-locked-badge">
                    🔒
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(room)}
                    title="Hapus Ruangan"
                    className="room-btn-delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Room Name */}
              <h4 className="room-card-name">
                {room.name}
              </h4>

              {/* Room Location & Capacity */}
              <div className="room-card-info-list">
                <div className="room-info-item">
                  <MapPin size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                  <span>{room.building || 'Gedung Pusat'} {room.floor ? `(${room.floor})` : ''}</span>
                </div>
                <div className="room-info-item">
                  <Users size={14} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>Kapasitas: <strong>{room.capacity || 30} Orang</strong></span>
                </div>
              </div>

              {/* Facilities Tags */}
              {room.facilities && (
                <div className="room-facilities-box">
                  <span className="room-facilities-title">Fasilitas Ruang:</span>
                  <div className="room-facilities-tags">
                    {room.facilities.split(',').map((fac, idx) => (
                      <span key={idx} className="room-facility-chip">
                        {fac.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Status */}
              <div className="room-card-footer">
                <span className="room-status-ready">
                  <CheckCircle size={14} /> Siap Digunakan
                </span>
                <span className="room-prefix-tag">
                  Unit: <strong>{room.faculty_prefix || 'main'}</strong>
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 4. PAGINATION */}
      {!loading && filteredRooms.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRooms.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setCurrentPage(1);
          }}
          pageSizeOptions={[4, 8, 12, 24]}
          itemLabel="ruangan"
        />
      )}

      {/* 5. ADD ROOM MODAL (RESPONSIVE) */}
      {isModalOpen && (
        <div className="room-modal-overlay">
          <div className="room-modal-card">
            
            {/* Modal Header */}
            <div className="room-modal-header">
              <div>
                <h3 className="room-modal-title">
                  Tambah Ruangan Baru
                </h3>
                <p className="room-modal-subtitle">
                  Daftarkan ruangan resmi kampus untuk jadwal TV & agenda
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="room-modal-btn-close"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveRoom} className="room-modal-body">
              <div className="room-form-group">
                <label className="room-form-label">
                  Nama Ruangan / Studio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Studio Gurindam 12, Ruang Senat Lt.5"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-input room-form-input"
                />
              </div>

              <div className="room-form-grid-2col">
                <div className="room-form-group">
                  <label className="room-form-label">
                    Kategori Ruangan
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="admin-input room-form-select"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="room-form-group">
                  <label className="room-form-label">
                    Kapasitas (Orang)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="admin-input room-form-input"
                  />
                </div>
              </div>

              <div className="room-form-grid-2col">
                <div className="room-form-group">
                  <label className="room-form-label">
                    Gedung
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gedung Rektorat, UPA Perpustakaan"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="admin-input room-form-input"
                  />
                </div>

                <div className="room-form-group">
                  <label className="room-form-label">
                    Lantai
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Lt. 1, Lt. 2, Lt. 5"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="admin-input room-form-input"
                  />
                </div>
              </div>

              <div className="room-form-group">
                <label className="room-form-label">
                  Fasilitas Ruang (Pisahkan dengan koma)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: AC, Proyektor, Wireless Mic, Video Wall, Sound System"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  className="admin-input room-form-textarea"
                />
              </div>

              {isSuperAdmin ? (
                <div className="room-form-group">
                  <label className="room-form-label">
                    Unit / Fakultas Pemilik Ruangan
                  </label>
                  <select
                    value={formData.faculty_prefix}
                    onChange={(e) => setFormData({ ...formData, faculty_prefix: e.target.value })}
                    className="admin-input room-form-select"
                  >
                    <option value="main">Pusat / Rektorat (Global Kampus)</option>
                    {FACULTY_LIST.filter(f => f.prefix !== 'main').map(f => (
                      <option key={f.prefix} value={f.prefix}>{f.name} ({f.code})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="room-faculty-notice">
                  <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                  <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.45 }}>
                    Ruangan ini akan disimpan untuk <strong>{currentFacultyObj ? currentFacultyObj.name : activeFaculty.toUpperCase()}</strong> dan otomatis dapat dipantau oleh <strong>Super Admin</strong>.
                  </div>
                </div>
              )}

              {/* Modal Buttons (2-column on mobile) */}
              <div className="room-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="room-modal-btn-cancel"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="room-modal-btn-save"
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

