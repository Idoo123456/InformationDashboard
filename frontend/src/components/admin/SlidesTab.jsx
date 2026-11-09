import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Trash2, Plus, Save, Image as ImageIcon, MessageSquare, 
  Upload, Video, CheckCircle2, Sparkles, Tv, Search, X, Check,
  Edit3, Eye, Layers, Palette, Link as LinkIcon, QrCode, Monitor,
  Maximize2, ListFilter, Clock
} from 'lucide-react';
import { resolveMediaInfo } from '../../utils/mediaUtils';
import SlideMedia from '../display/SlideMedia';
import { showToastPopup } from '../../utils/adminAlerts';
import { useDashboard } from '../../context/DashboardContext';
import { DEFAULT_CAMPUS_TVS, fetchCampusTvDevices } from '../../utils/tvDevices';
import Pagination from './Pagination';

const PRESET_GRADIENTS = [
  { name: 'Biru UNRI', value: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
  { name: 'Biru Teal', value: 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)' },
  { name: 'Hijau Zamrud', value: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' },
  { name: 'Kuning Emas', value: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)' },
  { name: 'Merah Maroon', value: 'linear-gradient(135deg, #881337 0%, #e11d48 100%)' },
  { name: 'Ungu Modern', value: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)' },
  { name: 'Dark Slate', value: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' },
];

export default function SlidesTab({
  localSlides,
  localSlideDuration,
  setLocalSlideDuration,
  selectedSlides,
  setSelectedSlides,
  availableTvs: propTvs,
  handleDeleteSelectedSlides,
  handleAddSlide,
  handleSaveSlides,
  deleteSlide,
  updateSlide,
  handleImageUpload,
  handleMediaUpload
}) {
  const { prefix, currentUser } = useDashboard();
  const currentFaculty = currentUser?.faculty_prefix || prefix || 'main';
  const isMainCampus = currentFaculty === 'main';

  // Perangkat TV yang terdaftar
  const [availableTvs, setAvailableTvs] = useState(() => (
    propTvs && propTvs.length > 0 ? propTvs : (isMainCampus ? DEFAULT_CAMPUS_TVS : [])
  ));

  // State pencarian & filter slide ("Tombol Garis 3")
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlideFilter, setActiveSlideFilter] = useState('all'); // 'all', 'minggu_ini', 'bulan_ini', 'global', 'spesifik', 'image', 'video', 'none'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Label nama filter aktif
  const SLIDE_FILTER_LABELS = {
    all: 'Semua Slide (All)',
    minggu_ini: 'Minggu Ini',
    bulan_ini: 'Bulan Ini',
    global: 'Tayang Semua TV',
    spesifik: 'TV Tertentu',
    image: 'Media Gambar',
    video: 'Media Video',
    none: 'Teks & Warna'
  };

  // Tutup dropdown filter saat user klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // State Modal Detail Slide (id slide yang sedang dibuka detailnya)
  const [editingSlideId, setEditingSlideId] = useState(null);

  // Helper rentang tanggal kalender untuk slide
  const getWeekRange = (offsetWeeks = 0) => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day + (offsetWeeks * 7);
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: format(monday), end: format(sunday) };
  };

  const getMonthRange = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: format(first), end: format(last) };
  };

  const toYMD = (d) => {
    if (!d || isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getSlideDate = (slide) => {
    if (slide.createdAt || slide.created_at) {
      const d = new Date(slide.createdAt || slide.created_at);
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof slide.id === 'number' && slide.id > 1700000000000) {
      const d = new Date(slide.id);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const handleResetSlideFilters = () => {
    setSearchQuery('');
    setActiveSlideFilter('all');
  };

  const isSlideFilterActive = searchQuery.trim() !== '' || activeSlideFilter !== 'all';

  // Sinkronisasi data TV dari prop parent
  useEffect(() => {
    if (propTvs) {
      setAvailableTvs(propTvs);
    }
  }, [propTvs]);

  // Ambil daftar TV dari backend
  useEffect(() => {
    fetchCampusTvDevices(currentFaculty).then(data => {
      if (Array.isArray(data)) setAvailableTvs(data);
    });
  }, [currentFaculty]);

  // Cari slide yang sedang diedit
  const editingSlide = localSlides.find(s => s.id === editingSlideId) || null;

  // Helper mendapatkan judul string bersih
  const getSlideTitle = (title) => {
    if (!title) return 'Judul Belum Diatur';
    if (typeof title === 'string') return title;
    if (typeof title === 'object' && title?.props?.children) {
      if (Array.isArray(title.props.children)) {
        return title.props.children.join('');
      }
      return String(title.props.children);
    }
    return 'Slide Informasi';
  };

  // Helper mendapatkan deskripsi bersih
  const getSlideDesc = (slide) => {
    const d = slide.desc !== undefined ? slide.desc : slide.description;
    if (!d) return '';
    return typeof d === 'string' ? d : String(d);
  };

  // Tambah slide baru dan langsung buka popup detailnya
  const handleAddNewSlide = () => {
    const newSlide = handleAddSlide();
    if (newSlide && newSlide.id) {
      setEditingSlideId(newSlide.id);
    }
  };

  // Helper cek target TV slide
  const getTargetTvs = (slide) => {
    const targets = slide?.targetTvs || slide?.target_tvs;
    if (!targets || !Array.isArray(targets) || targets.length === 0 || targets.includes('all')) {
      return { isGlobal: true, targets: [] };
    }
    return { isGlobal: false, targets: targets.map(t => String(t)) };
  };

  // Filter slide berdasarkan pencarian teks dan filter tombol garis 3
  const filteredSlides = localSlides.filter(slide => {
    // 1. Pencarian Teks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = getSlideTitle(slide.title).toLowerCase();
      const tag = (slide.tag || '').toLowerCase();
      const desc = getSlideDesc(slide).toLowerCase();
      if (!title.includes(q) && !tag.includes(q) && !desc.includes(q)) return false;
    }

    // 2. Filter Garis 3 (activeSlideFilter)
    if (activeSlideFilter === 'minggu_ini') {
      const w = getWeekRange(0);
      const sDate = getSlideDate(slide);
      if (sDate) {
        const ymd = toYMD(sDate);
        if (ymd < w.start || ymd > w.end) return false;
      }
    } else if (activeSlideFilter === 'bulan_ini') {
      const m = getMonthRange();
      const sDate = getSlideDate(slide);
      if (sDate) {
        const ymd = toYMD(sDate);
        if (ymd < m.start || ymd > m.end) return false;
      }
    } else if (activeSlideFilter === 'global') {
      const { isGlobal } = getTargetTvs(slide);
      if (!isGlobal) return false;
    } else if (activeSlideFilter === 'spesifik') {
      const { isGlobal } = getTargetTvs(slide);
      if (isGlobal) return false;
    } else if (activeSlideFilter === 'image' || activeSlideFilter === 'video' || activeSlideFilter === 'none') {
      const mType = slide.mediaType || 'none';
      if (mType !== activeSlideFilter) return false;
    }

    return true;
  });

  // Reset ke halaman 1 saat pencarian atau filter slide berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeSlideFilter]);

  // Data slide terpaginasi
  const paginatedSlides = filteredSlides.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper render badge target TV
  const renderTargetBadge = (slide) => {
    const { isGlobal, targets } = getTargetTvs(slide);

    if (isGlobal) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '0.4rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            fontSize: '0.72rem',
            fontWeight: 700
          }}
        >
          <Tv size={12} /> Semua TV (Global)
        </span>
      );
    }

    const names = targets.map(t => {
      const found = availableTvs.find(dev => String(dev.id) === String(t) || String(dev.code) === String(t));
      return found ? (found.code ? found.code.toUpperCase() : `TV ${found.id}`) : `TV ${t}`;
    });

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '0.4rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          fontSize: '0.72rem',
          fontWeight: 700
        }}
      >
        <Tv size={12} /> {targets.length === 1 ? names[0] : `${targets.length} TV Target`}
      </span>
    );
  };

  // Helper render media type badge
  const renderMediaTypeBadge = (mediaType) => {
    let bg = '#e0e7ff';
    let color = '#3730a3';
    let text = 'Warna / Teks';
    let icon = <Palette size={12} />;

    if (mediaType === 'image') {
      bg = '#dcfce7';
      color = '#166534';
      text = 'Gambar';
      icon = <ImageIcon size={12} />;
    } else if (mediaType === 'video') {
      bg = '#fef08a';
      color = '#854d0e';
      text = 'Video';
      icon = <Video size={12} />;
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '0.4rem',
        background: bg,
        color: color,
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase'
      }}>
        {icon} {text}
      </span>
    );
  };

  // Helper menampilkan badge durasi tayang slide
  const renderDurationBadge = (slide) => {
    const isVideo = slide.mediaType === 'video';
    const customDur = slide.duration !== undefined && slide.duration !== null && slide.duration !== ''
      ? Number(slide.duration)
      : null;

    if (isVideo && customDur === 0) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '0.4rem',
          background: '#f5f3ff',
          color: '#6d28d9',
          border: '1px solid #ddd6fe',
          fontSize: '0.72rem',
          fontWeight: 700
        }} title="Durasi Video: Putar Penuh sampai selesai (Otomatis)">
          <Clock size={11} /> Video (Auto)
        </span>
      );
    }

    if (customDur !== null && customDur > 0) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '0.4rem',
          background: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
          fontSize: '0.72rem',
          fontWeight: 800
        }} title={`Durasi khusus slide ini: ${customDur} detik`}>
          <Clock size={11} /> {customDur}s
        </span>
      );
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '0.4rem',
        background: '#f8fafc',
        color: '#64748b',
        border: '1px solid #e2e8f0',
        fontSize: '0.72rem',
        fontWeight: 600
      }} title={`Mengikuti durasi standar: ${localSlideDuration || 8} detik`}>
        <Clock size={11} /> {localSlideDuration || 8}s (Default)
      </span>
    );
  };

  return (
    <div className="card" style={{ maxWidth: '100%', margin: '0 auto 2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
      
      {/* HEADER UTAMA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
            Daftar Slide Konten
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            Kelola urutan dan tayangan visual TV. Klik baris slide mana saja untuk membuka popup detail lengkap.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Durasi Per Slide */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'white', padding: '0.45rem 0.85rem', borderRadius: '0.65rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <label style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={15} color="#64748b" /> Durasi:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.45rem', padding: '0.15rem 0.4rem', gap: '0.2rem' }}>
              <input 
                type="number" 
                value={localSlideDuration} 
                onChange={(e) => setLocalSlideDuration(Number(e.target.value))} 
                min="1"
                style={{ width: '38px', border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, color: '#2563eb', textAlign: 'center', fontSize: '0.88rem', padding: 0 }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>dtk</span>
            </div>
          </div>

          {/* Tombol Hapus Terpilih */}
          <button 
            onClick={handleDeleteSelectedSlides} 
            disabled={selectedSlides.length === 0} 
            style={{ 
              padding: '0.65rem 1.1rem', 
              background: selectedSlides.length > 0 ? '#fef2f2' : 'white', 
              color: selectedSlides.length > 0 ? '#ef4444' : '#cbd5e1', 
              border: `1px solid ${selectedSlides.length > 0 ? '#fecaca' : '#e2e8f0'}`, 
              borderRadius: '0.65rem', 
              cursor: selectedSlides.length > 0 ? 'pointer' : 'not-allowed', 
              fontWeight: 600, 
              fontSize: '0.85rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              transition: 'all 0.2s' 
            }}
          >
            <Trash2 size={15} /> Hapus ({selectedSlides.length})
          </button>

          {/* Tombol Tambah Slide (Membuka popup langsung) */}
          <button 
            onClick={handleAddNewSlide} 
            style={{ 
              padding: '0.65rem 1.25rem', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.65rem', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '0.88rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', 
              transition: 'transform 0.2s' 
            }} 
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} 
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={17} /> Tambah Slide
          </button>

          {/* Tombol Publikasikan ke TV */}
          <button 
            onClick={handleSaveSlides} 
            style={{ 
              padding: '0.65rem 1.35rem', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.65rem', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '0.88rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', 
              transition: 'transform 0.2s' 
            }} 
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} 
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Save size={17} /> Publikasikan ke TV
          </button>
        </div>
      </div>

      {/* FILTER BAR BERSIH DENGAN TOMBOL GARIS 3 (FILTER DROPDOWN) */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Kolom Pencarian Teks */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Cari slide berdasarkan judul, tag kategori, atau isi konten..." 
            style={{ 
              width: '100%', 
              padding: '0.8rem 1rem 0.8rem 2.8rem', 
              borderRadius: '0.75rem', 
              border: '1px solid #e2e8f0', 
              background: 'white', 
              outline: 'none', 
              fontSize: '0.92rem', 
              color: '#1e293b', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s' 
            }} 
            onFocus={e => e.target.style.borderColor = '#3b82f6'} 
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} 
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')} 
              style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Tombol Garis 3 Filter (Dropdown Popover) */}
        <div style={{ position: 'relative' }} ref={filterDropdownRef}>
          <button
            type="button"
            onClick={() => setFilterDropdownOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.25rem',
              borderRadius: '0.75rem',
              background: activeSlideFilter !== 'all' ? '#eff6ff' : 'white',
              border: `1.5px solid ${activeSlideFilter !== 'all' ? '#3b82f6' : '#e2e8f0'}`,
              color: activeSlideFilter !== 'all' ? '#1d4ed8' : '#334155',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.15s'
            }}
            title="Klik tombol garis 3 untuk memfilter slide"
          >
            <ListFilter size={18} />
            <span>Filter</span>
            {activeSlideFilter !== 'all' && (
              <span style={{
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                background: '#2563eb',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                {SLIDE_FILTER_LABELS[activeSlideFilter] || 'Aktif'}
              </span>
            )}
          </button>

          {/* Pop-up Dropdown Filter Menu */}
          {filterDropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: 'white',
              borderRadius: '0.85rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 15px 35px -5px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.06)',
              width: '270px',
              padding: '0.5rem',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              <div style={{ padding: '0.45rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pilihan Filter Slide
              </div>

              {[
                { id: 'all', label: 'Semua Slide (All)', icon: '📋' },
                { id: 'minggu_ini', label: 'Minggu Ini', icon: '📆' },
                { id: 'bulan_ini', label: 'Bulan Ini', icon: '🗓️' },
                { id: 'global', label: 'Tayang Semua TV (Global)', icon: '🌐' },
                { id: 'spesifik', label: 'Tayang di TV Tertentu', icon: '🎯' },
                { id: 'image', label: 'Format Gambar', icon: '🖼️' },
                { id: 'video', label: 'Format Video', icon: '🎥' },
                { id: 'none', label: 'Format Teks & Warna', icon: '🎨' },
              ].map(opt => {
                const isSelected = activeSlideFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setActiveSlideFilter(opt.id);
                      setFilterDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '0.55rem',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#1d4ed8' : '#334155',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseOut={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    {isSelected && <Check size={16} color="#2563eb" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ringkasan & Reset Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Menampilkan <strong style={{ color: '#0f172a' }}>{filteredSlides.length}</strong> dari {localSlides.length} Slide
          </span>
          {isSlideFilterActive && (
            <button
              type="button"
              onClick={handleResetSlideFilters}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: '#fef2f2',
                color: '#ef4444',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <X size={13} /> Reset Filter
            </button>
          )}
        </div>

      </div>

      {/* LIST DAFTAR SLIDE (TAMPILAN LIST BERSIH) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {paginatedSlides.map((slide, index) => {
          const previewMediaInfo = resolveMediaInfo(slide.mediaUrl, slide.mediaType);
          const isSelected = selectedSlides.includes(slide.id);
          const rawTitle = getSlideTitle(slide.title);
          const rawDesc = getSlideDesc(slide);
          const isFullMedia = Boolean(slide.isMediaOnly);

          return (
            <div
              key={slide.id}
              onClick={() => setEditingSlideId(slide.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: isSelected ? '#f8faff' : 'white',
                padding: '0.85rem 1.25rem',
                borderRadius: '0.85rem',
                border: `1.5px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseOver={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
                }
              }}
              onMouseOut={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }
              }}
            >
              {/* Checkbox Multi-Select */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <input 
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedSlides(prev => [...prev, slide.id]);
                    else setSelectedSlides(prev => prev.filter(id => id !== slide.id));
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
              </div>

              {/* Nomor Urut Slide */}
              <div style={{
                minWidth: '38px',
                height: '38px',
                borderRadius: '0.5rem',
                background: '#f1f5f9',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                #{index + 1}
              </div>

              {/* Thumbnail Cuplikan Visual */}
              <div style={{
                width: '84px',
                height: '52px',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid #cbd5e1',
                background: slide.bg || slide.bgColor || '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {slide.mediaType === 'image' && (slide.mediaUrl || previewMediaInfo?.imageUrl) ? (
                  <img
                    src={previewMediaInfo?.imageUrl || slide.mediaUrl}
                    alt="Thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : slide.mediaType === 'video' ? (
                  <div style={{ width: '100%', height: '100%', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <Video size={20} />
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700 }}>VIDEO</span>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                      WARNA
                    </span>
                  </div>
                )}
              </div>

              {/* Info Utama Slide (Klik untuk Buka Detail) */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {/* Badge Tag */}
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '0.35rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {slide.tag || 'Slide'}
                  </span>

                  {/* Tipe Media */}
                  {renderMediaTypeBadge(slide.mediaType)}

                  {/* Indikator Durasi Slide */}
                  {renderDurationBadge(slide)}

                  {/* Indikator Target TV */}
                  {renderTargetBadge(slide)}

                  {/* Indikator Layar Penuh */}
                  {isFullMedia && (
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '0.35rem',
                      background: '#fef3c7',
                      color: '#92400e',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      <Maximize2 size={10} /> Layar Penuh 100%
                    </span>
                  )}
                </div>

                {/* Judul Slide */}
                <div style={{
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {rawTitle}
                </div>

                {/* Cuplikan Deskripsi */}
                <div style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {rawDesc || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Tidak ada deskripsi tambahan</span>}
                </div>
              </div>

              {/* Tombol Aksi di Baris List */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
              >
                {/* Tombol Buka Detail / Edit */}
                <button
                  type="button"
                  onClick={() => setEditingSlideId(slide.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#dbeafe'}
                  onMouseOut={e => e.currentTarget.style.background = '#eff6ff'}
                  title="Buka popup untuk mengedit teks, media, & target TV"
                >
                  <Edit3 size={14} /> Detail / Edit
                </button>

                {/* Tombol Hapus Slide */}
                <button
                  type="button"
                  onClick={() => deleteSlide(slide.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '34px',
                    height: '34px',
                    borderRadius: '0.5rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fecaca';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  title="Hapus Slide"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {filteredSlides.length === 0 && (
          <div style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: 'white',
            borderRadius: '1rem',
            border: '1px dashed #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={28} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.35rem 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: 700 }}>
                {searchQuery ? 'Tidak ada slide yang cocok dengan pencarian' : 'Belum Ada Slide Konten'}
              </h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                {searchQuery ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Tambahkan slide pertama untuk menampilkan informasi pada layar TV.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={handleAddNewSlide}
                style={{
                  padding: '0.65rem 1.35rem',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.55rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <Plus size={16} /> Tambah Slide Sekarang
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Slide */}
      {filteredSlides.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSlides.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 15, 25]}
          itemLabel="slide"
        />
      )}

      {/* FOOTER ACTIONS BAR */}
      <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Total: <strong style={{ color: '#0f172a' }}>{localSlides.length} Slide</strong> aktif di daftar putar TV.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleAddNewSlide}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s'
            }}
          >
            <Plus size={16} /> Tambah Slide Baru
          </button>
          <button
            onClick={handleSaveSlides}
            style={{
              padding: '0.65rem 1.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Save size={16} /> Publikasikan ke TV
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* POPUP MODAL DETAIL SLIDE (EDIT TEKS, MEDIA, & TARGET TV)  */}
      {/* ======================================================== */}
      {editingSlide && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(15, 23, 42, 0.7)', 
            backdropFilter: 'blur(5px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999, 
            padding: '1rem' 
          }}
          onClick={() => setEditingSlideId(null)}
        >
          <div 
            style={{ 
              background: 'white', 
              borderRadius: '1.25rem', 
              width: '100%', 
              maxWidth: '820px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, #f8fafc, #ffffff)', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Detail Slide #{localSlides.findIndex(s => s.id === editingSlide.id) + 1}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Sesuaikan isi teks, media visual (foto/video), dan target layar TV
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlideId(null)}
                style={{ background: '#f1f5f9', border: 'none', color: '#64748b', fontSize: '1.3rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                title="Tutup Popup"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* SEKSI 1: KONTEN TEKS */}
              <div className="slide-section" style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div className="slide-section-title" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MessageSquare size={16} color="#2563eb" /> INFORMASI TEKS SLIDE
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                      Label Kategori / Tag
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: PENGUMUMAN"
                      value={editingSlide.tag || ''} 
                      onChange={(e) => updateSlide(editingSlide.id, 'tag', e.target.value)} 
                      className="admin-input" 
                      style={{ background: 'white' }} 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                      Judul Utama Slide
                    </label>
                    <input 
                      type="text"
                      placeholder="Tulis judul slide yang menarik..."
                      value={typeof editingSlide.title === 'string' ? editingSlide.title : (editingSlide.title?.props?.children?.join('') || '')} 
                      onChange={(e) => updateSlide(editingSlide.id, 'title', e.target.value)} 
                      className="admin-input" 
                      style={{ background: 'white', fontWeight: 700 }} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                    Deskripsi / Rincian Informasi
                  </label>
                  <textarea 
                    placeholder="Tulis detail informasi yang ingin disampaikan pada pengunjung..."
                    value={editingSlide.desc !== undefined ? editingSlide.desc : (editingSlide.description || '')} 
                    onChange={(e) => updateSlide(editingSlide.id, 'desc', e.target.value)} 
                    className="admin-input" 
                    rows="3" 
                    style={{ background: 'white', minHeight: '80px', resize: 'vertical' }} 
                  />
                </div>
              </div>

              {/* SEKSI 2: MEDIA & LATAR BELAKANG */}
              <div className="slide-section" style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div className="slide-section-title" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ImageIcon size={16} color="#2563eb" /> MEDIA VISUAL & LATAR BELAKANG
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                    Pilihan Tipe Visual:
                  </label>
                  <select 
                    value={editingSlide.mediaType || 'none'} 
                    onChange={(e) => updateSlide(editingSlide.id, 'mediaType', e.target.value)} 
                    className="admin-input" 
                    style={{ background: 'white', fontWeight: 700, color: '#2563eb' }}
                  >
                    <option value="none">Hanya Warna / Gradien Latar Belakang</option>
                    <option value="image">Gambar / Foto (Unggah File JPG/PNG, Web URL, Google Drive)</option>
                    <option value="video">Video (Unggah File MP4/WebM, YouTube, Google Drive)</option>
                  </select>
                </div>

                {/* Pengaturan Khusus Gambar / Video */}
                {editingSlide.mediaType !== 'none' && (
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                          {editingSlide.mediaType === 'video' ? 'Tautan URL Video (YouTube / MP4 Web)' : 'Tautan URL Gambar (Web / Google Drive)'}
                        </label>
                        {editingSlide.mediaUrl && (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={12} /> Media Terhubung
                          </span>
                        )}
                      </div>
                      <input 
                        type="text" 
                        placeholder={editingSlide.mediaType === 'video' ? "https://www.youtube.com/watch?v=... atau link berkas .mp4" : "https://unri.ac.id/banner.jpg atau link Google Drive"} 
                        value={editingSlide.mediaUrl || ''} 
                        onChange={(e) => updateSlide(editingSlide.id, 'mediaUrl', e.target.value)} 
                        className="admin-input" 
                        style={{ background: '#f8fafc' }} 
                      />
                    </div>

                    {/* Tombol Unggah File Lokal */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label className="admin-btn-secondary" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', border: '1.5px dashed #93c5fd', background: '#eff6ff', color: '#2563eb', borderRadius: '0.5rem' }}>
                        <Upload size={15} /> {editingSlide.mediaType === 'video' ? 'Unggah Berkas Video (.mp4, .webm)' : 'Unggah Berkas Foto / Flyer'}
                        <input 
                          type="file" 
                          accept={editingSlide.mediaType === 'video' ? "video/mp4,video/webm" : "image/*"} 
                          onChange={(e) => handleMediaUpload(editingSlide.id, e.target.files[0])} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>

                    {/* Pratinjau Tampilan Media */}
                    {editingSlide.mediaUrl && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Eye size={12} /> Pratinjau Tampilan Visual:
                        </div>
                        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#000' }}>
                          <SlideMedia 
                            slide={editingSlide}
                            mediaUrl={editingSlide.mediaUrl} 
                            mediaType={editingSlide.mediaType} 
                            mediaFit={editingSlide.mediaFit || 'cover'}
                            title={editingSlide.title}
                            isPreview={true}
                          />
                        </div>
                      </div>
                    )}

                    {/* Opsi Media Layar Penuh */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <input 
                        type="checkbox" 
                        id={`modal_media_only_${editingSlide.id}`} 
                        checked={Boolean(editingSlide.isMediaOnly)} 
                        onChange={(e) => updateSlide(editingSlide.id, 'isMediaOnly', e.target.checked)} 
                        style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                      <label htmlFor={`modal_media_only_${editingSlide.id}`} style={{ margin: 0, fontSize: '0.82rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                        Tampilkan Media Layar Penuh 100% (Sembunyikan kartu teks saat tayang di TV)
                      </label>
                    </div>
                  </div>
                )}

                {/* Warna / Gradien Latar Belakang */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                    Warna / Gradien CSS Latar Belakang
                  </label>
                  <input 
                    type="text" 
                    value={editingSlide.bg || editingSlide.bgColor || ''} 
                    onChange={(e) => updateSlide(editingSlide.id, 'bg', e.target.value)} 
                    className="admin-input" 
                    style={{ background: 'white', fontFamily: 'monospace', fontSize: '0.82rem', marginBottom: '0.5rem' }} 
                  />

                  {/* Preset Palet Warna Cepat */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Palet Cepat:</span>
                    {PRESET_GRADIENTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateSlide(editingSlide.id, 'bg', p.value)}
                        style={{
                          background: p.value,
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.35rem',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEKSI 3: TOMBOL TAUTAN & QR CODE (OPSIONAL) */}
              <div className="slide-section" style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div className="slide-section-title" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={16} color="#2563eb" /> TOMBOL AKSI & KODE QR (OPSIONAL)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                      Teks Tombol
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Info Selengkapnya" 
                      value={editingSlide.btnText || ''} 
                      onChange={(e) => updateSlide(editingSlide.id, 'btnText', e.target.value)} 
                      className="admin-input" 
                      style={{ background: 'white' }} 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                      Tautan Tombol URL
                    </label>
                    <input 
                      type="text" 
                      placeholder="https://unri.ac.id" 
                      value={editingSlide.btnLink || ''} 
                      onChange={(e) => updateSlide(editingSlide.id, 'btnLink', e.target.value)} 
                      className="admin-input" 
                      style={{ background: 'white' }} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                    URL Gambar Kode QR (Untuk discan pengunjung layar TV)
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://api.qrserver.com/... atau tautan situs" 
                    value={editingSlide.qr !== undefined ? editingSlide.qr : (editingSlide.qrUrl || '')} 
                    onChange={(e) => updateSlide(editingSlide.id, 'qr', e.target.value)} 
                    className="admin-input" 
                    style={{ background: 'white' }} 
                  />
                </div>
              </div>

              {/* SEKSI 3: DURASI TAYANG SLIDE (WAKTU TAMPIL DI LAYAR TV) */}
              <div className="slide-section" style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div className="slide-section-title" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Clock size={16} color="#2563eb" /> DURASI TAYANG SLIDE (WAKTU TAMPIL DI LAYAR)
                </div>

                <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Tentukan berapa lama slide ini akan ditampilkan sebelum otomatis bergulir ke slide selanjutnya.
                </p>

                {(() => {
                  const isVideo = editingSlide.mediaType === 'video';
                  const currentDur = editingSlide.duration !== undefined && editingSlide.duration !== null && editingSlide.duration !== ''
                    ? Number(editingSlide.duration)
                    : null;
                  
                  const isAutoVideo = isVideo && currentDur === 0;
                  const isCustom = currentDur !== null && currentDur > 0;
                  const isDefault = currentDur === null || (!isAutoVideo && !isCustom);

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Pilihan 1: Khusus Video - Otomatis Sesuai Panjang Video */}
                      {isVideo && (
                        <div
                          onClick={() => updateSlide(editingSlide.id, 'duration', 0)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            background: isAutoVideo ? '#f5f3ff' : 'white',
                            border: `1.5px solid ${isAutoVideo ? '#7c3aed' : '#cbd5e1'}`,
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={`duration_mode_${editingSlide.id}`}
                            checked={isAutoVideo}
                            onChange={() => updateSlide(editingSlide.id, 'duration', 0)}
                            style={{ marginTop: '0.2rem', accentColor: '#7c3aed', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isAutoVideo ? '#6d28d9' : '#1e293b' }}>
                                🎬 Otomatis Sesuai Panjang Video (Putar Penuh)
                              </span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '0.35rem', background: '#ede9fe', color: '#6d28d9' }}>
                                Disarankan untuk Video
                              </span>
                            </div>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                              Slide ini akan terus tayang memutar video sampai selesai 100%, lalu langsung bergulir otomatis ke slide berikutnya.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pilihan 2: Atur Durasi Kustom Sendiri */}
                      <div
                        onClick={() => {
                          if (!isCustom) {
                            updateSlide(editingSlide.id, 'duration', isVideo ? 20 : 10);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          background: isCustom ? '#eff6ff' : 'white',
                          border: `1.5px solid ${isCustom ? '#2563eb' : '#cbd5e1'}`,
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`duration_mode_${editingSlide.id}`}
                          checked={isCustom}
                          onChange={() => updateSlide(editingSlide.id, 'duration', isVideo ? 20 : 10)}
                          style={{ marginTop: '0.2rem', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isCustom ? '#1d4ed8' : '#1e293b' }}>
                              ⏱️ Atur Durasi Kustom
                            </span>
                            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              (Bebas atur detik khusus untuk slide ini)
                            </span>
                          </div>

                          {isCustom && (
                            <div 
                              onClick={(e) => e.stopPropagation()} 
                              style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max="3600"
                                  value={currentDur || (isVideo ? 20 : 10)} 
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                    updateSlide(editingSlide.id, 'duration', val);
                                  }}
                                  className="admin-input"
                                  style={{ width: '90px', padding: '0.45rem 0.65rem', fontWeight: 800, fontSize: '1rem', color: '#1d4ed8', background: 'white' }}
                                />
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Detik</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  ({Math.floor((currentDur || (isVideo ? 20 : 10)) / 60) > 0 ? `${Math.floor((currentDur || (isVideo ? 20 : 10)) / 60)} menit ${(currentDur || (isVideo ? 20 : 10)) % 60} dtk` : `${currentDur || (isVideo ? 20 : 10)} detik`})
                                </span>
                              </div>

                              {/* Tombol Pilihan Preset Cepat */}
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Pilihan Cepat:</span>
                                {(isVideo ? [5, 10, 15, 20, 30, 45, 60, 90, 120] : [3, 5, 8, 10, 12, 15, 20, 30, 60]).map(sec => (
                                  <button
                                    key={sec}
                                    type="button"
                                    onClick={() => updateSlide(editingSlide.id, 'duration', sec)}
                                    style={{
                                      padding: '0.25rem 0.55rem',
                                      borderRadius: '0.35rem',
                                      fontSize: '0.75rem',
                                      fontWeight: currentDur === sec ? 800 : 600,
                                      background: currentDur === sec ? '#2563eb' : '#f1f5f9',
                                      color: currentDur === sec ? 'white' : '#334155',
                                      border: `1px solid ${currentDur === sec ? '#2563eb' : '#cbd5e1'}`,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    {sec}s
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pilihan 3: Ikuti Standar Global TV */}
                      <div
                        onClick={() => updateSlide(editingSlide.id, 'duration', null)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          background: isDefault ? '#f8fafc' : 'white',
                          border: `1.5px solid ${isDefault ? '#94a3b8' : '#cbd5e1'}`,
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`duration_mode_${editingSlide.id}`}
                          checked={isDefault}
                          onChange={() => updateSlide(editingSlide.id, 'duration', null)}
                          style={{ marginTop: '0.2rem', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                            🌐 Ikuti Durasi Standar TV ({localSlideDuration || 8} detik)
                          </span>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                            Slide ini akan mengikuti setelan umum durasi perangkat TV ({localSlideDuration || 8} detik).
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SEKSI 4: TARGET TAYANGAN LAYAR TV */}
              <div className="slide-section" style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div className="slide-section-title" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Tv size={16} color="#2563eb" /> TARGET LAYAR DISPLAY TV
                </div>

                {(() => {
                  const { isGlobal, targets } = getTargetTvs(editingSlide);

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Pilihan 1: Semua TV */}
                      <div
                        onClick={() => {
                          updateSlide(editingSlide.id, 'targetTvs', []);
                          updateSlide(editingSlide.id, 'target_tvs', []);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.65rem',
                          border: `2px solid ${isGlobal ? '#2563eb' : '#e2e8f0'}`,
                          background: isGlobal ? '#eff6ff' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="radio"
                          name="target_tv_radio"
                          checked={isGlobal}
                          onChange={() => {
                            updateSlide(editingSlide.id, 'targetTvs', []);
                            updateSlide(editingSlide.id, 'target_tvs', []);
                          }}
                          style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isGlobal ? '#1e40af' : '#1e293b' }}>
                            {isMainCampus 
                              ? '🌐 Tampilkan di Seluruh Layar TV Kampus (Global)' 
                              : `🌐 Tampilkan di Seluruh Layar TV Fakultas (${currentFaculty.toUpperCase()})`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isGlobal ? '#3b82f6' : '#64748b' }}>
                            Slide otomatis tayang di setiap TV tanpa batasan (rekomendasi).
                          </div>
                        </div>
                      </div>

                      {/* Pilihan 2: TV Tertentu */}
                      <div
                        onClick={() => {
                          if (isGlobal) {
                            const initial = availableTvs.length > 0 ? [String(availableTvs[0].id)] : [];
                            updateSlide(editingSlide.id, 'targetTvs', initial);
                            updateSlide(editingSlide.id, 'target_tvs', initial);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.65rem',
                          border: `2px solid ${!isGlobal ? '#2563eb' : '#e2e8f0'}`,
                          background: !isGlobal ? '#eff6ff' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="radio"
                          name="target_tv_radio"
                          checked={!isGlobal}
                          onChange={() => {
                            if (isGlobal) {
                              const initial = availableTvs.length > 0 ? [String(availableTvs[0].id)] : [];
                              updateSlide(editingSlide.id, 'targetTvs', initial);
                              updateSlide(editingSlide.id, 'target_tvs', initial);
                            }
                          }}
                          style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: !isGlobal ? '#1e40af' : '#1e293b' }}>
                            🎯 Tampilkan Hanya di Layar TV Tertentu
                          </div>
                          <div style={{ fontSize: '0.75rem', color: !isGlobal ? '#3b82f6' : '#64748b' }}>
                            Pilih secara spesifik perangkat TV mana yang menayangkan slide ini.
                          </div>
                        </div>
                      </div>

                      {/* DAFTAR CHECKBOX TV */}
                      {!isGlobal && (
                        <div style={{ background: 'white', padding: '0.85rem', borderRadius: '0.65rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                              Daftar TV Tersedia ({availableTvs.length}):
                            </span>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const allIds = availableTvs.map(t => String(t.id));
                                  updateSlide(editingSlide.id, 'targetTvs', allIds);
                                  updateSlide(editingSlide.id, 'target_tvs', allIds);
                                }}
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.35rem', color: '#2563eb', cursor: 'pointer' }}
                              >
                                Pilih Semua
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateSlide(editingSlide.id, 'targetTvs', []);
                                  updateSlide(editingSlide.id, 'target_tvs', []);
                                }}
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.35rem', color: '#64748b', cursor: 'pointer' }}
                              >
                                Kosongkan
                              </button>
                            </div>
                          </div>

                          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {availableTvs.length === 0 ? (
                              <div style={{ padding: '1rem', textAlign: 'center', color: '#b45309', background: '#fffbeb', borderRadius: '0.5rem', fontSize: '0.82rem' }}>
                                Belum ada TV terdaftar untuk unit ini.
                              </div>
                            ) : (
                              availableTvs.map(dev => {
                                const devIdStr = String(dev.id);
                                const isChecked = targets.includes(devIdStr) || targets.includes(dev.code);

                                return (
                                  <label
                                    key={dev.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: '0.45rem',
                                      background: isChecked ? '#eff6ff' : '#f8fafc',
                                      border: `1px solid ${isChecked ? '#93c5fd' : '#e2e8f0'}`,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          let updatedTargets;
                                          if (e.target.checked) {
                                            updatedTargets = [...targets.filter(id => id !== devIdStr && id !== dev.code), devIdStr];
                                          } else {
                                            updatedTargets = targets.filter(id => id !== devIdStr && id !== dev.code);
                                          }
                                          updateSlide(editingSlide.id, 'targetTvs', updatedTargets);
                                          updateSlide(editingSlide.id, 'target_tvs', updatedTargets);
                                        }}
                                        style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                                      />
                                      <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{dev.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{dev.location || 'Lokasi umum'} • Kode: {dev.code}</div>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '0.3rem', background: '#dbeafe', color: '#1e40af' }}>
                                      #{dev.id}
                                    </span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc', borderRadius: '0 0 1.25rem 1.25rem', position: 'sticky', bottom: 0, zIndex: 10 }}>
              <button
                type="button"
                onClick={() => {
                  deleteSlide(editingSlide.id);
                  setEditingSlideId(null);
                }}
                style={{
                  padding: '0.6rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.55rem',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Trash2 size={15} /> Hapus Slide Ini
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingSlideId(null)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.55rem',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSlideId(null);
                    showToastPopup('Perubahan slide tersimpan di draft! (Klik "Publikasikan ke TV" untuk sinkronisasi)');
                  }}
                  style={{
                    padding: '0.6rem 1.45rem',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '0.55rem',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                  }}
                >
                  <Check size={16} /> Selesai & Simpan
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
