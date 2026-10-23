import { Save, Building2, LayoutDashboard, Palette, Check, Clock } from 'lucide-react';
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
    <div style={{ maxWidth: '1200px', margin: '0 auto 2.5rem' }}>
      
      {/* HEADER BAR DENGAN TOMBOL SIMPAN */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        padding: '1.25rem 1.75rem',
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: 700 }}>
            Pengaturan Umum & Preferensi TV
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Konfigurasi identitas instansi, jam layanan, tata letak, dan jadwal operasional layar
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.65rem',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Save size={18} /> Simpan Semua Pengaturan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
      
        {/* Card 1: Identitas Unit & Kampus */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Identitas Unit & Kampus</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Data identitas resmi yang tampil pada header TV Display</p>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, color: '#334155' }}>Nama Resmi Fakultas / Unit</label>
            <input 
              type="text" 
              value={localFaculty} 
              onChange={(e) => setLocalFaculty(e.target.value)} 
              className="admin-input"
              placeholder="Contoh: Fakultas Keguruan dan Ilmu Pendidikan (FKIP)"
              style={{ fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#334155' }}>Sub-Unit / Lembaga / UPA</label>
              <input 
                type="text" 
                value={localSubUnit} 
                onChange={(e) => setLocalSubUnit(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: UPA Perpustakaan" 
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#334155' }}>Status Akreditasi / Badge</label>
              <input 
                type="text" 
                value={localAccreditation} 
                onChange={(e) => setLocalAccreditation(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: Akreditasi Unggul" 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#334155' }}>Lokasi Gedung / Kampus</label>
              <input 
                type="text" 
                value={localCampusLocation} 
                onChange={(e) => setLocalCampusLocation(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: Kampus Bina Widya Km 12.5" 
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#334155' }}>Jam Layanan Operasional</label>
              <input 
                type="text" 
                value={localOperationalHours} 
                onChange={(e) => setLocalOperationalHours(e.target.value)} 
                className="admin-input" 
                placeholder="Contoh: 08:00 - 16:00 WIB" 
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, color: '#334155' }}>Slogan / Tagline Institusi</label>
            <input 
              type="text" 
              value={localTagline} 
              onChange={(e) => setLocalTagline(e.target.value)} 
              className="admin-input" 
              placeholder="Contoh: Jantung Hati Masyarakat Riau" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 600, color: '#334155' }}>Branding Logo Resmi</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <img src={logoUnri} alt="Logo UNRI" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Logo Resmi Universitas Riau</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Tampil otomatis di pojok kiri atas seluruh layar TV display</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Preferensi Tampilan Layar TV */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Preferensi Tampilan Layar TV</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Atur tata letak default dan palet warna identitas visual monitor</p>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, color: '#334155' }}>Tata Letak Layar Default (Layout)</label>
            <select 
              className="admin-input" 
              value={localTvLayout} 
              onChange={(e) => setLocalTvLayout(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              <option value="standard">Standard (Agenda Kiri + Slide Kanan)</option>
              <option value="full-media">Full Media (Slide Flyer Layar Penuh)</option>
              <option value="agenda-focus">Fokus Agenda (Agenda Lebar + Slide Mini)</option>
              <option value="tu">Tema Tata Usaha (2 Kolom: Agenda Minggu Ini & Mendatang)</option>
              <option value="admin">Tema Admin (Profesional, Sidebar Info Lengkap)</option>
            </select>
          </div>

          {/* PENGATURAN WARNA IDENTITAS INSTANSI */}
          <div className="form-group" style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '0.85rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                  <Palette size={17} style={{ color: activeWorkingColor }} />
                  Warna Utama & Tema Tampilan
                </label>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Pilih palet warna resmi untuk aksen header, kartu, dan teks layar:
                </span>
              </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="color" 
                  value={activeWorkingColor} 
                  onChange={(e) => handleColorChange(e.target.value)} 
                  style={{ width: '38px', height: '34px', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: 0, background: 'transparent' }} 
                />
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#475569' }}>Kustom Warna:</span>
              </div>
              <input 
                type="text" 
                value={activeWorkingColor} 
                onChange={(e) => handleColorChange(e.target.value)} 
                placeholder="#RRGGBB"
                maxLength={7}
                className="admin-input" 
                style={{ width: '105px', padding: '0.3rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', height: '32px' }} 
              />

              {/* Live Mini Preview badge */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: `${activeWorkingColor}18`, padding: '0.3rem 0.65rem', borderRadius: '999px', border: `1px solid ${activeWorkingColor}44` }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeWorkingColor }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: activeWorkingColor }}>
                  {activeWorkingColor}
                </span>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 600, color: '#334155' }}>Durasi Rotasi Slide Default</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="number" 
                min="3" 
                max="60" 
                value={localSlideDuration} 
                onChange={(e) => setLocalSlideDuration(Number(e.target.value))} 
                className="admin-input"
                style={{ width: '85px', textAlign: 'center', fontWeight: 700 }}
              />
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                detik per slide (otomatis berganti ke slide berikutnya)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Jadwal Operasional Layar & Otomasi Hemat Daya */}
        <div className="card" style={{ gridColumn: '1 / -1', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Jadwal Operasional Layar & Otomasi Hemat Daya</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Manajemen jam aktif TV kampus dan sinkronisasi otomatis latar belakang</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
            {/* Kolom 1: Zona Waktu */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                Zona Waktu Server
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.85rem' }}>
                  WIB (UTC+7)
                </span>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Pekanbaru, Riau</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                Waktu TV display terkunci otomatis ke Waktu Indonesia Barat sesuai lokasi kampus Universitas Riau.
              </p>
            </div>

            {/* Kolom 2: Jam Operasional TV */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                Otomasi Jam Nyala & Siaga TV
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Layar Aktif (On):</span>
                  <input type="time" value={localTimeOn} onChange={(e) => setLocalTimeOn(e.target.value)} className="admin-input" style={{ width: '100%', padding: '0.4rem', fontWeight: 600 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Layar Mati (Standby):</span>
                  <input type="time" value={localTimeOff} onChange={(e) => setLocalTimeOff(e.target.value)} className="admin-input" style={{ width: '100%', padding: '0.4rem', fontWeight: 600 }} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                Di luar jam tersebut, monitor TV otomatis masuk mode Standby gelap untuk menghemat daya listrik kampus.
              </p>
            </div>

            {/* Kolom 3: Auto-Refresh */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                Sinkronisasi Otomatis
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, color: '#1e293b', fontSize: '0.88rem', marginBottom: '0.6rem' }}>
                <input 
                  type="checkbox" 
                  checked={localAutoRefresh} 
                  onChange={(e) => setLocalAutoRefresh(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} 
                />
                Auto-refresh data tiap 5 menit
              </label>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                Layar TV akan otomatis memperbarui agenda baru dan slide tanpa perlu operator memuat ulang browser TV secara manual.
              </p>
            </div>
          </div>
        </div>

        {/* DOCKED SAVE FOOTER (GROUNDED) */}
        <div style={{
          gridColumn: '1 / -1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            💡 Seluruh perubahan pengaturan akan langsung tersinkronisasi ke layar TV display kampus.
          </span>
          <button
            onClick={handleSaveSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.65rem',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Save size={18} /> Simpan Semua Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
