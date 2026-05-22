
let currentStep = 1;
const totalSteps = 3;
const uploadedFiles = { foto: null, kk: null, ijazah: null };

const stepEls = document.querySelectorAll('.step');
const stepLines = document.querySelectorAll('.step-line');
const formSteps = document.querySelectorAll('.form-step');
const btnSubmit = document.getElementById('btnSubmit');
const successOverlay = document.getElementById('successOverlay');
const regIdEl = document.getElementById('regId');
const btnPrint = document.getElementById('btnPrint');
const btnClose = document.getElementById('btnCloseSuccess');
const formCard = document.querySelector('.ppdb-form-card');

function goToStep(n) {
  if (n < 1 || n > totalSteps) return;

  formSteps.forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
  });

  stepEls.forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < n) s.classList.add('done');
    else if (i + 1 === n) s.classList.add('active');
  });
  stepLines.forEach((l, i) => {
    l.classList.toggle('done', i + 1 < n);
  });

  currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (formCard) {
  formCard.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-ppdb-nav]');
    if (!nav) return;
    const act = nav.dataset.ppdbNav;
    if (act === 'prev') {
      goToStep(currentStep - 1);
      return;
    }
    if (act === 'next') {
      if (currentStep === 2 && typeof updateSummary === 'function') {
        updateSummary();
      }
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    }
  });
}

function validateStep(step) {
  let valid = true;
  const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (!stepEl) return true;

  stepEl.querySelectorAll('[required]').forEach((field) => {
    clearError(field);
    if (!field.value.trim()) {
      showError(field, 'Field ini wajib diisi');
      valid = false;
    } else if (field.type === 'tel' && !/^0[0-9]{8,12}$/.test(field.value.trim())) {
      showError(field, 'Format nomor HP tidak valid (contoh: 08123456789)');
      valid = false;
    } else if (field.id === 'nik' && !/^[0-9]{16}$/.test(field.value.trim())) {
      showError(field, 'NIK harus 16 digit angka');
      valid = false;
    }
  });

  if (step === 3) {
    ['foto', 'kk', 'ijazah'].forEach((key) => {
      const area = document.getElementById(`upload-${key}`);
      if (!uploadedFiles[key]) {
        area?.classList.add('error-border');
        valid = false;
        showToast('Semua dokumen wajib diupload!', 'error');
      }
    });
  }

  return valid;
}

function showError(field, msg) {
  field.classList.add('error');
  let errEl = field.nextElementSibling;
  if (!errEl || !errEl.classList.contains('form-error')) {
    errEl = document.createElement('span');
    errEl.className = 'form-error';
    field.insertAdjacentElement('afterend', errEl);
  }
  errEl.textContent = msg;
  errEl.classList.add('show');
}

function clearError(field) {
  field.classList.remove('error');
  const errEl = field.nextElementSibling;
  if (errEl?.classList.contains('form-error')) errEl.classList.remove('show');
}

document.querySelectorAll('.form-control').forEach((f) => {
  f.addEventListener('input', () => clearError(f));
});

function initUploadPreviews() {
  [
    { input: 'inputFoto', key: 'foto', previewId: 'previewFoto', areaId: 'upload-foto' },
    { input: 'inputKK', key: 'kk', previewId: 'previewKK', areaId: 'upload-kk' },
    { input: 'inputIjazah', key: 'ijazah', previewId: 'previewIjazah', areaId: 'upload-ijazah' },
  ].forEach(({ input, key, previewId, areaId }) => {
    const inputEl = document.getElementById(input);
    const previewEl = document.getElementById(previewId);
    const areaEl = document.getElementById(areaId);

    inputEl?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5 MB', 'error');
        return;
      }

      uploadedFiles[key] = file;
      areaEl?.classList.add('has-file');
      areaEl?.classList.remove('error-border');

      const reader = new FileReader();
      reader.onload = ({ target }) => {
        if (previewEl) {
          const imgPart = file.type.startsWith('image/')
            ? `<img class="file-thumb" src="${target.result}" alt="Pratinjau berkas">`
            : '<span class="file-preview-pdf"><i data-lucide="file-text" class="icon-lucide" aria-hidden="true"></i></span>';
          previewEl.innerHTML = `
            <div class="file-preview">
              ${imgPart}
              <div>
                <div class="file-preview-name">${file.name}</div>
                <div class="file-preview-size">${(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <span class="file-preview-ok" aria-hidden="true">OK</span>
            </div>`;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      };
      reader.readAsDataURL(file);
    });
  });
}
initUploadPreviews();

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

btnSubmit?.addEventListener('click', async () => {
  if (!validateStep(currentStep)) return;

  setLoading(true);

  try {
    const formData = {
      namaLengkap: document.getElementById('namaLengkap')?.value.trim(),
      nik: document.getElementById('nik')?.value.trim(),
      tempatLahir: document.getElementById('tempatLahir')?.value.trim(),
      tanggalLahir: document.getElementById('tanggalLahir')?.value,
      jenisKelamin: document.getElementById('jenisKelamin')?.value,
      alamat: document.getElementById('alamat')?.value.trim(),
      asalSekolah: document.getElementById('asalSekolah')?.value.trim(),
      nomorHP: document.getElementById('nomorHP')?.value.trim(),
      jurusan: document.getElementById('jurusan')?.value,
      timestamp: new Date().toLocaleString('id-ID'),
    };

    const files = {};
    for (const [k, file] of Object.entries(uploadedFiles)) {
      if (file) {
        files[k] = {
          base64: await fileToBase64(file),
          name: file.name,
          type: file.type,
        };
      }
    }

    const payload = { ...formData, files };

    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === 'success') {
      showSuccess(result.registrationId);
      localStorage.setItem(
        'ppdbData',
        JSON.stringify({
          ...formData,
          registrationId: result.registrationId,
        })
      );
    } else {
      throw new Error(result.message || 'Terjadi kesalahan saat mengirim data');
    }
  } catch (err) {
    if (GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
      const demoId = 'PPDB-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
      const formData = {
        namaLengkap: document.getElementById('namaLengkap')?.value.trim(),
        nik: document.getElementById('nik')?.value.trim(),
        tempatLahir: document.getElementById('tempatLahir')?.value.trim(),
        tanggalLahir: document.getElementById('tanggalLahir')?.value,
        jenisKelamin: document.getElementById('jenisKelamin')?.value,
        alamat: document.getElementById('alamat')?.value.trim(),
        asalSekolah: document.getElementById('asalSekolah')?.value.trim(),
        nomorHP: document.getElementById('nomorHP')?.value.trim(),
        jurusan: document.getElementById('jurusan')?.value,
        timestamp: new Date().toLocaleString('id-ID'),
      };
      localStorage.setItem('ppdbData', JSON.stringify({ ...formData, registrationId: demoId }));
      showSuccess(demoId);
    } else {
      showToast('Gagal mengirim data: ' + err.message, 'error');
    }
  } finally {
    setLoading(false);
  }
});

function setLoading(on) {
  if (!btnSubmit) return;
  btnSubmit.disabled = on;
  if (on) {
    btnSubmit.innerHTML =
      '<span class="btn-loading-inner"><svg class="btn-loading-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Mengirim…</span>';
  } else {
    btnSubmit.textContent = 'Kirim pendaftaran';
  }
}

function showSuccess(id) {
  if (regIdEl) regIdEl.textContent = id;
  successOverlay?.classList.add('show');
  document.body.style.overflow = 'hidden';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

btnPrint?.addEventListener('click', () => {
  window.open('bukti-pendaftaran.html', '_blank');
});

btnClose?.addEventListener('click', () => {
  successOverlay?.classList.remove('show');
  document.body.style.overflow = '';
});

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast-ppdb toast-ppdb--' + (type === 'error' ? 'error' : type === 'success' ? 'success' : 'info');
  toast.textContent = msg;
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

goToStep(1);
