import { Download, Filter, Search, Printer, Calendar, FileText, RotateCcw, MoveHorizontal, CheckCircle2, ListFilter } from 'lucide-react';

export default function ReportsTab({
  filteredSchedules,
  reportStartDate,
  setReportStartDate,
  reportEndDate,
  setReportEndDate,
  reportStatus,
  setReportStatus,
  reportSearch,
  setReportSearch,
  handleExportCSV,
  facultyName,
  logoUnri
}) {
  const isFiltered = reportStartDate || reportEndDate || (reportStatus && reportStatus !== 'Semua') || reportSearch;

  const handleSetAll = () => {
    setReportStartDate('');
    setReportEndDate('');
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setReportStartDate(today);
    setReportEndDate(today);
  };

  const handleSetThisMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    setReportStartDate(`${y}-${m}-01`);
    setReportEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
  };

  const handleResetFilter = () => {
    setReportStartDate('');
    setReportEndDate('');
    setReportStatus('Semua');
    setReportSearch('');
  };

  const getStatusBadge = (status) => {
    let bg = '#f1f5f9';
    let color = '#475569';
    let border = '#cbd5e1';

    if (status === 'Berlangsung') {
      bg = '#dcfce7';
      color = '#15803d';
      border = '#86efac';
    } else if (status === 'Akan Datang') {
      bg = '#dbeafe';
      color = '#1d4ed8';
      border = '#93c5fd';
    } else if (status === 'Selesai') {
      bg = '#f3e8ff';
      color = '#7e22ce';
      border = '#d8b4fe';
    } else if (status === 'Dibatalkan') {
      bg = '#fee2e2';
      color = '#b91c1c';
      border = '#fca5a5';
    }

    return (
      <span 
        className="report-status-pill"
        style={{
          display: 'inline-block',
          padding: '0.2rem 0.55rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          whiteSpace: 'nowrap'
        }}
      >
        {status || 'Akan Datang'}
      </span>
    );
  };

  const activePreset = (!reportStartDate && !reportEndDate) ? 'all' : '';

  const handlePrintPDF = () => {
    const fullLogoUrl = logoUnri ? (logoUnri.startsWith('http') ? logoUnri : window.location.origin + logoUnri) : '';
    
    const printRows = filteredSchedules.map((s, idx) => {
      let bg = '#f1f5f9';
      let color = '#475569';
      let border = '#cbd5e1';
      if (s.status === 'Berlangsung') {
        bg = '#dcfce7'; color = '#15803d'; border = '#86efac';
      } else if (s.status === 'Akan Datang') {
        bg = '#dbeafe'; color = '#1d4ed8'; border = '#93c5fd';
      } else if (s.status === 'Selesai') {
        bg = '#f3e8ff'; color = '#7e22ce'; border = '#d8b4fe';
      } else if (s.status === 'Dibatalkan') {
        bg = '#fee2e2'; color = '#b91c1c'; border = '#fca5a5';
      }

      return `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; white-space: nowrap; font-weight: 600; font-size: 8.5pt;">${s.date || '-'}</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; white-space: nowrap; font-size: 8.5pt;">${s.startTime || '00:00'} - ${s.endTime || '23:59'} WIB</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a; font-size: 8.5pt;">${s.title || '-'}</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center;">
            <span style="display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 7.5pt; font-weight: bold; background-color: ${bg}; color: ${color}; border: 1px solid ${border}; white-space: nowrap;">
              ${s.status || 'Akan Datang'}
            </span>
          </td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 8.5pt;">${s.loc || '-'}</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 8.5pt;">${s.pic || '-'}</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 8.5pt; text-align: center;">${s.partnerCategory || 'Internal'}</td>
        </tr>
      `;
    }).join('');

    const emptyRow = `
      <tr>
        <td colspan="7" style="padding: 30px; text-align: center; color: #94a3b8; font-style: italic; border: 1px solid #cbd5e1;">
          Tidak ada data agenda kegiatan yang cocok dengan kriteria filter saat ini.
        </td>
      </tr>
    `;

    const periodText = reportStartDate && reportEndDate 
      ? `Periode: ${reportStartDate} s/d ${reportEndDate}` 
      : 'Periode: Seluruh Data Agenda Kampus';

    const docHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Agenda - ${facultyName || 'Universitas Riau'}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 8mm;
            background: #ffffff !important;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
          }
          .doc-header {
            display: flex;
            align-items: center;
            gap: 18px;
            padding-bottom: 12px;
            margin-bottom: 14px;
            border-bottom: 2.5px solid #0f172a;
          }
          .doc-logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
          }
          .doc-title-wrap {
            flex: 1;
          }
          .doc-title-wrap h1 {
            margin: 0;
            font-size: 15pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .doc-title-wrap h2 {
            margin: 2px 0;
            font-size: 11pt;
            font-weight: 700;
            color: #1e40af;
          }
          .doc-title-wrap p {
            margin: 0;
            font-size: 9pt;
            color: #64748b;
            font-style: italic;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-top: 5px;
          }
          thead {
            display: table-header-group;
          }
          tbody {
            display: table-row-group;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 800;
            font-size: 8pt;
            text-transform: uppercase;
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            text-align: left;
            letter-spacing: 0.03em;
          }
          .doc-footer {
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          ${fullLogoUrl ? `<img src="${fullLogoUrl}" alt="Logo" class="doc-logo" />` : ''}
          <div class="doc-title-wrap">
            <h1>LAPORAN AGENDA KEGIATAN</h1>
            <h2>${facultyName || 'Universitas Riau'}</h2>
            <p>${periodText} | Total: ${filteredSchedules.length} Kegiatan</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 13%;">Tanggal</th>
              <th style="width: 15%;">Waktu</th>
              <th style="width: 26%;">Nama Kegiatan</th>
              <th style="width: 12%; text-align: center;">Status</th>
              <th style="width: 14%;">Ruangan</th>
              <th style="width: 10%;">PIC</th>
              <th style="width: 10%; text-align: center;">Mitra</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSchedules.length > 0 ? printRows : emptyRow}
          </tbody>
        </table>

        <div class="doc-footer">
          <span>Total Rekapitulasi: <strong>${filteredSchedules.length} Kegiatan Terdaftar</strong></span>
          <span>Pusat Informasi & Layanan Kampus Terpadu — ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
        </div>
      </body>
      </html>
    `;

    // 1. Coba buka jendela/tab terisolasi untuk cetak bersih tanpa gangguan layout SPA
    let printWin = null;
    try {
      printWin = window.open('', '_blank');
    } catch (e) {
      printWin = null;
    }

    if (printWin && printWin.document) {
      printWin.document.open();
      printWin.document.write(docHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.print();
        } catch (e) {
          console.warn('Auto print failed in window:', e);
        }
      }, 500);
      return;
    }

    // 2. Fallback untuk browser mobile yang memblokir popup
    const printIframe = document.createElement('iframe');
    printIframe.setAttribute('title', 'Print Document');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const ifrWindow = printIframe.contentWindow || printIframe.contentDocument;
    const ifrDoc = ifrWindow.document || ifrWindow;
    ifrDoc.open();
    ifrDoc.write(docHtml);
    ifrDoc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (e) {
        window.print();
      }
      setTimeout(() => {
        try { document.body.removeChild(printIframe); } catch (e) {}
      }, 3000);
    }, 600);
  };

  return (
    <div className="reports-page-container">
      
      {/* 1. HEADER & TOMBOL EKSPOR */}
      <div className="card reports-top-header no-print">
        <div className="reports-top-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h3 className="reports-page-title">
              <FileText size={22} color="#2563eb" /> Laporan Agenda Kegiatan
            </h3>
            <span className="reports-title-badge">
              Transkrip Resmi
            </span>
          </div>
          <p className="reports-page-desc">
            Rekapitulasi resmi agenda kegiatan kampus. Dapat langsung diekspor ke Excel (.xls) atau dicetak ke dokumen PDF.
          </p>
        </div>

        {/* Action Buttons: Excel & Print (2 kolom di mobile, sejajar di PC) */}
        <div className="reports-top-actions">
          <button 
            type="button"
            className="reports-btn-action reports-btn-excel" 
            onClick={handleExportCSV}
            title="Download file Spreadsheet Excel"
          >
            <Download size={16} /> <span>Export Excel (.xls)</span>
          </button>
          <button 
            type="button"
            className="reports-btn-action reports-btn-print" 
            onClick={handlePrintPDF}
            title="Cetak PDF / Print Dokumen Lengkap"
          >
            <Printer size={16} /> <span>Cetak PDF / Print</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER & PENCARIAN DOKUMEN */}
      <div className="card reports-filter-card no-print">
        <div className="reports-filter-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: 800, fontSize: '0.92rem' }}>
            <Filter size={16} color="#2563eb" /> <span>Filter & Kriteria Periode</span>
          </div>
          
          {/* Preset Buttons Bar */}
          <div className="reports-preset-bar">
            <button 
              type="button"
              className={`reports-preset-chip ${activePreset === 'all' ? 'active' : ''}`}
              onClick={handleSetAll}
            >
              Semua Periode
            </button>
            <button 
              type="button"
              className="reports-preset-chip"
              onClick={handleSetThisMonth}
            >
              Bulan Ini
            </button>
            <button 
              type="button"
              className="reports-preset-chip"
              onClick={handleSetToday}
            >
              Hari Ini
            </button>
            {isFiltered && (
              <button 
                type="button" 
                className="reports-btn-clear-filter"
                onClick={handleResetFilter}
                title="Reset semua filter"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="reports-filter-fields-grid">
          {/* Dari Tanggal */}
          <div className="reports-input-group">
            <label className="reports-input-label">
              <Calendar size={13} color="#64748b" /> Dari Tanggal
            </label>
            <input 
              type="date" 
              value={reportStartDate} 
              onChange={(e) => setReportStartDate(e.target.value)} 
              className="admin-input reports-filter-control" 
            />
          </div>

          {/* Sampai Tanggal */}
          <div className="reports-input-group">
            <label className="reports-input-label">
              <Calendar size={13} color="#64748b" /> Sampai Tanggal
            </label>
            <input 
              type="date" 
              value={reportEndDate} 
              onChange={(e) => setReportEndDate(e.target.value)} 
              className="admin-input reports-filter-control" 
            />
          </div>

          {/* Status */}
          <div className="reports-input-group">
            <label className="reports-input-label">Status</label>
            <select 
              value={reportStatus} 
              onChange={(e) => setReportStatus(e.target.value)} 
              className="admin-input reports-filter-control"
            >
              <option value="Semua">Semua Status</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Berlangsung">Berlangsung</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Cari Kata Kunci */}
          <div className="reports-input-group reports-input-group-search">
            <label className="reports-input-label">Pencarian Cepat</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input 
                type="text" 
                value={reportSearch} 
                onChange={(e) => setReportSearch(e.target.value)} 
                placeholder="Cari judul kegiatan, ruangan, atau PIC..." 
                className="admin-input reports-filter-control" 
                style={{ paddingLeft: '36px', width: '100%' }} 
              />
            </div>
          </div>
        </div>

        {/* Summary info banner */}
        <div className="reports-filter-status-banner">
          <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>Total: <strong style={{ color: '#0f172a' }}>{filteredSchedules.length}</strong> agenda kegiatan tercatat</span>
            {reportStartDate && reportEndDate ? (
              <span className="reports-period-tag">
                Periode: {reportStartDate} s/d {reportEndDate}
              </span>
            ) : (
              <span className="reports-period-tag">
                Periode: Semua Tanggal
              </span>
            )}
            {reportStatus && reportStatus !== 'Semua' && (
              <span className="reports-period-tag">
                Status: {reportStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. LEMBAR DOKUMEN LAPORAN (PRINT AREA & SCREEN VIEW) */}
      <div className="card reports-sheet-card print-area">
        
        {/* Kop Surat Dokumen */}
        <div className="print-header reports-doc-header">
          <div className="print-logo-container">
            <img src={logoUnri} alt="Logo Universitas Riau" className="print-logo" />
          </div>
          <div className="print-title-container">
            <h2 className="print-title">LAPORAN AGENDA KEGIATAN</h2>
            <p className="print-subtitle">{facultyName || 'Universitas Riau'}</p>
            <p className="print-date">
              {reportStartDate && reportEndDate 
                ? `Periode: ${reportStartDate} s/d ${reportEndDate}` 
                : 'Periode: Seluruh Data Agenda Kampus'}
            </p>
          </div>
        </div>

        {/* Petunjuk Geser di Layar HP */}
        <div className="reports-mobile-scroll-tip no-print">
          <MoveHorizontal size={14} />
          <span>Geser tabel ke samping untuk melihat detail ruangan, PIC, dan mitra</span>
        </div>

        {/* Wadah Tabel Responsif */}
        <div className="reports-table-scroll-wrapper">
          <table className="print-table reports-main-table">
            <thead>
              <tr>
                <th style={{ width: '13%' }}>Tanggal</th>
                <th style={{ width: '15%' }}>Waktu</th>
                <th style={{ width: '26%' }}>Nama Kegiatan</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '14%' }}>Ruangan</th>
                <th style={{ width: '10%' }}>PIC</th>
                <th style={{ width: '10%' }}>Mitra</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((s, idx) => (
                <tr key={s.id || idx} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="cell-date">{s.date || '-'}</td>
                  <td className="cell-time">{s.startTime || '00:00'} - {s.endTime || '23:59'} WIB</td>
                  <td className="cell-title">
                    <strong>{s.title}</strong>
                  </td>
                  <td className="cell-status">
                    {getStatusBadge(s.status)}
                  </td>
                  <td className="cell-loc">{s.loc || '-'}</td>
                  <td className="cell-pic">{s.pic || '-'}</td>
                  <td className="cell-partner">{s.partnerCategory || 'Internal'}</td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan="7" className="cell-empty">
                    Tidak ada agenda kegiatan yang cocok dengan kriteria filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info dokumen */}
        <div className="reports-sheet-footer no-print">
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Total Rekapitulasi: <strong>{filteredSchedules.length} Kegiatan Terdaftar</strong>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Pusat Informasi & Layanan Kampus Terpadu
          </span>
        </div>

      </div>

    </div>
  );
}




