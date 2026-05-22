// Ambil Elemen UI
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const userInfo = document.getElementById('userInfo');
const formLogin = document.getElementById('formLogin');
const btnLogout = document.getElementById('btnLogout');
const adminToast = document.getElementById('adminToast');
const formNews = document.getElementById('formNews');
const imgInput = document.getElementById('newsImage');
const imgPreview = document.getElementById('imagePreview');
const newsTableBody = document.getElementById('newsTableBody');
const btnSaveNews = document.getElementById('btnSaveNews');

// Utils: Tampilkan Pesan Toast
function showMessage(msg) {
  adminToast.textContent = msg;
  adminToast.classList.add('show');
  setTimeout(() => {
    adminToast.classList.remove('show');
  }, 3000);
}

// Cek status login
function checkAuth() {
  if (sessionStorage.getItem('adminLogged') === 'true') {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    userInfo.style.display = 'flex';
    loadTableData();
  } else {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
    userInfo.style.display = 'none';
  }
}

// Proses Login
formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  
  if (u === 'admin' && p === 'admin123') {
    sessionStorage.setItem('adminLogged', 'true');
    showMessage('Login Berhasil!');
    checkAuth();
  } else {
    showMessage('Username atau Password yang anda masukkan salah.');
  }
});

// Proses Logout
btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('adminLogged');
  window.location.reload();
});

// Ambil data berita dari LocalStorage (Fallback)
function getLocalNews() {
  let data = localStorage.getItem('nufaNews');
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

function saveLocalNews(newsArray) {
  localStorage.setItem('nufaNews', JSON.stringify(newsArray));
}

// Rentender Tabel Berita (Fetch dari GAS atau Fallback Local)
async function loadTableData() {
  newsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--muted); padding: 2rem;">Memuat data...</td></tr>';
  
  let newsItem = [];
  
  // Jika URL AppScript diisi, gunakan Database Google Sheets
  if (typeof GAS_URL !== 'undefined' && !GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
    try {
      const response = await fetch(GAS_URL + '?action=getNews');
      const result = await response.json();
      if (result.status === 'success') {
        newsItem = result.data;
      }
    } catch(err) {
      console.warn("Koneksi gagal, beralih ke Mode Offline (LocalStorage)");
      newsItem = getLocalNews();
    }
  } else {
    newsItem = getLocalNews();
  }
  
  newsTableBody.innerHTML = '';
  
  if (newsItem.length === 0) {
    newsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--muted); padding: 2rem;">Tidak ada berita ditemukan</td></tr>';
    return;
  }
  
  // Urutkan dari terbaru ke terlama
  const sorted = [...newsItem].sort((a,b) => b.id - a.id);
  
  sorted.forEach((n) => {
    let imgCell = '';
    if (n.image) {
      // Konversi Drive URL ke thumbnail yang bisa di-embed
      let imgUrl = n.image;
      const m = imgUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || imgUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (m && !imgUrl.includes('thumbnail')) {
        imgUrl = 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w100';
      }
      imgCell = `<img src="${imgUrl}" class="thumb" alt="thumb">`;
    } else {
      imgCell = `<div style="width:50px; height:50px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; border-radius:4px; font-size:10px;">Icon</div>`;
    }
    
    // Tentukan badge otomatis jika kosong (biasanya data lama)
    const badge = n.badgeClass || getBadgeClass(n.category);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${imgCell}</td>
      <td>
        <div style="font-weight: 600; font-size: 0.95rem;">${n.title}</div>
        <div style="font-size: 0.8rem; color: var(--muted); margin-top: 4px; display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${n.excerpt}</div>
      </td>
      <td><span class="badge ${badge}">${n.category}</span></td>
      <td style="text-align: center;">
        <button class="btn btn-outline-primary btn-sm btn-delete" data-id="${n.id}" style="color: #dc2626; border-color: #fca5a5; padding: 0.4rem 0.8rem;">Hapus</button>
      </td>
    `;
    newsTableBody.appendChild(row);
  });
  
  // Set Listener ke Tombol Hapus
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      deleteNews(id);
    });
  });
}

// Auto Preview Gambar Sebelum di Upload
let base64Image = null;
let selectedFile = null;

imgInput.addEventListener('change', function(e) {
  selectedFile = e.target.files[0];
  if (!selectedFile) {
    base64Image = null;
    imgPreview.style.display = 'none';
    imgPreview.src = '';
    return;
  }
  
  if (selectedFile.size > 2 * 1024 * 1024) {
    showMessage('Ukuran foto terlalu besar. Maksimal 2MB.');
    this.value = '';
    selectedFile = null;
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    base64Image = evt.target.result;
    imgPreview.src = base64Image;
    imgPreview.style.display = 'block';
  };
  reader.readAsDataURL(selectedFile);
});

// Penentuan Warna Badge
function getBadgeClass(cat) {
  switch (cat) {
    case 'Kegiatan': return 'badge-accent';
    case 'Prestasi': return 'badge-gold';
    case 'Event': return 'badge-primary';
    case 'Kerjasama': return 'badge-accent';
    default: return 'badge-primary';
  }
}

// Proses Menyimpan Berita Baru
formNews.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('newsTitle').value;
  const category = document.getElementById('newsCategory').value;
  const excerpt = document.getElementById('newsDesc').value;
  
  if (!base64Image) {
    showMessage('Gambar wajib diupload!');
    return;
  }
  
  btnSaveNews.textContent = 'Menyimpan...';
  btnSaveNews.disabled = true;
  
  const id = Date.now();
  
  // Jika URL AppScript diset, kita kirim ke Backend Google Sheets
  if (typeof GAS_URL !== 'undefined' && !GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
    try {
      const payload = {
        action: 'addNews',
        id: id,
        title: title,
        category: category,
        excerpt: excerpt,
        image: {
          base64: base64Image.split(',')[1],
          name: selectedFile.name,
          type: selectedFile.type
        }
      };
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        showMessage('Berita diterbitkan ke Database!');
      } else {
        throw new Error('Gagal menyimpan ke DB');
      }
    } catch(err) {
      console.error(err);
      saveToLocalFallback(id, title, category, excerpt, base64Image);
      showMessage('Disimpan offline (Gagal ke Database)');
    }
  } else {
    // Mode Offline Fallback
    saveToLocalFallback(id, title, category, excerpt, base64Image);
    showMessage('Berita berhasil diterbitkan (Mode Lokal)');
  }
  
  // Reset Form
  formNews.reset();
  base64Image = null;
  selectedFile = null;
  imgPreview.style.display = 'none';
  imgPreview.src = '';
  btnSaveNews.textContent = 'Simpan Terbitkan';
  btnSaveNews.disabled = false;
  
  loadTableData();
});

function saveToLocalFallback(id, title, category, excerpt, img) {
  const newNews = {
    id: id,
    title: title,
    excerpt: excerpt,
    category: category,
    badgeClass: getBadgeClass(category),
    image: img,
    icon: null,
    iconColor: null
  };
  let currentNews = getLocalNews();
  currentNews.push(newNews);
  saveLocalNews(currentNews);
}

// Hapus Berita
async function deleteNews(id) {
  if (!confirm("Apakah anda yakin ingin menghapus berita ini?")) return;
  
  if (typeof GAS_URL !== 'undefined' && !GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'deleteNews', id: id })
      });
      const result = await response.json();
      if (result.status === 'success') {
        showMessage('Berita berhasil dihapus dari Database!');
        loadTableData();
        return;
      }
    } catch(err) {
      console.warn("Gagal menghapus di database, mencoba di local");
    }
  }
  
  // Fallback hapus lokal
  let currentNews = getLocalNews();
  // Ensure strict comparison type matching
  currentNews = currentNews.filter(n => n.id.toString() !== id.toString());
  saveLocalNews(currentNews);
  showMessage('Berita berhasil dihapus (Lokal)!');
  loadTableData();
}

// Initialize Auth Checking
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
