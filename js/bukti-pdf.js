/**
 * Bukti PPDB — PDF native via jsPDF (konsisten di HP & desktop).
 */
(function () {
  var COLORS = {
    primaryDark: [13, 71, 161],
    primary: [25, 118, 210],
    gold: [245, 158, 11],
    dark: [15, 23, 42],
    label: [71, 85, 105],
    border: [226, 232, 240],
    successBg: [232, 245, 233],
    successBorder: [76, 175, 80],
    successText: [46, 125, 50],
    panelBg: [237, 242, 252]
  };

  function getText(id) {
    var el = document.getElementById(id);
    return el ? String(el.textContent).trim() : '—';
  }

  function getQrDataUrl() {
    var qr = document.querySelector('#qrCanvas canvas, #qrCanvas img');
    if (!qr) return null;
    try {
      if (qr.tagName === 'CANVAS') return qr.toDataURL('image/png');
      if (qr.src && qr.src.indexOf('data:') === 0) return qr.src;
    } catch (e) {
      return null;
    }
    return null;
  }

  function loadImageDataUrl(src) {
    return new Promise(function (resolve) {
      if (!src) {
        resolve(null);
        return;
      }
      var img = new Image();
      if (/^https?:\/\//i.test(src) && src.indexOf(window.location.host) === -1) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 80;
          canvas.height = img.naturalHeight || 80;
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = src;
    });
  }

  function collectRows() {
    return [
      ['Nama Lengkap', getText('bNama')],
      ['NIK', getText('bNIK')],
      ['Tempat, Tanggal Lahir', getText('bTTL')],
      ['Jenis Kelamin', getText('bJK')],
      ['Alamat', getText('bAlamat')],
      ['Nomor HP', getText('bHP')],
      ['Asal Sekolah', getText('bSekolah')],
      ['Program Keahlian yang Dipilih', getText('bJurusan')]
    ];
  }

  window.downloadPDF = async function downloadPDF() {
    var btn = document.getElementById('btnDownloadPDF');
    var regId = getText('idValue');

    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('Library PDF belum dimuat. Muat ulang halaman lalu coba lagi.');
      return;
    }

    var testDoc = new window.jspdf.jsPDF();
    if (typeof testDoc.autoTable !== 'function') {
      alert('Plugin tabel PDF belum dimuat. Muat ulang halaman.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Menyiapkan PDF...';

    try {
      var jsPDF = window.jspdf.jsPDF;
      var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      var pageW = doc.internal.pageSize.getWidth();
      var margin = 14;
      var contentW = pageW - margin * 2;
      var y = margin;
      var logoEl = document.querySelector('.bukti-logo img');
      var logoUrl = logoEl ? await loadImageDataUrl(logoEl.src) : null;
      var qrUrl = getQrDataUrl();

      /* ── Header biru ── */
      var headerH = 34;
      doc.setFillColor.apply(doc, COLORS.primaryDark);
      doc.rect(margin, y, contentW, headerH, 'F');

      if (logoUrl) {
        doc.addImage(logoUrl, 'PNG', margin + 3, y + 6, 16, 16);
      }

      var textX = margin + (logoUrl ? 22 : 4);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('SMK NUFA CITRA MANDIRI', textX, y + 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Jl. Citra Mandiri No. 1, Kota • 0812-8883-5894 (Bpk. Febri)', textX, y + 17);
      doc.text('Bukti pendaftaran PPDB tahun ajaran 2025/2026', textX, y + 22);

      if (qrUrl) {
        var qrSize = 20;
        var qrX = margin + contentW - qrSize - 3;
        var qrY = y + 5;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 7, 1, 1, 'F');
        doc.addImage(qrUrl, 'PNG', qrX, qrY, qrSize, qrSize);
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(5);
        doc.text('SCAN VERIFIKASI', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
      }

      y += headerH;

      /* ── Bar oranye (nomor pendaftaran) ── */
      var idH = 24;
      doc.setFillColor.apply(doc, COLORS.gold);
      doc.rect(margin, y, contentW, idH, 'F');

      doc.setTextColor.apply(doc, COLORS.dark);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('NOMOR PENDAFTARAN', margin + 4, y + 8);
      doc.setFontSize(15);
      doc.text(regId, margin + 4, y + 17);

      doc.setFontSize(7);
      doc.text('TANGGAL PENDAFTARAN', margin + contentW - 4, y + 8, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(getText('tglDaftar'), margin + contentW - 4, y + 14, { align: 'right' });
      doc.setFontSize(6.5);
      doc.text('Menunggu verifikasi', margin + contentW - 4, y + 20, { align: 'right' });

      y += idH + 8;

      /* ── Judul data ── */
      doc.setTextColor.apply(doc, COLORS.dark);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Data calon peserta didik baru', margin, y);
      y += 5;

      /* ── Tabel data ── */
      var rows = collectRows();
      doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: contentW,
        body: rows,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
          lineColor: COLORS.border,
          lineWidth: 0.2,
          valign: 'middle'
        },
        columnStyles: {
          0: {
            cellWidth: 62,
            fillColor: [248, 250, 252],
            fontStyle: 'bold',
            textColor: COLORS.label
          },
          1: {
            textColor: COLORS.dark
          }
        },
        didParseCell: function (data) {
          if (data.section === 'body' && data.row.index === rows.length - 1 && data.column.index === 1) {
            data.cell.styles.textColor = COLORS.primary;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      y = doc.lastAutoTable.finalY + 8;

      /* ── Status sukses ── */
      doc.setFillColor.apply(doc, COLORS.successBg);
      doc.setDrawColor.apply(doc, COLORS.successBorder);
      doc.setLineWidth(0.35);
      var statusTitle = 'Pendaftaran berhasil diterima';
      var statusBody =
        'Data Anda tersimpan di sistem. Simpan atau cetak bukti ini. Pengumuman seleksi pada 10 Juni 2026 melalui website dan WhatsApp.';
      var statusLines = doc.splitTextToSize(statusBody, contentW - 10);
      var statusH = 10 + statusLines.length * 4;
      doc.rect(margin, y, contentW, statusH, 'FD');

      doc.setTextColor.apply(doc, COLORS.successText);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(statusTitle, margin + 4, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(8.5);
      doc.text(statusLines, margin + 4, y + 12);

      y += statusH + 8;

      /* ── Tahapan selanjutnya ── */
      var steps = [
        'Simpan atau cetak bukti pendaftaran ini sebagai referensi',
        'Bagi yang dinyatakan lulus seleksi, wajib hadir untuk verifikasi dokumen asli',
        'Lakukan daftar ulang sesuai jadwal yang telah ditentukan',
        'Informasi lebih lanjut: 0812-8883-5894 (WhatsApp)'
      ];
      var stepLines = [];
      steps.forEach(function (step, i) {
        stepLines = stepLines.concat(doc.splitTextToSize((i + 1) + '. ' + step, contentW - 12));
      });
      var panelH = 12 + stepLines.length * 4.2;
      doc.setFillColor.apply(doc, COLORS.panelBg);
      doc.setDrawColor.apply(doc, COLORS.primary);
      doc.setLineWidth(0.25);
      doc.rect(margin, y, contentW, panelH, 'FD');

      doc.setTextColor.apply(doc, COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Tahapan selanjutnya', margin + 4, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor.apply(doc, COLORS.label);
      doc.setFontSize(8.5);
      doc.text(stepLines, margin + 4, y + 12);

      y += panelH + 8;

      /* ── Footer ── */
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = margin;
      }
      doc.setFillColor.apply(doc, COLORS.primaryDark);
      doc.rect(margin, y, contentW, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(
        'Dokumen ini diterbitkan oleh sistem PPDB daring SMK NUFA CITRA MANDIRI · © 2026 · Bukti pendaftaran resmi',
        pageW / 2,
        y + 5.5,
        { align: 'center' }
      );

      doc.save('Bukti-' + regId.replace(/[^\w-]+/g, '-') + '.pdf');
    } catch (err) {
      console.error('PDF Error:', err);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      btn.disabled = false;
      btn.textContent = '\u2B07 Unduh bukti PDF';
    }
  };
})();
