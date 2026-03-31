/**
 * download.js — Descarga sin límite con Supabase backend
 */

function formatTokenInput(input) {
  let raw = input.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (raw.length > 12) raw = raw.slice(0, 12);
  const parts = [];
  for (let i = 0; i < raw.length; i += 4) parts.push(raw.slice(i, i + 4));
  input.value = parts.join('-');
  document.getElementById('downloadError').classList.remove('visible');
  document.getElementById('downloadSuccess').classList.remove('visible');
  const fb = document.getElementById('fileFoundBox');
  fb.style.display = 'none'; fb.classList.remove('visible');
}

async function verifyToken() {
  const raw      = document.getElementById('tokenInputField').value.trim().toUpperCase();
  const errEl    = document.getElementById('downloadError');
  const succEl   = document.getElementById('downloadSuccess');
  const foundBox = document.getElementById('fileFoundBox');
  const btn      = document.querySelector('.btn-secondary');

  errEl.classList.remove('visible');
  succEl.classList.remove('visible');
  foundBox.style.display = 'none';
  foundBox.classList.remove('visible');

  if (!raw) {
    errEl.textContent = '✕ Introduce un token de acceso.';
    errEl.classList.add('visible'); return;
  }

  const tokenPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!tokenPattern.test(raw)) {
    errEl.textContent = '✕ Formato inválido. Debe ser XXXX-XXXX-XXXX.';
    errEl.classList.add('visible'); return;
  }

  btn.querySelector('span').textContent = 'Buscando...';
  btn.disabled = true;

  try {
    const file = await Vault.get(raw);

    if (!file) {
      errEl.textContent = '✕ Token no encontrado. Comprueba que está bien escrito.';
      errEl.classList.add('visible'); return;
    }

    document.getElementById('foundIcon').textContent = getFileIcon(file.type);
    document.getElementById('foundFileName').textContent = file.name;
    document.getElementById('foundFileSize').textContent =
      `${fmtSize(file.size)} · ${file.downloads + 1} descarga(s) · sin límite`;

    foundBox.style.display = 'block';
    foundBox.classList.add('visible');

    succEl.textContent = `✓ Token válido. Descargando "${file.name}"...`;
    succEl.classList.add('visible');

    await Vault.incrementDownloads(raw);

    // Usar parámetro ?download= de Supabase para forzar descarga
    const downloadUrl = file.downloadUrl + '?download=' + encodeURIComponent(file.name);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 500);

  } catch (err) {
    errEl.textContent = `✕ Error: ${err.message}`;
    errEl.classList.add('visible');
  } finally {
    btn.querySelector('span').textContent = 'Verificar token y descargar';
    btn.disabled = false;
  }
}
