/**
 * upload.js — Subida con Supabase backend
 */

const MAX_FILE_SIZE = 500 * 1024 * 1024;
let selectedFile = null;

const dropzone = document.getElementById('dropzone');
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', (e) => { if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('dragover'); });
dropzone.addEventListener('drop', (e) => {
  e.preventDefault(); dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

function onFileSelect(e) { const file = e.target.files[0]; if (file) processFile(file); }

function processFile(file) {
  document.getElementById('uploadError').classList.remove('visible');
  document.getElementById('resultBox').classList.remove('visible');
  if (file.size > MAX_FILE_SIZE) {
    const e = document.getElementById('uploadError');
    e.textContent = `✕ El archivo supera 500 MB. Tamaño: ${fmtSize(file.size)}`;
    e.classList.add('visible'); return;
  }
  selectedFile = file;
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = `${fmtSize(file.size)} · ${file.type || 'desconocido'}`;
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

async function uploadFile() {
  if (!selectedFile) return;
  const btn = document.getElementById('uploadBtn');
  const progressWrap = document.getElementById('progressWrap');
  const progressFill = document.getElementById('progressFill');
  const progressPct  = document.getElementById('progressPct');
  const progressStat = document.getElementById('progressStatus');
  const errEl = document.getElementById('uploadError');

  btn.disabled = true;
  btn.querySelector('span').textContent = 'Subiendo...';
  progressWrap.classList.add('visible');
  errEl.classList.remove('visible');

  try {
    const token = generateToken();
    await Vault.store(token, selectedFile, (pct) => {
      progressFill.style.width = pct + '%';
      progressPct.textContent = pct + '%';
      progressStat.textContent = pct < 90 ? 'Subiendo archivo...' : pct < 100 ? 'Guardando token...' : '¡Listo!';
    });
    document.getElementById('tokenValue').textContent = token;
    document.getElementById('resultFileName').textContent = selectedFile.name;
    document.getElementById('resultBox').classList.add('visible');
  } catch (err) {
    errEl.textContent = `✕ Error: ${err.message}`;
    errEl.classList.add('visible');
  } finally {
    progressWrap.classList.remove('visible');
    progressFill.style.width = '0%';
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Generar token y subir archivo';
  }
}

function copyToken() {
  const token = document.getElementById('tokenValue').textContent;
  navigator.clipboard.writeText(token).then(() => {
    const btn = document.getElementById('copyTokenBtn');
    btn.textContent = '✓ Copiado'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
  });
}

function updateStats() {}
