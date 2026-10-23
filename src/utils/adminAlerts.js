import Swal from 'sweetalert2';

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

export const getDynamicStatus = (item) => {
  if (!item) return 'Akan Datang';
  if (item.status === 'Dibatalkan') return 'Dibatalkan';
  if (item.status === 'Selesai') return 'Selesai';
  
  try {
    let scheduleDateStr = item.date || new Date().toISOString().split('T')[0];
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
