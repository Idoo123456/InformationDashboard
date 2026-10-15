/**
 * Utility for dynamic color theming across all dashboard templates
 */

export const PRESET_COLORS = [
  { name: 'Biru UNRI', hex: '#1e40af' },
  { name: 'Biru Royal', hex: '#2563eb' },
  { name: 'Hijau Zamrud', hex: '#10b981' },
  { name: 'Hijau UNRI', hex: '#166534' },
  { name: 'Amber Emas', hex: '#f59e0b' },
  { name: 'Oranye Cerah', hex: '#ea580c' },
  { name: 'Merah Crimson', hex: '#ef4444' },
  { name: 'Ungu Violet', hex: '#8b5cf6' },
  { name: 'Teal Modern', hex: '#0d9488' },
  { name: 'Slate Gelap', hex: '#0f172a' }
];

export const TEMPLATE_LIST = [
  { id: 'tu', name: 'Tema TU (Tata Usaha)', desc: 'Slide Kegiatan Berputar (Grid 3x2)' },
  { id: 'standard', name: 'Standard', desc: 'Kegiatan Kiri, Slide Kanan' },
  { id: 'agenda-focus', name: 'Fokus Agenda', desc: 'Agenda Lebar, Slide Kecil' },
  { id: 'full-media', name: 'Full Media', desc: 'Slide Penuh Layar' },
  { id: 'admin', name: 'Tema Admin', desc: 'Sidebar Lebar Profesional' }
];

export function hexToRgb(hex) {
  if (!hex) return { r: 30, g: 64, b: 175 };
  let cleanHex = String(hex).replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 30, g: 64, b: 175 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function adjustBrightness(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

export function applyThemeColors(hexColor) {
  if (!hexColor) hexColor = '#1e40af';
  const { r, g, b } = hexToRgb(hexColor);
  const darkColor = adjustBrightness(hexColor, -20);
  const lightColor = adjustBrightness(hexColor, 35);

  const root = document.documentElement;
  root.style.setProperty('--primary-blue', hexColor);
  root.style.setProperty('--admin-primary', hexColor);
  root.style.setProperty('--theme-color', hexColor);
  root.style.setProperty('--theme-color-rgb', `${r}, ${g}, ${b}`);
  root.style.setProperty('--theme-dark', darkColor);
  root.style.setProperty('--theme-deep-dark', '#0f172a'); // Always crisp, authoritative slate for headings
  root.style.setProperty('--theme-light', lightColor);
  root.style.setProperty('--theme-bg-soft', `rgba(${r}, ${g}, ${b}, 0.05)`);
  root.style.setProperty('--theme-border-soft', `rgba(${r}, ${g}, ${b}, 0.18)`);
  root.style.setProperty('--theme-border-medium', `rgba(${r}, ${g}, ${b}, 0.35)`);
}
