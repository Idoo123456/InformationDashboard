import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Clock, Calendar, MapPin, Briefcase, Tv, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { useDashboard } from '../../context/DashboardContext';
import { DEFAULT_CAMPUS_TVS, fetchCampusTvDevices } from '../../utils/tvDevices';
import { findRoomConflict, showRoomConflictPopup } from '../../utils/adminAlerts';

export default function ScheduleModal({
  isOpen,
  onClose,
  editingSchedule,
  setEditingSchedule,
  isExisting,
  masterRooms,
  availableTvs: propTvs,
  existingSchedules,
  onSave
}) {
  const { prefix, currentUser } = useDashboard();
  const currentFaculty = currentUser?.faculty_prefix || prefix || 'main';
  const activeFaculty = currentFaculty;

  const PIC_PRESETS = [
    'Evi Susanti, S.Si., M.I.Kom.',
    'Gusti Maya Sari, S. IP.',
    'Yuliastuti, S.IP.',
    'Anton Yuliarto, S.Kom.',
    'H. Thamrin Hasan, M.Pd.',
    'Listya Oktaviana, S.Sos.'
  ];

  // State master PIC internal dengan sinkronisasi dari database
  const [picsList, setPicsList] = useState(PIC_PRESETS);

  // State master ruangan internal dengan sinkronisasi dari API backend & props
  const [internalRooms, setInternalRooms] = useState(() => (Array.isArray(masterRooms) && masterRooms.length > 0 ? masterRooms : []));

  useEffect(() => {
    if (Array.isArray(masterRooms) && masterRooms.length > 0) {
      setInternalRooms(masterRooms);
    }
  }, [masterRooms]);

  // Ambil data ruangan, PIC, & TV terbaru langsung dari server setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      const activeFaculty = currentUser?.faculty_prefix || prefix || 'main';
      const isSuper = currentUser?.role === 'superadmin' || activeFaculty === 'main';

      // 1. Ambil data Ruangan (Super Admin melihat semua ruangan, fakultas melihat ruangan fakultasnya + pusat)
      fetch(`/api/rooms?faculty=${activeFaculty}${isSuper ? '&all=true' : ''}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setInternalRooms(data);
          }
        })
        .catch(err => console.error('Gagal mengambil data ruangan di ScheduleModal:', err));

      // 2. Ambil data PIC dari database
      fetch(`/api/pics?faculty=${activeFaculty}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPicsList(data);
          }
        })
        .catch(err => console.error('Gagal mengambil data PIC di ScheduleModal:', err));

      // 3. Ambil data TV khusus fakultas ini
      fetchCampusTvDevices(currentFaculty).then(data => {
        if (Array.isArray(data)) {
          setAvailableTvs(data);
        }
      });
    }
  }, [isOpen, currentFaculty, currentUser?.faculty_prefix, prefix]);

  // Kumpulan seluruh PIC: dari database API, jadwal yang sudah ada, & preset default
  const allPics = Array.from(new Set([
    ...(picsList || []),
    ...(existingSchedules || []).map(s => s?.pic).filter(Boolean),
    ...PIC_PRESETS
  ].map(p => (typeof p === 'string' ? p.trim() : '')).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  // Kumpulan seluruh ruangan: dari database API, props masterRooms, dan jadwal fakultas yang bersangkutan
  const campusDefaultRooms = (activeFaculty === 'main' && (!internalRooms || internalRooms.length === 0)) ? [
    'Studio Gurindam 12',
    'Ruang Senat (Lt.5)',
    'Gedung PKM Gobah',
    'TGCL - Meetingroom',
    'TGCL - Podcast',
    'TGCL - Event & Training Area',
    'Ruang Diskusi (Max 15 orang)',
    'Ruang Diskusi (Max 8 orang)',
    'Ruang Rapat Pimpinan',
    'Ruang Sidang Lt.3',
    'Lab Komputer Lt.2',
    'Lobi Utama Rektorat'
  ] : [];

  const allRooms = Array.from(new Set([
    ...(internalRooms || []).map(r => typeof r === 'string' ? r : (r?.name || r?.room_name || '')),
    ...(masterRooms || []).map(r => typeof r === 'string' ? r : (r?.name || r?.room_name || '')),
    ...(existingSchedules || []).map(s => s?.loc || s?.location || ''),
    ...campusDefaultRooms
  ].map(r => (typeof r === 'string' ? r.trim() : '')).filter(Boolean)));

  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [isCustomPic, setIsCustomPic] = useState(false);
  const [isCustomPartner, setIsCustomPartner] = useState(false);

  // State target TV - jika fakultas khusus, gunakan propTvs atau [] agar tidak tercampur TV Pusat
  const isMainCampusModal = currentFaculty === 'main';
  const [availableTvs, setAvailableTvs] = useState(() => (
    propTvs && propTvs.length > 0 ? propTvs : (isMainCampusModal ? DEFAULT_CAMPUS_TVS : [])
  ));
  const [isAllTvMode, setIsAllTvMode] = useState(true);
  const [selectedTargetTvs, setSelectedTargetTvs] = useState([]);

  // Sinkronisasi data TV dari prop parent
  useEffect(() => {
    if (propTvs) {
      setAvailableTvs(propTvs);
    }
  }, [propTvs]);

  // Update flags saat editingSchedule berganti
  useEffect(() => {
    if (editingSchedule) {
      setIsCustomRoom(!allRooms.includes(editingSchedule.loc) && Boolean(editingSchedule.loc));
      setIsCustomPic(!allPics.includes(editingSchedule.pic) && Boolean(editingSchedule.pic));
      const isExt = Boolean(editingSchedule.partnerCategory) && editingSchedule.partnerCategory.trim().toLowerCase() !== 'internal';
      setIsCustomPartner(isExt);

      const targets = editingSchedule.targetTvs || editingSchedule.target_tvs;
      if (!targets || !Array.isArray(targets) || targets.length === 0 || targets.includes('all')) {
        setIsAllTvMode(true);
        setSelectedTargetTvs([]);
      } else {
        setIsAllTvMode(false);
        setSelectedTargetTvs(targets.map(t => String(t)));
      }
    }
  }, [editingSchedule?.id]);

  if (!isOpen || !editingSchedule) return null;

  // Cek secara real-time apakah tanggal/jam sudah lewat
  const checkTimeWarning = () => {
    if (!editingSchedule.date) return null;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    const currH = String(now.getHours()).padStart(2, '0');
    const currM = String(now.getMinutes()).padStart(2, '0');
    const currTimeStr = `${currH}:${currM}`;

    if (editingSchedule.startTime && editingSchedule.endTime && editingSchedule.endTime <= editingSchedule.startTime) {
      return {
        type: 'error',
        title: 'Urutan Waktu Terbalik',
        desc: `Waktu selesai (${editingSchedule.endTime}) tidak boleh lebih awal atau sama dengan waktu mulai (${editingSchedule.startTime}).`
      };
    }
    if (editingSchedule.date < todayStr) {
      return {
        type: 'warning',
        title: 'Tanggal Sudah Terlewat',
        desc: `Tanggal pelaksanaan (${editingSchedule.date}) sudah lewat dari hari ini (${todayStr}). Agenda masa lampau otomatis berstatus 'Selesai' dan tidak akan muncul di layar TV.`
      };
    }
    if (editingSchedule.date === todayStr && editingSchedule.endTime && editingSchedule.endTime <= currTimeStr) {
      return {
        type: 'warning',
        title: 'Jam Kegiatan Sudah Terlewat',
        desc: `Jam selesai (${editingSchedule.endTime}) sudah terlewat dari jam saat ini (${currTimeStr} WIB). Agenda ini otomatis berstatus 'Selesai' dan tidak akan tampil di layar TV.`
      };
    }
    return null;
  };

  const warning = checkTimeWarning();
  const roomConflict = findRoomConflict(editingSchedule, existingSchedules);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
      <div className="modal-content" style={{ background: 'white', borderRadius: '0.85rem', width: '100%', maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', border: '1px solid #e2e8f0' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
              {isExisting ? 'Ubah Kegiatan' : 'Tambah Kegiatan Baru'}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Kolom bertanda (<span style={{ color: '#ef4444', fontWeight: 700 }}>*</span>) wajib diisi sebelum menyimpan.</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* ALERT PENGUNCIAN RUANGAN (ROOM TIME CONFLICT) */}
          {roomConflict && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #f87171',
              borderRadius: '0.65rem',
              padding: '0.9rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              color: '#991b1b',
              fontSize: '0.85rem',
              lineHeight: 1.45,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#b91c1c', fontSize: '0.92rem' }}>
                  ⛔ Ruangan Sudah Dipinjam pada Jam Ini!
                </strong>
                Ruangan <strong>{roomConflict.loc || editingSchedule.loc}</strong> pada tanggal <strong>{roomConflict.date}</strong> jam <strong>{editingSchedule.startTime} - {editingSchedule.endTime} WIB</strong> sudah dipesan oleh:
                <div style={{ marginTop: '0.35rem', background: 'white', padding: '0.45rem 0.65rem', borderRadius: '0.4rem', border: '1px solid #fecaca', color: '#1e293b' }}>
                  <strong style={{ color: '#0f172a' }}>"{roomConflict.title}"</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Jam dipinjam: <strong style={{ color: '#dc2626' }}>{String(roomConflict.startTime || roomConflict.start_time).slice(0, 5)} - {String(roomConflict.endTime || roomConflict.end_time).slice(0, 5)} WIB</strong> • PIC: {roomConflict.pic || '-'}
                  </div>
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>
                  ⚠️ Sistem mengunci jam ruangan ini. Silakan ganti jam kegiatan atau pilih ruangan lain.
                </div>
              </div>
            </div>
          )}

          {/* ALERT PERINGATAN WAKTU TERLEWAT / WAKTU TERBALIK */}
          {warning && (
            <div style={{
              background: warning.type === 'error' ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${warning.type === 'error' ? '#fecaca' : '#fde68a'}`,
              borderRadius: '0.65rem',
              padding: '0.85rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              color: warning.type === 'error' ? '#991b1b' : '#92400e',
              fontSize: '0.85rem',
              lineHeight: 1.45
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: warning.type === 'error' ? '#dc2626' : '#d97706' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>⚠️ {warning.title}</strong>
                {warning.desc}
              </div>
            </div>
          )}

          {/* NAMA KEGIATAN */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Nama Kegiatan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              value={editingSchedule.title} 
              onChange={(e) => setEditingSchedule({...editingSchedule, title: e.target.value})} 
              className="admin-input" 
              placeholder="Misal: Rapat Koordinasi Pimpinan / Workshop AI..." 
              style={{ fontWeight: 600, color: '#0f172a' }}
            />
          </div>

          {/* TANGGAL & STATUS */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Calendar size={13} color="#3b82f6" /> Tanggal Pelaksanaan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="date" 
                value={editingSchedule.date} 
                onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})} 
                className="admin-input" 
                style={{ fontWeight: 600 }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Kegiatan</label>
              <select value={editingSchedule.status === 'Dibatalkan' ? 'Dibatalkan' : 'Otomatis'} onChange={(e) => setEditingSchedule({...editingSchedule, status: e.target.value})} className="admin-input" style={{ fontWeight: 600 }}>
                <option value="Otomatis">Otomatis (Sesuai Jam & Tanggal)</option>
                <option value="Dibatalkan">Dibatalkan (Tampilkan Coretan)</option>
              </select>
            </div>
          </div>

          {/* WAKTU MULAI & WAKTU SELESAI */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Clock size={13} color="#10b981" /> Waktu Mulai <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="time" 
                value={editingSchedule.startTime} 
                onChange={(e) => setEditingSchedule({...editingSchedule, startTime: e.target.value})} 
                className="admin-input" 
                style={{ fontWeight: 600 }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Clock size={13} color="#f59e0b" /> Waktu Selesai <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="time" 
                value={editingSchedule.endTime} 
                onChange={(e) => setEditingSchedule({...editingSchedule, endTime: e.target.value})} 
                className="admin-input" 
                style={{ fontWeight: 600 }}
              />
            </div>
          </div>

          {/* RUANGAN KEGIATAN */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <MapPin size={13} color="#ef4444" /> Ruangan Kegiatan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              value={isCustomRoom ? 'Lainnya' : (editingSchedule.loc || '')} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'Lainnya') {
                  setIsCustomRoom(true);
                  setEditingSchedule({ ...editingSchedule, loc: '' });
                } else {
                  setIsCustomRoom(false);
                  setEditingSchedule({ ...editingSchedule, loc: val });
                }
              }} 
              className="admin-input"
              style={{ fontWeight: 600, color: editingSchedule.loc ? '#0f172a' : '#64748b' }}
            >
              <option value="">-- Pilih Ruangan dari Daftar (Wajib) --</option>
              {allRooms.map((rName) => (
                <option key={rName} value={rName}>{rName}</option>
              ))}
              <option value="Lainnya">Lainnya (Ketik Manual Ruangan Khusus)...</option>
            </select>
            {isCustomRoom && (
              <>
                <input 
                  type="text" 
                  value={editingSchedule.loc} 
                  onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value})} 
                  className="admin-input" 
                  placeholder="Ketik nama ruangan khusus di sini..." 
                  style={{ marginTop: '0.5rem', fontWeight: 600 }} 
                  autoFocus
                />
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#0284c7', fontWeight: 500 }}>
                  ℹ️ Ruangan baru yang Anda ketik ini otomatis didaftarkan ke Master Ruangan & database.
                </p>
              </>
            )}
          </div>

          {/* PIC & KATEGORI MITRA */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <User size={13} color="#2563eb" /> PIC Kegiatan
              </label>
              <select 
                value={isCustomPic ? 'Lainnya' : (editingSchedule.pic || '')} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Lainnya') {
                    setIsCustomPic(true);
                    setEditingSchedule({ ...editingSchedule, pic: '' });
                  } else {
                    setIsCustomPic(false);
                    setEditingSchedule({ ...editingSchedule, pic: val });
                  }
                }} 
                className="admin-input"
                style={{ fontWeight: 600, color: editingSchedule.pic ? '#0f172a' : '#64748b' }}
              >
                <option value="">-- Pilih PIC Penanggung Jawab --</option>
                {allPics.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Lainnya">Lainnya (Ketik Nama Sendiri)...</option>
              </select>
              {isCustomPic && (
                <>
                  <input 
                    type="text" 
                    value={editingSchedule.pic} 
                    onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value})} 
                    className="admin-input" 
                    placeholder="Ketik nama PIC penanggung jawab baru..." 
                    style={{ marginTop: '0.5rem', fontWeight: 600 }} 
                    autoFocus
                  />
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#0284c7', fontWeight: 500 }}>
                    ℹ️ PIC baru yang Anda ketik ini otomatis disimpan ke database & langsung tersedia di pilihan untuk kegiatan berikutnya.
                  </p>
                </>
              )}
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Briefcase size={13} color="#f97316" /> Kategori Mitra
              </label>
              <select 
                value={isCustomPartner ? 'Eksternal' : 'Internal'} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Eksternal') {
                    setIsCustomPartner(true);
                    if (!editingSchedule.partnerCategory || editingSchedule.partnerCategory.trim().toLowerCase() === 'internal') {
                      setEditingSchedule({ ...editingSchedule, partnerCategory: '' });
                    }
                  } else {
                    setIsCustomPartner(false);
                    setEditingSchedule({ ...editingSchedule, partnerCategory: 'Internal' });
                  }
                }} 
                className="admin-input" 
                style={{ fontWeight: 600 }}
              >
                <option value="Internal">Internal (UNRI)</option>
                <option value="Eksternal">Eksternal (Ketik Nama Mitra / Instansi)...</option>
              </select>
              {isCustomPartner && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={editingSchedule.partnerCategory === 'Internal' ? '' : (editingSchedule.partnerCategory || '')} 
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, partnerCategory: e.target.value })} 
                    className="admin-input" 
                    placeholder="Ketik nama instansi / mitra luar (contoh: PT Telkom, Kemendikbud)..." 
                    style={{ fontWeight: 600, borderColor: '#fdba74', background: '#fff7ed' }} 
                    autoFocus
                  />
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.74rem', color: '#c2410c' }}>
                    ℹ️ Jika nama mitra dikosongkan, otomatis disimpan sebagai "Eksternal".
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* DESKRIPSI TAMBAHAN */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deskripsi Tambahan</label>
            <textarea value={editingSchedule.description || ''} onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})} className="admin-input" placeholder="Tambahkan rincian / keterangan singkat mengenai kegiatan ini..." rows="2"></textarea>
          </div>

          {/* TARGET LAYAR TV */}
          <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Tv size={15} color="#2563eb" /> Target Tampilan Layar TV (Digital Signage)
            </label>

            {/* Opsi 1: Semua TV */}
            <div
              onClick={() => setIsAllTvMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '0.55rem',
                border: `2px solid ${isAllTvMode ? '#2563eb' : '#e2e8f0'}`,
                background: isAllTvMode ? '#eff6ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <input
                type="radio"
                name="schedule_tv_mode"
                checked={isAllTvMode}
                onChange={() => setIsAllTvMode(true)}
                style={{ width: '17px', height: '17px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isAllTvMode ? '#1e40af' : '#1e293b' }}>
                  {isMainCampusModal 
                    ? '🌐 Tampilkan di Seluruh Layar TV (Global)' 
                    : `🌐 Tampilkan di Seluruh Layar TV Fakultas (${activeFaculty.toUpperCase()})`}
                </div>
                <div style={{ fontSize: '0.75rem', color: isAllTvMode ? '#3b82f6' : '#64748b' }}>
                  {isMainCampusModal 
                    ? 'Kegiatan ini akan otomatis tayang di setiap layar TV kampus tanpa batasan (default).' 
                    : `Kegiatan ini akan otomatis tayang di setiap layar TV fakultas ${activeFaculty.toUpperCase()} (default).`}
                </div>
              </div>
            </div>

            {/* Opsi 2: TV Tertentu */}
            <div
              onClick={() => setIsAllTvMode(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '0.55rem',
                border: `2px solid ${!isAllTvMode ? '#2563eb' : '#e2e8f0'}`,
                background: !isAllTvMode ? '#eff6ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <input
                type="radio"
                name="schedule_tv_mode"
                checked={!isAllTvMode}
                onChange={() => setIsAllTvMode(false)}
                style={{ width: '17px', height: '17px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: !isAllTvMode ? '#1e40af' : '#1e293b' }}>
                  {isMainCampusModal 
                    ? '🎯 Tampilkan Hanya di TV Tertentu (Contoh: TV 1, TV 3)' 
                    : `🎯 Tampilkan Hanya di TV Tertentu (${activeFaculty.toUpperCase()})`}
                </div>
                <div style={{ fontSize: '0.75rem', color: !isAllTvMode ? '#3b82f6' : '#64748b' }}>
                  {isMainCampusModal 
                    ? 'Pilih satu atau beberapa TV khusus untuk menayangkan kegiatan ini.' 
                    : `Pilih satu atau beberapa TV khusus milik fakultas ${activeFaculty.toUpperCase()} untuk menayangkan kegiatan ini.`}
                </div>
              </div>
            </div>

            {/* Checkbox TV Devices List */}
            {!isAllTvMode && (
              <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    Pilih Layar TV Target ({isMainCampusModal ? 'Kampus Pusat' : activeFaculty.toUpperCase()}):
                  </span>
                  {availableTvs.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetTvs(availableTvs.map(t => String(t.id)))}
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.35rem', color: '#2563eb', cursor: 'pointer' }}
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetTvs([])}
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.35rem', color: '#64748b', cursor: 'pointer' }}
                      >
                        Hapus Pilihan
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '0.55rem', padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'white' }}>
                  {availableTvs.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#b45309', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '0.45rem', fontSize: '0.8rem' }}>
                      ⚠️ Belum ada perangkat TV yang terdaftar / disetujui untuk unit <strong>{activeFaculty.toUpperCase()}</strong>.<br/>
                      Silakan ajukan penambahan TV melalui menu <strong>Layar TV & Pengajuan</strong>.
                    </div>
                  ) : (
                    availableTvs.map(dev => {
                      const devIdStr = String(dev.id);
                      const isChecked = selectedTargetTvs.includes(devIdStr) || selectedTargetTvs.includes(dev.code);
                      return (
                        <label
                          key={dev.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.75rem',
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
                                if (e.target.checked) {
                                  setSelectedTargetTvs(prev => [...prev.filter(id => id !== devIdStr && id !== dev.code), devIdStr]);
                                } else {
                                  setSelectedTargetTvs(prev => prev.filter(id => id !== devIdStr && id !== dev.code));
                                }
                              }}
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{dev.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{dev.location || 'Lokasi umum'} • Kode: {dev.code}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '0.1rem 0.4rem', borderRadius: '0.3rem' }}>
                            #{dev.id}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#475569', background: 'white', padding: '0.45rem 0.75rem', borderRadius: '0.45rem', border: '1px solid #e2e8f0' }}>
                  {selectedTargetTvs.length === 0 ? (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Belum ada TV yang dipilih. Silakan centang minimal 1 TV atau pilih 'Semua Layar TV'.</span>
                  ) : (
                    <span>
                      ✅ Ditargetkan ke <strong>{selectedTargetTvs.length} dari {availableTvs.length} TV</strong>: {' '}
                      {selectedTargetTvs.map(t => {
                        const f = availableTvs.find(d => String(d.id) === String(t) || String(d.code) === String(t));
                        return f ? f.name : `TV #${t}`;
                      }).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="schedule-modal-footer">
          <button 
            type="button"
            onClick={onClose} 
            className="schedule-modal-btn-cancel"
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={() => {
              // KUNCI RUANGAN: Cek apakah ruangan sudah dipinjam di jam yang sama
              const conflict = findRoomConflict(editingSchedule, existingSchedules);
              if (conflict) {
                showRoomConflictPopup(conflict, editingSchedule);
                return; // Batalkan dan kunci penyimpanan!
              }

              let finalPartner = editingSchedule.partnerCategory;
              if (isCustomPartner) {
                finalPartner = (finalPartner && finalPartner.trim()) ? finalPartner.trim() : 'Eksternal';
              } else {
                finalPartner = 'Internal';
              }
              const finalTargets = isAllTvMode ? [] : selectedTargetTvs;
              const finalSchedule = {
                ...editingSchedule,
                partnerCategory: finalPartner,
                targetTvs: finalTargets,
                target_tvs: finalTargets
              };

              // Otomatis simpan PIC ke master database dan perbarui list lokal
              if (finalSchedule.pic && finalSchedule.pic.trim()) {
                const picName = finalSchedule.pic.trim();
                fetch('/api/pics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ faculty_prefix: currentFaculty, name: picName })
                }).catch(e => console.warn('Sync pic note:', e));
                setPicsList(prev => Array.from(new Set([...(prev || []), picName])));
              }

              setEditingSchedule(finalSchedule);
              onSave(finalSchedule);
            }} 
            className="schedule-modal-btn-save"
          >
            <Save size={16} /> <span>Simpan Kegiatan</span>
          </button>
        </div>

      </div>
    </div>
  );
}

