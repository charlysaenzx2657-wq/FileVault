/**
 * download.js — Descarga forzada via blob con auth de Supabase
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

    succEl.textContent = `✓ Token válido. Preparando descarga...`;
    succEl.classList.add('visible');

    await Vault.incrementDownloads(raw);

    // Descargar el archivo como blob usando las credenciales de Supabase
    succEl.textContent = `⏳ Descargando "${file.name}"... espera`;

    const response = await fetch(file.downloadUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });

    if (!response.ok) throw new Error('No se pudo obtener el archivo');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 2000);

    succEl.textContent = `✓ "${file.name}" descargado correctamente`;

  } catch (err) {
    errEl.textContent = `✕ Error: ${err.message}`;
    errEl.classList.add('visible');
  } finally {
    btn.querySelector('span').textContent = 'Verificar token y descargar';
    btn.disabled = false;
  }
}
