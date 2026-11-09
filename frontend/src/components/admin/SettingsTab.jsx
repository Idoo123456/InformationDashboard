import { Save, Building2, LayoutDashboard, Palette, Check, Clock, Lock, LayoutGrid } from 'lucide-react';
import { PRESET_COLORS } from '../../utils/themeUtils';

export default function SettingsTab({
  localFaculty,
  setLocalFaculty,
  localSubUnit,
  setLocalSubUnit,
  localAccreditation,
  setLocalAccreditation,
  localCampusLocation,
  setLocalCampusLocation,
  localOperationalHours,
  setLocalOperationalHours,
  localTagline,
  setLocalTagline,
  localTvLayout,
  setLocalTvLayout,
  localTuCardGrid = '3x2',
  setLocalTuCardGrid,
  activeWorkingColor,
  handleColorChange,
  localSlideDuration,
  setLocalSlideDuration,
  localTimeOn,
  setLocalTimeOn,
  localTimeOff,
  setLocalTimeOff,
  localAutoRefresh,
  setLocalAutoRefresh,
  handleSaveSettings,
  logoUnri
}) {
  return (
    <div className="settings-container">
      
      {/* HEADER BAR DENGAN TOMBOL SIMPAN */}
      <div className="settings-header-bar">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
            Pengaturan Umum & Preferensi TV
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.86rem' }}>
            Konfigurasi identitas instansi, jam layanan, tata letak, dan jadwal operasional layar
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          className="settings-save-btn"
        >
          <Save size={18} /> Simpan Semua Pengaturan
        </button>
      </div>

      <div className="settings-grid">
      
        {/* Card 1: Identitas Unit & Kampus */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>Identitas Unit & Kampus</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Data identitas resmi yang tampil pada header TV Display</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <label style={{ fontWeight: 700, color: '#334155', margin: 0, fontSize: '0.88rem' }}>Nama Resmi Fakultas / Unit</label>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                fontSize: '0.73rem', 
                fontWeight: 700, 
                color: '#475569', 
                background: '#f1f5f9', 
                padding: '0.2rem 0.65rem', 
                borderRadius: '999px',
                border: '1px solid #cbd5e1'
              }}>
                <Lock size={12} style={{ color: '#059669' }} /> Sesuai Akun Login (Terkunci)
              </span>
            </div>
            <input 
              type="text" 
              value={localFaculty || ''} 
              readOnly
              disabled
              className="admin-input" 
              placeholder="Nama Resmi Fakultas / Unit"
              style={{ 
                fontWeight: 700,
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                borderColor: '#cbd5e1',
                cursor: 'not-allowed',
                boxShadow: 'none'
              }}
            />
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
              Identitas unit resmi ditetapkan otomatis berdasarkan akun hak akses fakultas yang sedang aktif.
            </p>
          </div>

          <div className="settings-2col" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
                Sub-Unit / Lembaga / UPA
              </label>
              <input 
                type="text" 
                value={localSubUnit || ''} 
                onChange={(e) => setLocalSubUnit(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: UPA Perpustakaan" 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
                Status Akreditasi / Badge
              </label>
              <input 
                type="text" 
                value={localAccreditation || ''} 
                onChange={(e) => setLocalAccreditation(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: Akreditasi Unggul" 
              />
            </div>
          </div>

          <div className="settings-2col" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
                Lokasi Gedung / Kampus
              </label>
              <input 
                type="text" 
                value={localCampusLocation || ''} 
                onChange={(e) => setLocalCampusLocation(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: Kampus Bina Widya Km 12.5" 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
                Jam Layanan Operasional
              </label>
              <input 
                type="text" 
                value={localOperationalHours || ''} 
                onChange={(e) => setLocalOperationalHours(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: 08:00 - 16:00 WIB" 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
              Slogan / Tagline Institusi
            </label>
            <input 
              type="text" 
              value={localTagline || ''} 
              onChange={(e) => setLocalTagline(e.target.value)} 
              className="admin-input" 
              placeholder="Contoh: Jantung Hati Masyarakat Riau" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
              Branding Logo Resmi
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <img src={logoUnri} alt="Logo UNRI" style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Logo Resmi Universitas Riau</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Tampil otomatis di pojok kiri atas seluruh layar TV display</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Preferensi Tampilan Layar TV */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}>
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>Preferensi Tampilan Layar TV</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Atur tata letak default dan palet warna identitas visual monitor</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
              Tata Letak Layar Default (Layout)
            </label>
            <select 
              className="admin-input" 
              value={localTvLayout} 
              onChange={(e) => setLocalTvLayout(e.target.value)}
              style={{ fontWeight: 700 }}
            >
              <option value="standard">Standard (Agenda Kiri + Slide Kanan)</option>
              <option value="full-media">Full Media (Slide Flyer Layar Penuh)</option>
              <option value="agenda-focus">Fokus Agenda (Agenda Lebar + Slide Mini)</option>
              <option value="tu">Tema Tata Usaha (2 Kolom: Agenda Minggu Ini & Mendatang)</option>
              <option value="admin">Tema Admin (Profesional, Sidebar Info Lengkap)</option>
            </select>
          </div>

          {/* PILIHAN FORMAT GRID KARTU (KHUSUS TATA USAHA / TU) */}
          <div className="form-group" style={{ 
            background: '#f8fafc', 
            padding: '1.1rem', 
            borderRadius: '0.75rem', 
            border: '1px solid #cbd5e1', 
            marginBottom: '1.25rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <label style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
                <LayoutGrid size={16} style={{ color: '#2563eb' }} />
                Format Grid Kartu Layar TU
              </label>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: '#2563eb', 
                background: '#eff6ff', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '999px',
                border: '1px solid #bfdbfe'
              }}>
                Layout Tata Usaha
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
              Atur jumlah susunan kartu agenda per slide (3x2, 4x2, atau 3x3) agar pas di layar TV:
            </p>

            <div className="settings-tu-grid">
              {/* Opsi 1: 3x2 (6 Kegiatan) */}
              <button
                type="button"
                onClick={() => setLocalTuCardGrid && setLocalTuCardGrid('3x2')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '0.65rem',
                  border: localTuCardGrid === '3x2' ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1',
                  background: localTuCardGrid === '3x2' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: localTuCardGrid === '3x2' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                  transform: localTuCardGrid === '3x2' ? 'translateY(-2px)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: localTuCardGrid === '3x2' ? '#1d4ed8' : '#0f172a' }}>
                  3 × 2
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: localTuCardGrid === '3x2' ? '#2563eb' : '#334155', marginTop: '3px' }}>
                  6 Kegiatan / Slide
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Standar Proporsional
                </span>
              </button>

              {/* Opsi 2: 4x2 (8 Kegiatan) */}
              <button
                type="button"
                onClick={() => setLocalTuCardGrid && setLocalTuCardGrid('4x2')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '0.65rem',
                  border: localTuCardGrid === '4x2' ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1',
                  background: localTuCardGrid === '4x2' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: localTuCardGrid === '4x2' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                  transform: localTuCardGrid === '4x2' ? 'translateY(-2px)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: localTuCardGrid === '4x2' ? '#1d4ed8' : '#0f172a' }}>
                  4 × 2
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: localTuCardGrid === '4x2' ? '#2563eb' : '#334155', marginTop: '3px' }}>
                  8 Kegiatan / Slide
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Padat Melebar
                </span>
              </button>

              {/* Opsi 3: 3x3 (9 Kegiatan) */}
              <button
                type="button"
                onClick={() => setLocalTuCardGrid && setLocalTuCardGrid('3x3')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '0.65rem',
                  border: localTuCardGrid === '3x3' ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1',
                  background: localTuCardGrid === '3x3' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: localTuCardGrid === '3x3' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                  transform: localTuCardGrid === '3x3' ? 'translateY(-2px)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: localTuCardGrid === '3x3' ? '#1d4ed8' : '#0f172a' }}>
                  3 × 3
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: localTuCardGrid === '3x3' ? '#2563eb' : '#334155', marginTop: '3px' }}>
                  9 Kegiatan / Slide
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Maksimal & Padat
                </span>
              </button>
            </div>
          </div>

          {/* PENGATURAN WARNA IDENTITAS INSTANSI */}
          <div className="form-group" style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', marginBottom: '1.25rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: '0 0 0.2rem 0' }}>
                <Palette size={16} style={{ color: activeWorkingColor }} />
                Warna Utama & Tema Tampilan
              </label>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Pilih palet warna resmi untuk aksen header, kartu, dan teks layar:
              </span>
            </div>

            {/* Color Presets Palette */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PRESET_COLORS.map(colorItem => {
                  const isColorActive = (activeWorkingColor || '').toLowerCase() === colorItem.hex.toLowerCase();
                  return (
                    <div 
                      key={colorItem.hex}
                      onClick={() => handleColorChange(colorItem.hex)}
                      title={`${colorItem.name} (${colorItem.hex})`}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: colorItem.hex, 
                        cursor: 'pointer', 
                        position: 'relative',
                        border: isColorActive ? '3px solid #ffffff' : '2px solid #ffffff', 
                        boxShadow: isColorActive ? `0 0 0 2px ${colorItem.hex}, 0 4px 8px rgba(0,0,0,0.18)` : '0 1px 3px rgba(0,0,0,0.1)', 
                        transform: isColorActive ? 'scale(1.15)' : 'scale(1)', 
                        transition: 'all 0.2s' 
                      }}
                    >
                      {isColorActive && (
                        <Check size={14} color="#ffffff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Input & Hex Code */}
            <div className="settings-color-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="color" 
                  value={activeWorkingColor || '#3b82f6'} 
                  onChange={(e) => handleColorChange(e.target.value)} 
                  style={{ width: '36px', height: '34px', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: 0, background: 'transparent' }} 
                />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Kustom:</span>
              </div>
              <input 
                type="text" 
                value={activeWorkingColor || ''} 
                onChange={(e) => handleColorChange(e.target.value)} 
                placeholder="#RRGGBB"
                maxLength={7}
                className="admin-input" 
                style={{ width: '95px', padding: '0.35rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center', height: '34px' }} 
              />

              {/* Live Mini Preview badge */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: `${activeWorkingColor}18`, padding: '0.3rem 0.65rem', borderRadius: '999px', border: `1px solid ${activeWorkingColor}44` }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeWorkingColor }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: activeWorkingColor }}>
                  {activeWorkingColor}
                </span>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
              Durasi Rotasi Slide Default
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input 
                type="number" 
                min="3" 
                max="60" 
                value={localSlideDuration || 10} 
                onChange={(e) => setLocalSlideDuration(Number(e.target.value))} 
                className="admin-input"
                style={{ width: '85px', textAlign: 'center', fontWeight: 800 }}
              />
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                detik per slide (otomatis berganti ke slide berikutnya)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Jadwal Operasional Layar & Otomasi Hemat Daya */}
        <div className="card settings-card" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>Jadwal Operasional Layar & Otomasi Hemat Daya</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Manajemen jam aktif TV kampus dan sinkronisasi otomatis latar belakang</p>
            </div>
          </div>

          <div className="settings-3col">
            {/* Kolom 1: Zona Waktu */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontWeight: 800, color: '#334155', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                Zona Waktu Server
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#dbeafe', color: '#1e40af', fontWeight: 800, fontSize: '0.82rem' }}>
                  WIB (UTC+7)
                </span>
                <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 700 }}>Pekanbaru, Riau</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>
                Waktu TV display terkunci otomatis ke Waktu Indonesia Barat sesuai lokasi kampus Universitas Riau.
              </p>
            </div>

            {/* Kolom 2: Jam Operasional TV */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontWeight: 800, color: '#334155', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                Otomasi Jam Nyala & Siaga TV
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>Nyala (On):</span>
                  <input type="time" value={localTimeOn || '07:00'} onChange={(e) => setLocalTimeOn(e.target.value)} className="admin-input" style={{ width: '100%', padding: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>Siaga (Off):</span>
                  <input type="time" value={localTimeOff || '17:00'} onChange={(e) => setLocalTimeOff(e.target.value)} className="admin-input" style={{ width: '100%', padding: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>
                Di luar jam tersebut, monitor TV otomatis masuk mode Standby gelap untuk menghemat daya listrik.
              </p>
            </div>

            {/* Kolom 3: Auto-Refresh */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontWeight: 800, color: '#334155', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                Sinkronisasi Otomatis
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 700, color: '#1e293b', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                <input 
                  type="checkbox" 
                  checked={Boolean(localAutoRefresh)} 
                  onChange={(e) => setLocalAutoRefresh(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} 
                />
                Auto-refresh data tiap 5 menit
              </label>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>
                Layar TV akan otomatis memperbarui agenda baru dan slide tanpa perlu operator memuat ulang browser TV.
              </p>
            </div>
          </div>
        </div>

        {/* DOCKED SAVE FOOTER */}
        <div className="settings-footer-bar">
          <span style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            💡 Seluruh perubahan pengaturan akan langsung tersinkronisasi ke layar TV display kampus.
          </span>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="settings-save-btn"
          >
            <Save size={18} /> Simpan Semua Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}