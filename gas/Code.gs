// ============================================================
// SMK NUFA CITRA MANDIRI - Google Apps Script (Code.gs)
// Backend: Simpan data ke Google Sheets & upload file ke Drive
// ============================================================

// ──────────────────────────────────────────────────────────────
// KONFIGURASI — GANTI dengan ID Spreadsheet & Folder Drive kamu
// ──────────────────────────────────────────────────────────────
var CONFIG = {
  SPREADSHEET_ID : '1Zs2nZn6Gw4nL49CcPUzz2PPOwqZk26LLhzCongimm-c',   // ID Google Sheets
  SHEET_NAME     : 'Data PPDB',                     // Nama sheet tab PPDB
  SHEET_BERITA   : 'Data Berita',                   // Nama sheet tab Berita
  FOLDER_ID      : '1NxeWggCR81KsirMrIYnXOodMq9DrEGaP',  // ID folder Drive
};

// ── Header kolom Google Sheets ────────────────────────────────
var HEADERS_PPDB = [
  'ID Pendaftaran',
  'Timestamp',
  'Nama Lengkap',
  'NIK',
  'Tempat Lahir',
  'Tanggal Lahir',
  'Jenis Kelamin',
  'Alamat',
  'Asal Sekolah',
  'Nomor HP',
  'Pilihan Jurusan',
  'Link Foto',
  'Link KK',
  'Link Ijazah/SKL',
  'Status',
];

var HEADERS_BERITA = [
  'ID',
  'Timestamp',
  'Judul',
  'Kategori',
  'Deskripsi',
  'Link Gambar'
];

// ── Entry point utama (POST request) ────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Routing berdasarkan Action
    if (data.action === 'addNews') {
      return handleAddNews(data);
    } else if (data.action === 'deleteNews') {
      return handleDeleteNews(data);
    } else {
      // Default fallback ke PPDB
      return handlePPDB(data);
    }
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Handler PPDB ──────────────────────────────────────────────
function handlePPDB(data) {
  var regId   = generateRegistrationId();
  var folder  = DriveApp.getFolderById(CONFIG.FOLDER_ID);

  // Buat sub-folder untuk pendaftar ini
  var subFolder = folder.createFolder(regId + ' - ' + data.namaLengkap);

  // Upload file-file
  var linkFoto   = uploadFile(data.files.foto,   subFolder, 'FOTO_'   + regId);
  var linkKK     = uploadFile(data.files.kk,     subFolder, 'KK_'     + regId);
  var linkIjazah = uploadFile(data.files.ijazah, subFolder, 'IJAZAH_' + regId);

  // Simpan ke Google Sheets
  var row = [
    regId,
    data.timestamp,
    data.namaLengkap,
    data.nik,
    data.tempatLahir,
    data.tanggalLahir,
    data.jenisKelamin,
    data.alamat,
    data.asalSekolah,
    data.nomorHP,
    data.jurusan,
    linkFoto,
    linkKK,
    linkIjazah,
    'Menunggu Verifikasi',
  ];

  appendToSheet(CONFIG.SHEET_NAME, HEADERS_PPDB, row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', registrationId: regId }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Handler Add News ──────────────────────────────────────────
function handleAddNews(data) {
  var folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  
  // Upload Gambar Berita (jika ada)
  var linkGambar = null;
  if (data.image) {
    // data.image is expected to be { base64: "...", type: "image/jpeg", name: "foto.jpg" }
    linkGambar = uploadFile(data.image, folder, 'NEWS_' + data.id);
  }
  
  var row = [
    data.id,
    new Date().toISOString(),
    data.title,
    data.category,
    data.excerpt,
    linkGambar
  ];
  
  appendToSheet(CONFIG.SHEET_BERITA, HEADERS_BERITA, row);
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', message: 'Berita berhasil disimpan' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Handler Delete News ───────────────────────────────────────
function handleDeleteNews(data) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_BERITA);
  
  if (!sheet) {
    throw new Error('Sheet Berita tidak ditemukan');
  }
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Cari baris yang ID-nya cocok (dimulai dari index 1 karena header di index 0)
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    // Ensure both are strings or numbers for comparison
    if (values[i][0].toString() === data.id.toString()) {
      rowIndex = i + 1; // getValues is 0-indexed, but deleteRow is 1-indexed
      break;
    }
  }
  
  if (rowIndex > -1) {
    sheet.deleteRow(rowIndex);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Berita berhasil dihapus' }))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    throw new Error('Berita dengan ID tersebut tidak ditemukan');
  }
}

// ── Entry point GET ───────────────────────────────────────────
function doGet(e) {
  // Setup CORS dan return data JSON
  if (e.parameter.action === 'getNews') {
    return handleGetNews();
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'running', app: 'SMK NUFA CITRA MANDIRI BACKEND' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Handler Get News ──────────────────────────────────────────
function handleGetNews() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.SHEET_BERITA);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var values = sheet.getDataRange().getValues();
    var newsArray = [];
    
    // Skip header row (index 0)
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0]) continue; // Skip baris kosong
      
      newsArray.push({
        id: row[0],
        timestamp: row[1],
        title: row[2],
        category: row[3],
        excerpt: row[4],
        image: row[5] || null
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: newsArray }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Generate ID Pendaftaran ───────────────────────────────────
function generateRegistrationId() {
  var year  = new Date().getFullYear();
  var rand  = Math.floor(10000 + Math.random() * 90000);
  return 'PPDB-' + year + '-' + rand;
}

// ── Upload file ke Drive dan return link shareable ────────────
function uploadFile(fileData, folder, fileName) {
  if (!fileData || !fileData.base64) return '-';

  try {
    var bytes    = Utilities.base64Decode(fileData.base64);
    var blob     = Utilities.newBlob(bytes, fileData.type, fileName + getExtension(fileData.name));
    var file     = folder.createFile(blob);

    // Set sharing: siapa pun dengan link bisa melihat
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (e) {
    return 'Error: ' + e.message;
  }
}

// ── Ambil ekstensi file ───────────────────────────────────────
function getExtension(filename) {
  if (!filename) return '';
  var parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
}

// ── Tambah baris ke Google Sheets ────────────────────────────
function appendToSheet(sheetName, headersArray, row) {
  var ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  // Buat sheet baru + header jika belum ada
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headersArray);

    // Format header
    var headerRange = sheet.getRange(1, 1, 1, headersArray.length);
    headerRange.setBackground('#1565C0')
               .setFontColor('#FFFFFF')
               .setFontWeight('bold')
               .setFontSize(10)
               .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow(row);
  // Auto-resize kolom
  sheet.autoResizeColumns(1, headersArray.length);
}
