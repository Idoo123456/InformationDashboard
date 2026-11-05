// Helper utilitas tanggal lokal aman untuk zona waktu Indonesia (WIB UTC+7)
// Mencegah pergeseran tanggal (UTC shift) saat tengah malam / pagi hari

export const getLocalDateStr = (d = new Date()) => {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStartOfMonthStr = (d = new Date()) => {
  const dateObj = typeof d === 'string' ? new Date(d) : new Date(d.getTime());
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

export const getEndOfMonthStr = (d = new Date()) => {
  const dateObj = typeof d === 'string' ? new Date(d) : new Date(d.getTime());
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  // Hari terakhir dari bulan
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, '0');
  return `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
};

export const getMonthPrefixStr = (d = new Date()) => {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
