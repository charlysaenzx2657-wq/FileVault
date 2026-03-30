/**
 * upload.js — FileVault upload logic
 * Handles drag & drop, file validation, progress simulation, and token generation.
 */

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

let selectedFile = null;

// ── Drag & drop ──
const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', (e) => {
  if (!dropzone.contains(e.relatedTarget)) {
    dropzone.classList.remove('dragover');
  }
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

// ── File selection ──
function onFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const errEl = document.getElementById('uploadError');
  errEl.classList.remove('visible');
  document.getElementById('resultBox').classList.remove('visible');

  if (file.size > MAX_FILE_SIZE) {
    errEl.textContent = `✕ El archivo supera el límite de 500 MB. Tamaño actual: ${fmtSize(file.size)}`;
    errEl.classList.add('visible');
    return;
  }

  selectedFile = file;
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = `${fmtSize(file.size)} · ${file.type || 'archivo desconocido'}`;
  document.getElementById('fileIcon').textContent = getFileIcon(file.type);
  document.getElementById('fileInfo').classList.add('visible');
  document.getElementById('uploadBtn').disabled = false;
}

function clearFile() {
  selectedFile = null;
  document.getElementById('fileInfo').classList.remove('visible');
  document.getElementById('uploadBtn').disabled = true;
  document.getElementById('resultBox').classList.remove('visible');
  document.getElementById('uploadError').classList.remove('visible');
  document.getElementById('fileInput').value = '';
}

// ── Upload ──
function uploadFile() {
  if (!selectedFile) return;

  const btn          = document.getElementById('uploadBtn');
  const progressWrap = document.getElementById('progressWrap');
  const progressFill = document.getElementById('progressFill');
  const progressPct  = document.getElementById('progressPct');
  const progressStat = document.getElementById('progressStatus');

  btn.disabled = true;
  btn.querySelector('span').textContent = 'Procesando...';
  progressWrap.classList.add('visible');

  // Simulate progress steps
  let pct = 0;
  const steps = [
    { target: 30, label: 'Leyendo archivo...' },
    { target: 60, label: 'Codificando datos...' },
    { target: 90, label: 'Generando token...' },
  ];
  let stepIndex = 0;

  const interval = setInterval(() => {
    const step = steps[stepIndex];
    pct += Math.random() * 12 + 4;
    if (pct >= step.target) {
      pct = step.target;
      progressStat.textContent = step.label;
      stepIndex = Math.min(stepIndex + 1, steps.length - 1);
    }
    progressFill.style.width = pct + '%';
    progressPct.textContent = Math.floor(pct) + '%';
    if (pct >= 90) clearInterval(interval);
  }, 180);

  // Read file as base64
  const reader = new FileReader();

  reader.onload = (e) => {
    clearInterval(interval);
    progressFill.style.width = '100%';
    progressPct.textContent = '100%';
    progressStat.textContent = 'Listo';

    setTimeout(() => {
      const token = generateToken();

      Vault.store(token, {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        data: e.target.result,
      });

      updateStats();

      // Show result
      document.getElementById('tokenValue').textContent = token;
      document.getElementById('resultFileName').textContent = selectedFile.name;
      document.getElementById('resultBox').classList.add('visible');

      progressWrap.classList.remove('visible');
      progressFill.style.width = '0%';
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Generar token y subir archivo';
    }, 400);
  };

  reader.onerror = () => {
    clearInterval(interval);
    const errEl = document.getElementById('uploadError');
    errEl.textContent = '✕ Error al leer el archivo. Inténtalo de nuevo.';
    errEl.classList.add('visible');
    progressWrap.classList.remove('visible');
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Generar token y subir archivo';
  };

  reader.readAsDataURL(selectedFile);
}

// ── Copy token ──
function copyToken() {
  const token = document.getElementById('tokenValue').textContent;
  navigator.clipboard.writeText(token).then(() => {
    const btn = document.getElementById('copyTokenBtn');
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copiar';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback for browsers without clipboard API
    const ta = document.createElement('textarea');
    ta.value = token;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ── Stats ──
function updateStats() {
  document.getElementById('statFiles').textContent = Vault.count();
  document.getElementById('statSize').textContent = fmtSize(Vault.totalSize());
}

// Init stats on load
updateStats();
