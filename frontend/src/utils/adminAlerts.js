import Swal from 'sweetalert2';
import { getLocalDateStr } from './dateUtils';

export const showSuccessPopup = (message) => {
  Swal.fire({
    title: 'Berhasil!',
    text: message,
    icon: 'success',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#2f5597',
    timer: 2500,
    timerProgressBar: true
  });
};

export const showToastPopup = (message) => {
  Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });
};

export const showConfirmDelete = (onConfirm) => {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: 'Data yang dihapus tidak dapat dikembalikan!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
      showToastPopup('Data berhasil dihapus');
    }
  });
};

// Cek apakah ada jadwal lain yang bertabrakan di ruangan dan jam yang sama
export const findRoomConflict = (scheduleToSave, allSchedules = []) => {
  if (!scheduleToSave || !scheduleToSave.loc || !scheduleToSave.date || !scheduleToSave.startTime || !scheduleToSave.endTime) {
    return null;
  }
  if (scheduleToSave.status === 'Dibatalkan') {
    return null;
  }
  if (!Array.isArray(allSchedules) || allSchedules.length === 0) {
    return null;
  }

  const cleanTime = (t) => String(t || '').trim().slice(0, 5);
  const newLoc = scheduleToSave.loc.trim().toLowerCase();
  const newDate = String(scheduleToSave.date).slice(0, 10);
  const newStart = cleanTime(scheduleToSave.startTime);
  const newEnd = cleanTime(scheduleToSave.endTime);
  const currentId = scheduleToSave.id;

  if (newEnd <= newStart) return null;

  for (const item of allSchedules) {
    if (currentId && (item.id === currentId || String(item.id) === String(currentId))) continue;
    if (item.status === 'Dibatalkan' || item.status === 'dibatalkan') continue;

    const itemLoc = (item.loc || item.location || '').trim().toLowerCase();
    if (!itemLoc || itemLoc !== newLoc) continue;

    const itemDate = String(item.date).slice(0, 10);
    if (itemDate !== newDate) continue;

    const itemStart = cleanTime(item.startTime || item.start_time);
    const itemEnd = cleanTime(item.endTime || item.end_time);
    if (!itemStart || !itemEnd) continue;

    // Overlap: newStart < itemEnd && newEnd > itemStart
    if (newStart < itemEnd && newEnd > itemStart) {
      return item;
    }
  }

  return null;
};

// Popup Alert Penguncian Jam Ruangan yang Muncul Tepat di Tengah Layar
export const showRoomConflictPopup = (conflictItem, targetSchedule) => {
  const cleanTime = (t) => String(t || '').trim().slice(0, 5);
  const conflictLoc = conflictItem.loc || targetSchedule?.loc || 'Ruangan';
  const conflictDate = conflictItem.date || targetSchedule?.date || '';
  const bookedStart = cleanTime(conflictItem.startTime || conflictItem.start_time);
  const bookedEnd = cleanTime(conflictItem.endTime || conflictItem.end_time);
  const attemptStart = cleanTime(targetSchedule?.startTime);
  const attemptEnd = cleanTime(targetSchedule?.endTime);

  return Swal.fire({
    icon: 'error',
    title: '⛔ Ruangan Sudah Dipinjam!',
    html: `
      <div style="text-align: left; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 0.75rem; padding: 1.15rem; margin-top: 0.75rem; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.65rem; color: #991b1b; font-weight: 800; font-size: 1.05rem;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span>
          Jadwal Penggunaan Ruangan Bentrok
        </div>
        <p style="margin: 0 0 0.85rem 0; font-size: 0.9rem; color: #334155; line-height: 1.5;">
          Ruangan <strong style="color: #0f172a; text-decoration: underline;">${conflictLoc}</strong> tidak dapat dipinjam pada jam <strong style="color: #dc2626;">${attemptStart} - ${attemptEnd} WIB</strong> karena ruangan tersebut sudah dipesan oleh kegiatan lain.
        </p>
        
        <div style="background: white; border: 1px solid #fed7aa; border-radius: 0.6rem; padding: 0.85rem; font-size: 0.85rem;">
          <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #b45309; letter-spacing: 0.5px; margin-bottom: 0.25rem;">
            Kegiatan Yang Sedang Meminjam:
          </div>
          <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">
            "${conflictItem.title}"
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.82rem; color: #475569;">
            <div>📅 Tanggal: <strong style="color: #1e293b;">${conflictDate}</strong></div>
            <div>⏰ Jam Dipinjam: <strong style="color: #dc2626;">${bookedStart} - ${bookedEnd} WIB</strong></div>
            <div>👤 Penanggung Jawab (PIC): <strong style="color: #1e293b;">${conflictItem.pic || '-'}</strong></div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 1rem; font-size: 0.86rem; color: #64748b; line-height: 1.45;">
        Sistem mengunci ruangan ini. Mohon pilih <strong>ruangan lain</strong> yang masih kosong atau ganti <strong>jam pelaksanaan</strong> kegiatan Anda.
      </div>
    `,
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'Tutup & Ganti Jam / Ruangan',
    width: '530px'
  });
};

export const getDynamicStatus = (item) => {
  if (!item) return 'Akan Datang';
  if (item.status === 'Dibatalkan') return 'Dibatalkan';
  if (item.status === 'Selesai') return 'Selesai';
  
  try {
    let scheduleDateStr = item.date || getLocalDateStr();
    if (typeof scheduleDateStr === 'string' && scheduleDateStr.includes('T')) {
      scheduleDateStr = scheduleDateStr.split('T')[0];
    }
    const startStr = item.startTime || '00:00';
    const endStr = item.endTime || '23:59';
    
    const startDateTime = new Date(`${scheduleDateStr}T${startStr}:00`);
    const endDateTime = new Date(`${scheduleDateStr}T${endStr}:00`);
    const currentTime = new Date();
    
    if (currentTime >= startDateTime && currentTime <= endDateTime) {
      return 'Berlangsung';
    } else if (currentTime > endDateTime) {
      return 'Selesai';
    } else {
      return 'Akan Datang';
    }
  } catch (e) {
    return item.status || 'Akan Datang';
  }
};
