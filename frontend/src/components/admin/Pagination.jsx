import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = 'data'
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const toItem = Math.min(totalItems, currentPage * itemsPerPage);

  if (totalItems === 0) return null;

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '1.75rem',
      padding: '0.85rem 1.25rem',
      background: 'white',
      borderRadius: '0.85rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      {/* Informasi Baris Data */}
      <div style={{ fontSize: '0.84rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        <span>
          Menampilkan <strong style={{ color: '#0f172a' }}>{fromItem} - {toItem}</strong> dari <strong style={{ color: '#0f172a' }}>{totalItems}</strong> {itemLabel}
        </span>
        
        {onItemsPerPageChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '0.45rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                color: '#1e293b',
                background: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>per hal.</span>
          </div>
        )}
      </div>

      {/* Kontrol Navigasi Halaman */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {/* Tombol Sebelumnya */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.45rem 0.8rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            background: currentPage <= 1 ? '#f8fafc' : 'white',
            color: currentPage <= 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.15s'
          }}
          onMouseOver={e => {
            if (currentPage > 1) e.currentTarget.style.background = '#f1f5f9';
          }}
          onMouseOut={e => {
            if (currentPage > 1) e.currentTarget.style.background = 'white';
          }}
        >
          <ChevronLeft size={16} /> Sebelumnya
        </button>

        {/* Nomor Halaman */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} style={{ padding: '0.45rem 0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                ...
              </span>
            );
          }

          const isActive = currentPage === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              style={{
                minWidth: '34px',
                height: '34px',
                padding: '0 0.4rem',
                borderRadius: '0.5rem',
                border: `1px solid ${isActive ? '#2563eb' : '#e2e8f0'}`,
                background: isActive ? '#2563eb' : 'white',
                color: isActive ? 'white' : '#334155',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 600,
                boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => {
                if (!isActive) e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseOut={e => {
                if (!isActive) e.currentTarget.style.background = 'white';
              }}
            >
              {p}
            </button>
          );
        })}

        {/* Tombol Berikutnya */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.45rem 0.8rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            background: currentPage >= totalPages ? '#f8fafc' : 'white',
            color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.15s'
          }}
          onMouseOver={e => {
            if (currentPage < totalPages) e.currentTarget.style.background = '#f1f5f9';
          }}
          onMouseOut={e => {
            if (currentPage < totalPages) e.currentTarget.style.background = 'white';
          }}
        >
          Berikutnya <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

