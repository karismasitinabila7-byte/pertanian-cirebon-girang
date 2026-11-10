'use client'

import { useState } from 'react'
import { FileDown, Printer, FileSpreadsheet, Loader2 } from 'lucide-react'

export interface ExportColumn {
  header: string
  key: string
  render?: (row: any, index: number) => string | number
}

export interface SummaryStat {
  label: string
  value: string | number
}

interface ExportButtonsProps {
  title: string
  fileName: string
  columns: ExportColumn[]
  data: any[]
  summaryStats?: SummaryStat[]
  subtitle?: string
}

export function ExportButtons({
  title,
  fileName,
  columns,
  data,
  summaryStats = [],
  subtitle = 'Platform Sistem Informasi Pertanian Padi Desa Cirebon Girang',
}: ExportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  // 1. Ekspor ke Excel (.CSV dengan BOM UTF-8)
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true)
      const now = new Date()
      const tglCetak = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      let csvContent = '\uFEFF' // UTF-8 BOM untuk Microsoft Excel

      // Kop Surat Header di CSV
      csvContent += `"PEMERINTAH KABUPATEN CIREBON - KECAMATAN LEMAHABANG - DESA CIREBON GIRANG"\n`
      csvContent += `"${title.toUpperCase()}"\n`
      csvContent += `"Tanggal Unduh: ${tglCetak}"\n`
      csvContent += `"Sumber Data: SI PADI Desa Cirebon Girang"\n\n`

      // Summary Stats jika ada
      if (summaryStats.length > 0) {
        csvContent += `"RINGKASAN DATA:"\n`
        summaryStats.forEach(stat => {
          csvContent += `"${stat.label}","${stat.value}"\n`
        })
        csvContent += `\n`
      }

      // Baris Header Kolom
      const headers = ['No', ...columns.map(c => `"${c.header.replace(/"/g, '""')}"`)]
      csvContent += headers.join(',') + '\n'

      // Baris Data
      data.forEach((row, idx) => {
        const rowValues = [
          idx + 1,
          ...columns.map(col => {
            let val = col.render ? col.render(row, idx) : row[col.key]
            if (val === null || val === undefined) val = ''
            const strVal = String(val).replace(/"/g, '""')
            return `"${strVal}"`
          }),
        ]
        csvContent += rowValues.join(',') + '\n'
      })

      // Buat file Blob dan trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `${fileName}-${now.toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Gagal mengekspor Excel:', err)
      alert('Gagal membuat dokumen Excel. Silakan coba kembali.')
    } finally {
      setIsExportingExcel(false)
    }
  }

  // 2. Ekspor ke PDF / Cetak Format Resmi Dinas
  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true)
      const now = new Date()
      const tglCetak = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      const tahun = now.getFullYear()

      const printWin = window.open('', '_blank')
      if (!printWin) {
        alert('Mohon izinkan pop-up browser untuk mencetak dokumen laporan.')
        setIsExportingPdf(false)
        return
      }

      // Bangun baris ringkasan HTML
      const summaryHtml = summaryStats.length > 0
        ? `
        <div class="summary-box">
          ${summaryStats.map(s => `
            <div class="summary-item">
              <div class="summary-label">${s.label}</div>
              <div class="summary-val">${s.value}</div>
            </div>
          `).join('')}
        </div>
        `
        : ''

      // Bangun tabel HTML
      const headersHtml = `
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          ${columns.map(c => `<th>${c.header}</th>`).join('')}
        </tr>
      `

      const rowsHtml = data.map((row, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          ${columns.map(col => {
            const val = col.render ? col.render(row, idx) : (row[col.key] ?? '—')
            return `<td>${val}</td>`
          }).join('')}
        </tr>
      `).join('')

      printWin.document.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>${title} - Desa Cirebon Girang</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm 20mm 15mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #111;
              line-height: 1.4;
              font-size: 11pt;
              margin: 0;
              padding: 0;
            }
            .kop {
              text-align: center;
              border-bottom: 3px double #000;
              padding-bottom: 8px;
              margin-bottom: 16px;
            }
            .kop-instansi {
              font-size: 13pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .kop-desa {
              font-size: 16pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 2px 0;
            }
            .kop-alamat {
              font-size: 9pt;
              font-style: italic;
              margin: 0;
            }
            .doc-title-box {
              text-align: center;
              margin: 16px 0 14px;
            }
            .doc-title {
              font-size: 13pt;
              font-weight: bold;
              text-transform: uppercase;
              text-decoration: underline;
              margin: 0;
            }
            .doc-nomor {
              font-size: 10pt;
              margin: 3px 0 0;
            }
            .summary-box {
              display: flex;
              gap: 12px;
              margin-bottom: 14px;
              border: 1px solid #ccc;
              background: #fdfdfd;
              padding: 8px 12px;
              border-radius: 4px;
            }
            .summary-item {
              flex: 1;
            }
            .summary-label {
              font-size: 8.5pt;
              color: #555;
              text-transform: uppercase;
            }
            .summary-val {
              font-size: 12pt;
              font-weight: bold;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 9.5pt;
            }
            th, td {
              border: 1px solid #333;
              padding: 6px 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f1f5f0;
              font-weight: bold;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            .footer-sign {
              margin-top: 35px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sign-col {
              width: 240px;
              text-align: center;
              font-size: 10pt;
            }
            .sign-space {
              height: 65px;
            }
            .sign-name {
              font-weight: bold;
              text-decoration: underline;
            }
            .meta-print {
              margin-top: 25px;
              font-size: 8pt;
              color: #777;
              border-top: 1px solid #ddd;
              padding-top: 4px;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              .no-print { display: none; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="kop">
            <p class="kop-instansi">Pemerintah Kabupaten Cirebon &bull; Kecamatan Lemahabang</p>
            <p class="kop-desa">Kantor Kuwu Desa Cirebon Girang</p>
            <p class="kop-alamat">Jalan Raya Karang Anyar No. 01 Desa Cirebon Girang, Kab. Cirebon 45183 &bull; Telp/WA: 0812-9876-5432</p>
          </div>

          <div class="doc-title-box">
            <h1 class="doc-title">${title}</h1>
            <p class="doc-nomor">Nomor Dokumen Rekap: 521.1/REKAP-PADI/${tahun}</p>
          </div>

          ${summaryHtml}

          <table>
            <thead>
              ${headersHtml}
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-col">
              <p>Mengetahui,<br><strong>Kuwu / Kepala Desa Cirebon Girang</strong></p>
              <div class="sign-space"></div>
              <p class="sign-name">H. Ruslani, S.Pd</p>
              <p style="margin:0; font-size:9pt;">NIP. 19740512 200212 1 004</p>
            </div>

            <div class="sign-col">
              <p>Cirebon Girang, ${tglCetak}<br><strong>Petugas Pelaksana Pertanian Desa</strong></p>
              <div class="sign-space"></div>
              <p class="sign-name">Bapak Karsiman, S.Sos</p>
              <p style="margin:0; font-size:9pt;">Kaur Pelayanan & Ketahanan Pangan</p>
            </div>
          </div>

          <div class="meta-print">
            <span>Dicetak otomatis melalui Platform SI PADI Desa Cirebon Girang</span>
            <span>Waktu: ${new Date().toLocaleString('id-ID')}</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `)
      printWin.document.close()
    } catch (err) {
      console.error('Gagal mencetak dokumen PDF:', err)
      alert('Gagal menyiapkan jendela cetak PDF.')
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportExcel}
        disabled={isExportingExcel || data.length === 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition shadow-2xs disabled:opacity-50"
        title="Unduh data dalam format file Excel (.CSV)"
      >
        {isExportingExcel ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={14} className="text-emerald-700" />
        )}
        <span>Unduh Excel</span>
      </button>

      <button
        onClick={handleExportPdf}
        disabled={isExportingPdf || data.length === 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 border border-slate-700 transition shadow-2xs disabled:opacity-50"
        title="Cetak atau unduh dokumen laporan resmi dalam format PDF ber-kop surat"
      >
        {isExportingPdf ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Printer size={14} className="text-slate-200" />
        )}
        <span>Cetak / PDF</span>
      </button>
    </div>
  )
}
