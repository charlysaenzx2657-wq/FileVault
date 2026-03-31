/**
 * vault.js — FileVault con Supabase backend
 */

const SUPABASE_URL = 'https://ivhylffalqpbzusiaccc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aHlsZmZhbHFwYnp1c2lhY2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTA4MDIsImV4cCI6MjA5MDQ4NjgwMn0.NSV2cHfjaNY7jch-yI6O8owUuItM4ZEne5gE_hSyXA8';
const BUCKET_NAME  = 'filevault-files';

const _headers = () => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
});

function fmtSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function getFileIcon(type) {
  if (!type) return '📄';
  if (type.startsWith('image/'))  return '🖼️';
  if (type.startsWith('video/'))  return '🎬';
  if (type.startsWith('audio/'))  return '🎵';
  if (type.includes('pdf'))       return '📕';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦';
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('text/')) return '📃';
  return '📄';
}

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return `${seg()}-${seg()}-${seg()}`;
}

const Vault = {

  async store(token, file, onProgress) {
    const filePath = `${token}/${file.name}`;

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`);
      xhr.setRequestHeader('apikey', SUPABASE_KEY);
      xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 88));
      };
      xhr.onload = () => (xhr.status === 200 || xhr.status === 201) ? resolve() : reject(new Error(xhr.responseText));
      xhr.onerror = () => reject(new Error('Error de red'));
      xhr.send(file);
    });

    if (onProgress) onProgress(94);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/tokens`, {
      method: 'POST',
      headers: _headers(),
      body: JSON.stringify({
        token, file_name: file.name, file_size: file.size,
        file_type: file.type, file_path: filePath, downloads: 0,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    if (onProgress) onProgress(100);
    return true;
  },

  async get(token) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tokens?token=eq.${encodeURIComponent(token)}&select=*`,
      { headers: _headers() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    const row = rows[0];
    return {
      name: row.file_name,
      size: row.file_size,
      type: row.file_type,
      downloads: row.downloads,
      // Endpoint autenticado para descarga como blob
      downloadUrl: `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${row.file_path}`,
    };
  },

  async incrementDownloads(token) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tokens?token=eq.${encodeURIComponent(token)}&select=downloads`,
      { headers: _headers() }
    );
    if (!res.ok) return;
    const rows = await res.json();
    if (!rows || rows.length === 0) return;
    await fetch(`${SUPABASE_URL}/rest/v1/tokens?token=eq.${encodeURIComponent(token)}`, {
      method: 'PATCH',
      headers: _headers(),
      body: JSON.stringify({ downloads: (rows[0].downloads || 0) + 1 }),
    });
  },
};
