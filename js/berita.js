// Default Data Berita Statis
const DEFAULT_NEWS = [
  {
    id: 107,
    title: "Upacara Bendera Rutin Siswa SMK NUFA",
    excerpt: "Seluruh siswa dan guru SMK NUFA CITRA MANDIRI mengikuti upacara bendera dengan khidmat sebagai bentuk penguatan karakter disiplin dan cinta tanah air.",
    category: "Kegiatan",
    badgeClass: "badge-primary",
    image: "assets/images/fotoselesaiupacara.jpeg",
    icon: null,
    iconColor: null
  },
  {
    id: 108,
    title: "Peringatan Hari Guru Nasional",
    excerpt: "SMK NUFA CITRA MANDIRI merayakan Hari Guru Nasional dengan penuh kebanggaan. Para siswa memberikan apresiasi kepada seluruh tenaga pengajar yang telah berdedikasi.",
    category: "Kegiatan",
    badgeClass: "badge-gold",
    image: "assets/images/Hariguru.jpeg",
    icon: null,
    iconColor: null
  },
  {
    id: 109,
    title: "Dedikasi Para Guru Penggerak SMK NUFA",
    excerpt: "Guru-guru berpengalaman dan berdedikasi tinggi menjadi tulang punggung kualitas pendidikan di SMK NUFA CITRA MANDIRI setiap harinya.",
    category: "Profil",
    badgeClass: "badge-accent",
    image: "assets/images/guru.png",
    icon: null,
    iconColor: null
  },
  {
    id: 110,
    title: "Pelepasan Siswa Kelas XII — Selamat Menempuh Babak Baru!",
    excerpt: "Momen haru dan penuh syukur dalam acara pelepasan siswa kelas XII SMK NUFA CITRA MANDIRI. Semangat dan doa terbaik mengiringi langkah para lulusan menuju masa depan.",
    category: "Kegiatan",
    badgeClass: "badge-primary",
    image: "assets/images/pelepasankelas12.jpeg",
    icon: null,
    iconColor: null
  }
];

// Cache version — naikkan angka ini setiap kali DEFAULT_NEWS berubah
const NEWS_VERSION = 3;

// Initialize localStorage if empty or outdated
function getLocalNews() {
  const savedVersion = parseInt(localStorage.getItem('nufaNewsVersion') || '0');
  let data = JSON.parse(localStorage.getItem('nufaNews'));
  if (!data || !Array.isArray(data) || data.length === 0 || savedVersion < NEWS_VERSION) {
      data = DEFAULT_NEWS;
      localStorage.setItem('nufaNews', JSON.stringify(data));
      localStorage.setItem('nufaNewsVersion', NEWS_VERSION);
  }
  return data;
}

// Konversi Google Drive share URL ke URL thumbnail yang bisa di-embed
function toDriveEmbedUrl(url) {
  if (!url) return null;
  // Sudah format thumbnail, biarkan
  if (url.includes('drive.google.com/thumbnail')) return url;
  // Extract file ID dari berbagai format URL Drive
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) {
    // Gunakan thumbnail API — paling reliable untuk embed gambar Drive
    return 'https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w800';
  }
  return url;
}

// Mapping category ke badgeClass untuk data dari GAS
function getCatBadge(category) {
  const map = { 'Kegiatan':'badge-accent','Prestasi':'badge-gold','Event':'badge-primary','Pengumuman':'badge-primary','Kerjasama':'badge-accent','Profil':'badge-accent' };
  return map[category] || 'badge-primary';
}

// Function to render news
async function renderNews() {
    const container = document.getElementById('newsGridProvider');
    if (!container) return; // Only process if we are on the news page

    container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 3rem;">Memuat berita terbaru...</p>';
    
    let newsData = [];
    
    // Check GAS_URL from config.js
    if (typeof GAS_URL !== 'undefined' && !GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const response = await fetch(GAS_URL + '?action=getNews');
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.length > 0) {
          // Gabungkan berita dari admin (GAS) + berita default, hindari duplikat by id
          const gasIds = new Set(result.data.map(n => String(n.id)));
          const filtered = DEFAULT_NEWS.filter(n => !gasIds.has(String(n.id)));
          newsData = [...result.data, ...filtered];
        } else {
          console.info("Google Sheets kosong, memuat berita default.");
          newsData = DEFAULT_NEWS;
        }
      } catch(err) {
        console.warn("Koneksi ke server gagal, memuat berita lokal.");
        newsData = DEFAULT_NEWS;
      }
    } else {
      newsData = DEFAULT_NEWS;
    }

    container.innerHTML = '';
    
    // Reverse sort array to have newest item (highest ID) first
    const sortedNews = [...newsData].sort((a, b) => b.id - a.id);

    if (sortedNews.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--gray-500); padding: 3rem;">Belum ada berita yang tersedia</p>`;
        return;
    }

    sortedNews.forEach((news, idx) => {
        let mediaHtml = '';
        if (news.image) {
            const imgUrl = toDriveEmbedUrl(news.image);
            mediaHtml = `<div class="news-img"><img src="${imgUrl}" alt="${news.title}" onerror="this.style.display='none';"></div>`;
        } else if (news.icon) {
            let colorCls = news.iconColor ? ` ${news.iconColor}` : '';
            mediaHtml = `<div class="news-img news-thumb-icon${colorCls}" aria-hidden="true">
                            <i data-lucide="${news.icon}" class="icon-lucide"></i>
                         </div>`;
        } else {
            mediaHtml = `<div class="news-img"><img src="assets/images/foto sekolah.jpg" alt="News Image"></div>`;
        }

        const delay = (idx % 2 === 0) ? '' : ' delay-1';

        const html = `
          <div class="news-card reveal${delay} visible">
            ${mediaHtml}
            <div class="news-body">
              <div class="news-meta">
                <span class="badge ${news.badgeClass || getCatBadge(news.category)}">${news.category || 'Berita'}</span>
              </div>
              <h4>${news.title}</h4>
              <p>${news.excerpt}</p>
            </div>
          </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
    });

    // Make sure dynamically inserted Lucide icons render
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

// Execute on load
document.addEventListener('DOMContentLoaded', () => {
    // If not triggered by dom load for some reason, ensure render happens
    renderNews();
});

// Since main.js might execute lucide.createIcons() before dynamic insertion,
// we also call renderNews directly right now so it renders synchronously.
renderNews();
