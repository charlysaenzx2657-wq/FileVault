/**
 * download.js — FileVault download logic
 * No download limit: a token can be used unlimited times.
 */

// ── Auto-format token input as XXXX-XXXX-XXXX ──
function formatTokenInput(input) {
  let raw = input.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (raw.length > 12) raw = raw.slice(0, 12);

  const parts = [];
  for (let i = 0; i < raw.length; i += 4) {
    parts.push(raw.slice(i, i + 4));
  }

  const formatted = parts.join('-');
  input.value = formatted;

  // Reset UI on new input
  document.getElementById('downloadError').classList.remove('visible');
  document.getElementById('downloadSuccess').classList.remove('visible');
  document.getElementById('fileFoundBox').classList.remove('visible');
  document.getElementById('fileFoundBox').style.display = 'none';
}

// ── Verify token and trigger download ──
function verifyToken() {
  const raw    = document.getElementById('tokenInputField').value.trim().toUpperCase();
  const errEl  = document.getElementById('downloadError');
  const succEl = document.getElementById('downloadSuccess');
  const foundBox = document.getElementById('fileFoundBox');

  errEl.classList.remove('visible');
  succEl.classList.remove('visible');
  foundBox.style.display = 'none';
  foundBox.classList.remove('visible');

  // Validation
  if (!raw) {
    errEl.textContent = '✕ Por favor introduce un token de acceso.';
    errEl.classList.add('visible');
    return;
  }

  const tokenPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!tokenPattern.test(raw)) {
    errEl.textContent = '✕ Formato de token inválido. Debe ser XXXX-XXXX-XXXX.';
    errEl.classList.add('visible');
    return;
  }

  // Look up in vault
  const file = Vault.get(raw);

  if (!file) {
    errEl.textContent = '✕ Token no encontrado. Comprueba que lo introdujiste correctamente.';
    errEl.classList.add('visible');
    return;
  }

  // Show file info
  document.getElementById('foundIcon').textContent = getFileIcon(file.type);
  document.getElementById('foundFileName').textContent = file.name;
  document.getElementById('foundFileSize').textContent =
    `${fmtSize(file.size)} · ${file.downloads + 1} descarga${file.downloads + 1 !== 1 ? 's' : ''} (sin límite)`;

  foundBox.style.display = 'block';
  foundBox.classList.add('visible');

  succEl.textContent = `✓ Token válido. Descargando "${file.name}"...`;
  succEl.classList.add('visible');

  // Increment download count (no restriction)
  Vault.incrementDownloads(raw);

  // Trigger browser download
  triggerDownload(file.data, file.name);
}

// ── Trigger file download ──
function triggerDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 500);
}
