import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Clock, Calendar, MapPin } from 'lucide-react';

export default function ScheduleModal({
  isOpen,
  onClose,
  editingSchedule,
  setEditingSchedule,
  isExisting,
  masterRooms,
  onSave
}) {
  const PIC_PRESETS = [
    'Evi Susanti, S.Si., M.I.Kom.',
    'Gusti Maya Sari, S. IP.',
    'Yuliastuti, S.IP.',
    'Anton Yuliarto, S.Kom.',
    'H. Thamrin Hasan, M.Pd.',
    'Listya Oktaviana, S.Sos.'
  ];

  const allRooms = Array.from(new Set((masterRooms || []).map(r => r.name).filter(Boolean)));
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [isCustomPic, setIsCustomPic] = useState(false);

  // Update flags saat editingSchedule berganti
  useEffect(() => {
    if (editingSchedule) {
      setIsCustomRoom(!allRooms.includes(editingSchedule.loc) && Boolean(editingSchedule.loc));
      setIsCustomPic(!PIC_PRESETS.includes(editingSchedule.pic) && Boolean(editingSchedule.pic));
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
              <input 
                type="text" 
                value={editingSchedule.loc} 
                onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value})} 
                className="admin-input" 
                placeholder="Ketik nama ruangan khusus di sini..." 
                style={{ marginTop: '0.5rem', fontWeight: 600 }} 
                autoFocus
              />
            )}
          </div>

          {/* PIC & KATEGORI MITRA */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PIC Kegiatan</label>
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
                style={{ fontWeight: 600 }}
              >
                <option value="">-- Pilih PIC Penanggung Jawab --</option>
                {PIC_PRESETS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Lainnya">Lainnya (Ketik Nama Sendiri)...</option>
              </select>
              {isCustomPic && (
                <input 
                  type="text" 
                  value={editingSchedule.pic} 
                  onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value})} 
                  className="admin-input" 
                  placeholder="Ketik nama PIC penanggung jawab..." 
                  style={{ marginTop: '0.5rem', fontWeight: 600 }} 
                />
              )}
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kategori Mitra</label>
              <select value={editingSchedule.partnerCategory === 'Internal' ? 'Internal' : 'Eksternal'} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value === 'Eksternal' ? '' : 'Internal'})} className="admin-input" style={{ fontWeight: 600 }}>
                <option value="Internal">Internal (UNRI)</option>
                <option value="Eksternal">Eksternal (Ketik Nama Mitra)...</option>
              </select>
              {editingSchedule.partnerCategory !== 'Internal' && (
                <input type="text" value={editingSchedule.partnerCategory} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value})} className="admin-input" placeholder="Ketik nama instansi / mitra luar..." style={{ marginTop: '0.5rem', fontWeight: 600 }} />
              )}
            </div>
          </div>

          {/* DESKRIPSI TAMBAHAN */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deskripsi Tambahan</label>
            <textarea value={editingSchedule.description || ''} onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})} className="admin-input" placeholder="Tambahkan rincian / keterangan singkat mengenai kegiatan ini..." rows="2"></textarea>
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#f8fafc', borderRadius: '0 0 0.85rem 0.85rem' }}>
          <button onClick={onClose} style={{ padding: '0.65rem 1.35rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.55rem', cursor: 'pointer', fontWeight: 600, color: '#475569', transition: 'all 0.15s' }}>Batal</button>
          <button onClick={onSave} style={{ padding: '0.65rem 1.45rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '0.55rem', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)', transition: 'all 0.15s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Save size={16} /> Simpan Kegiatan
          </button>
        </div>

      </div>
    </div>
  );
}

