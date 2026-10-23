import { X, Save } from 'lucide-react';

export default function ScheduleModal({
  isOpen,
  onClose,
  editingSchedule,
  setEditingSchedule,
  isExisting,
  masterRooms,
  onSave
}) {
  if (!isOpen || !editingSchedule) return null;

  const PIC_PRESETS = [
    'Evi Susanti, S.Si., M.I.Kom.',
    'Gusti Maya Sari, S. IP.',
    'Yuliastuti, S.IP.',
    'Anton Yuliarto, S.Kom.',
    'H. Thamrin Hasan, M.Pd.',
    'Listya Oktaviana, S.Sos.'
  ];

  const allRooms = Array.from(new Set((masterRooms || []).map(r => r.name).filter(Boolean)));
  const isPresetRoom = allRooms.includes(editingSchedule.loc);
  const isPresetPic = PIC_PRESETS.includes(editingSchedule.pic);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
      <div className="modal-content" style={{ background: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
            {isExisting ? 'Ubah Kegiatan' : 'Tambah Kegiatan Baru'}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Kegiatan</label>
            <input type="text" value={editingSchedule.title} onChange={(e) => setEditingSchedule({...editingSchedule, title: e.target.value})} className="admin-input" placeholder="Misal: Rapat Koordinasi..." />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal</label>
              <input type="date" value={editingSchedule.date} onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})} className="admin-input" />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
              <select value={editingSchedule.status === 'Dibatalkan' ? 'Dibatalkan' : 'Otomatis'} onChange={(e) => setEditingSchedule({...editingSchedule, status: e.target.value})} className="admin-input">
                <option value="Otomatis">Otomatis (Sesuai Waktu)</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu Mulai</label>
              <input type="time" value={editingSchedule.startTime} onChange={(e) => setEditingSchedule({...editingSchedule, startTime: e.target.value})} className="admin-input" />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu Selesai</label>
              <input type="time" value={editingSchedule.endTime} onChange={(e) => setEditingSchedule({...editingSchedule, endTime: e.target.value})} className="admin-input" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ruangan</label>
            <select 
              value={isPresetRoom ? editingSchedule.loc : (editingSchedule.loc ? 'Lainnya' : '')} 
              onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value === 'Lainnya' ? '' : e.target.value})} 
              className="admin-input"
            >
              <option value="">Pilih Ruangan...</option>
              {allRooms.map((rName) => (
                <option key={rName} value={rName}>{rName}</option>
              ))}
              <option value="Lainnya">Lainnya (Isi Manual)...</option>
            </select>
            {!isPresetRoom && (
              <input 
                type="text" 
                value={editingSchedule.loc} 
                onChange={(e) => setEditingSchedule({...editingSchedule, loc: e.target.value})} 
                className="admin-input" 
                placeholder="Ketik nama ruangan khusus..." 
                style={{ marginTop: '0.5rem' }} 
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PIC Kegiatan</label>
              <select 
                value={isPresetPic ? editingSchedule.pic : (editingSchedule.pic ? 'Lainnya' : '')} 
                onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value === 'Lainnya' ? '' : e.target.value})} 
                className="admin-input"
              >
                <option value="">Pilih PIC...</option>
                {PIC_PRESETS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Lainnya">Lainnya (Isi Sendiri)...</option>
              </select>
              {!isPresetPic && editingSchedule.pic !== '' && (
                <input type="text" value={editingSchedule.pic} onChange={(e) => setEditingSchedule({...editingSchedule, pic: e.target.value})} className="admin-input" placeholder="Ketik nama PIC..." style={{ marginTop: '0.5rem' }} />
              )}
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kategori Mitra</label>
              <select value={editingSchedule.partnerCategory === 'Internal' ? 'Internal' : 'Eksternal'} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value === 'Eksternal' ? '' : 'Internal'})} className="admin-input">
                <option value="Internal">Internal</option>
                <option value="Eksternal">Eksternal (Isi Nama Mitra)...</option>
              </select>
              {editingSchedule.partnerCategory !== 'Internal' && (
                <input type="text" value={editingSchedule.partnerCategory} onChange={(e) => setEditingSchedule({...editingSchedule, partnerCategory: e.target.value})} className="admin-input" placeholder="Ketik nama mitra..." style={{ marginTop: '0.5rem' }} />
              )}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deskripsi Tambahan</label>
            <textarea value={editingSchedule.description} onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})} className="admin-input" placeholder="Tambahkan keterangan singkat tentang kegiatan..." rows="2"></textarea>
          </div>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#f8fafc', borderRadius: '0 0 0.75rem 0.75rem' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Batal</button>
          <button onClick={onSave} style={{ padding: '0.6rem 1.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Save size={16} /> Simpan</button>
        </div>
      </div>
    </div>
  );
}
