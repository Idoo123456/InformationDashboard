/**
 * Master TV devices utility & fallback data
 * Memastikan daftar TV selalu sinkron antara Slide Konten dan Jadwal Kegiatan
 */

export const DEFAULT_CAMPUS_TVS = [
  { id: 1, code: 'tv-1', name: 'TV 1 - Lobi Utama Rektorat', location: 'Gedung Rektorat Lt. 1' },
  { id: 2, code: 'tv-2', name: 'TV 2 - Gedung Kuliah & Senat', location: 'Gedung Senat Kampus Bina Widya' },
  { id: 3, code: 'tv-3', name: 'TV 3 - Perpustakaan Pusat', location: 'UPA Perpustakaan Lt. 1' },
  { id: 6, code: 'tv-6', name: 'TV 6 - Gedung Kuliah Bersama', location: 'GKB II Bina Widya' },
  { id: 8, code: 'tv-8', name: 'TV 8 - Auditorium PKM Gobah', location: 'Gedung PKM Gobah Lt. 1' }
];

export const fetchCampusTvDevices = async (facultyPrefix = 'main') => {
  try {
    const url = `/api/tv-devices?faculty=${facultyPrefix || 'main'}&include_main=true`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }

    // Fallback: ambil semua perangkat TV yang ada di sistem
    const allRes = await fetch('/api/tv-devices');
    if (allRes.ok) {
      const allData = await allRes.json();
      if (Array.isArray(allData) && allData.length > 0) {
        return allData;
      }
    }
  } catch (err) {
    console.warn('Gagal memuat tv-devices:', err);
  }

  // Fallback terakhir: default campus TVs agar UI tidak pernah kosong
  return DEFAULT_CAMPUS_TVS;
};
